import { endOfWeek, formatISO, getDate, isEqual, setDate, startOfWeek } from "date-fns"
import add from "date-fns/add"
import getISODay from "date-fns/getISODay"
import startOfMonth  from "date-fns/startOfMonth"
import areIntervalsOverlapping from "date-fns/areIntervalsOverlapping"
import intervalToDuration from "date-fns/intervalToDuration"
import parse from "date-fns/parse"
import sub from "date-fns/sub"
import { IcsLine } from "./lexer"
import { ICalObject, parseIcs } from "./parser"
import endOfMonth from "date-fns/fp/endOfMonth"
import getDayOfYear from "date-fns/fp/getDayOfYear"
import isValid from "date-fns/fp/isValid"

interface Interval {
  years?: number
  months?: number
  weeks?: number,
  days?: number,
  hours?: number,
  minutes?: number,
  seconds?: number,
}

export interface EventInstance {
  start: Date
  end: Date
  summary: string
  uid: string
  //description: string
}

interface VEvent {
  start: Date
  end: Date

  uid: string
  rid: Date | undefined
  
  movedRecurrences: VEvent[]
  detailRecurrences: VEvent[]
  
  toInstance: () => EventInstance
  getEventsDuringInterval: (start: Date, end: Date) => EventInstance[]
}

export function loadICal(icsText: string) {
  const parsed = parseIcs(icsText)
  const rawEvents = parsed.blocks.VEVENT || []
  const events = rawEvents.map(readRawEvent)

  const groupedEvents = Object.values(groupBy(events, e => e.uid)).map(arr=> {
    const master = arr.find(e => !e.rid)
    if (!master) throw new Error('No master event')
    const movedRecurrences = arr.filter(e => e.rid && !isEqual(e.rid, e.start))
    const detailRecurrences = arr.filter(e => e.rid && isEqual(e.rid, e.start))
    
    Array.prototype.push.apply(master.movedRecurrences, movedRecurrences);
    Array.prototype.push.apply(master.detailRecurrences, detailRecurrences);
    return master
  })
  // console.log('groupedEvents:', groupedEvents)

  const getEventsDuringInterval = (start: Date, end: Date) => {
    return flatten(events.map(e => e.getEventsDuringInterval(start, end)))
  }

  return {
    events,
    getEventsDuringInterval
  }
}

function readRawEvent(rawEvent: ICalObject): VEvent  {
  const start = readMandatoryRawDate(rawEvent.props.DTSTART, 'DTSTART')
  const end = readMandatoryRawDate(rawEvent.props.DTEND, 'DTEND')
  const interval = {start, end}
  const duration = intervalToDuration(interval)
  const rrule = readRRule(rawEvent.props.RRULE, start, duration)
  const exdates = readRawDates(rawEvent.props.EXDATE).map(x => formatISO(x))

  const rid = readOptionalRawDate(rawEvent.props['RECURRENCE-ID'])
  const uid = rawEvent.props.UID.value
  const summary = rawEvent.props.SUMMARY.value

  const movedRecurrences: VEvent[] = []
  const detailRecurrences: VEvent[] = []
  //const description = rawEvent.props.DESCRIPTION.value

  const toInstance: () => EventInstance = () => ({
    start,
    end,
    summary,
    uid,
    //description
  })

  const getEventsDuringInterval = (start: Date, end: Date) => {
    if (rid) return[]

    const intervalFor = {start, end: sub(end, {seconds:1})}
    
    const instance = toInstance()
    const candidates = [instance, ...movedRecurrences.map(mr => mr.toInstance())]

    if (rrule) {
      let nextCandidate = instance
      let loops = 0
      do {
        if (nextCandidate.start > intervalFor.end) break;
        
        const nextCandidates = rrule.func(nextCandidate)
        nextCandidate = nextCandidates[nextCandidates.length-1]


        nextCandidates.forEach(candidate => {

          if (movedRecurrences.some(mr => mr.rid && isEqual(mr.rid, candidate.start))) {
            return
          }

          if (
            rrule.filters.every(f => f(candidate.start)) && 
            !exdates.includes(formatISO(candidate.start)) &&
            candidate.start < rrule.until &&
            candidates.length <= rrule.count
            ){
            candidates.push(candidate)
          }
        })
        if (candidates.length >= rrule.count) break
        if (nextCandidate.start >= rrule.until) break
        if (rrule.skipIf(nextCandidate)) {
          nextCandidate = rrule.skipperFunc(nextCandidate)
        }
        if (loops++ > 1000) throw new Error("Too many loops");
      } while(nextCandidate !== null)
      // console.log('loops:', loops)
    }

   
    
    const validCandidates = candidates.filter(candidate => {
      const interval = {start: candidate.start, end: candidate.end}
      return areIntervalsOverlapping(interval, intervalFor)
    })

    return validCandidates.map(instance => {
      const recurrance = detailRecurrences.find(dr => dr.rid && isEqual(dr.rid, instance.start))
      if (recurrance) return recurrance.toInstance()
      return instance
    })
  }

  return {
    start,
    end,

    uid,
    rid,
    movedRecurrences,
    detailRecurrences,
    
    toInstance,
    getEventsDuringInterval
  }  
}

export function readRRule(rrule: IcsLine, start: Date, eventLength: Interval) {
  if (!rrule) return null
  const parts: {[key: string]: string} = rrule.value.split(';').reduce((acc, c) => {
    const [k, v] = c.split('=')
    return {...acc, [k]: v}
  }, {})

  if (!parts.FREQ) throw new Error("RRULE is missing FREQ");
  const freq = parts.FREQ; delete parts.FREQ
  const byDay = parts.BYDAY; delete parts.BYDAY
  const byMonthDay = parts.BYMONTHDAY; delete parts.BYMONTHDAY
  
  const weekStart = parts.WKST; delete parts.WKST
  
  const interval = parseInt(parts.INTERVAL || '1'); delete parts.INTERVAL
  const count = parseInt(parts.COUNT || `${Number.MAX_SAFE_INTEGER}` ); delete parts.COUNT
  const until = parseIcsDate(parts.UNTIL || '99990101'); delete parts.UNTIL

  const dayOfWeek = getISODay(start)

  type DateFilter = (date: Date) => boolean

  let func: (prev: EventInstance) => EventInstance[]
  let skipIf: (prev: EventInstance) => boolean = () => false
  let skipperFunc: (prev: EventInstance) => EventInstance = prev => prev

  const filters: DateFilter[] = []

  const makeFunc = (repeatIntervals: Interval[]) => (prev:EventInstance): EventInstance[] => {
    return repeatIntervals.map(repeatInterval =>({
      ...prev,
      start: add(prev.start, repeatInterval),
      end: add(prev.end, repeatInterval)
    }))
  }

  if (freq === 'DAILY') {
    func = makeFunc([{days: interval}])
  } else if (freq === 'WEEKLY' && byDay) {
    // const dates = byMonthDay.split(',').map(x=>parseInt(x))
    const matchingDays = daysOfWeek
      .map((dow, i)=>({dow, i:i+1}))
      .filter(({dow}) =>  byDay.includes(dow))
      .map(({i}) => i)
    filters.push(date => {
      const dow = getISODay(date)
      const md = matchingDays
      return md.includes(dow)
    })
    func = makeFunc([{days: 1}])

    skipIf = prev => getDayOfYear(prev.start) === getDayOfYear(endOfWeek(prev.start))
    skipperFunc = prev => {
      const sowDate = getDate(startOfWeek(prev.start))
      const start = add(setDate(prev.start, sowDate),  {weeks: interval})
      return {
        ...prev, 
        start: start,
        end: add(start, eventLength)
      }
    }
  } else if (freq === 'WEEKLY') {
    func = makeFunc([{weeks: interval}])
  } else if (freq === 'MONTHLY' && byMonthDay) {
    const dates = byMonthDay.split(',').map(x=>parseInt(x))
    filters.push(date => dates.includes(getDate(date)))
    func = makeFunc([{days: 1}])

    skipIf = prev => getDayOfYear(prev.start) === getDayOfYear(endOfMonth(prev.start))
    // skipperFunc = prev => ({...prev, 
    //   start: startOfMonth(add(prev.start, {months: interval})),
    //   end: startOfMonth(add(prev.end, {months: interval}))
    // })
    skipperFunc = prev => {
      const somDate = getDate(startOfMonth(prev.start))
      const start = add(setDate(prev.start, somDate),  {months: interval})
      return {
        ...prev, 
        start: start,
        end: add(start, eventLength)
      }
    }
    //func = makeFunc(dates.map(offBy => ({days: offBy})))
  } else if (freq === 'MONTHLY') {
    func = makeFunc([{months: interval}])
  } else throw new Error("Unsupported FREQ:" + freq);
  
  const unusedKeys = Object.keys(parts)
  if (unusedKeys.length > 0) throw new Error("rrule parameters not supported:"+unusedKeys);

  return {
    func,
    skipIf,
    skipperFunc,
    filters,
    count,
    until
  }
}

function parseIcsDate(str: string) {
  if (str.includes('T')) {
    return parse(str, "yyyyMMdd'T'HHmmssX", new Date())
  } else {
    return parse(str, 'yyyyMMdd', new Date())
  }
}

const daysOfWeek = [
  'MO',
  'TU',
  'WE',
  'TH',
  'FR',
  'SA',
  'SU',
]

export function readMandatoryRawDate(rawEvents: IcsLine, name: string) {
  if (!rawEvents) throw new Error('Missing mandatory var:'+name) 
  const date = readRawDate(rawEvents)
  if (!isValid(date)) throw new Error(name + ' is invalid. Read:'+ JSON.stringify(rawEvents))
  return date
}

export function readRawDates(firstLine: IcsLine) {
  return allLines(firstLine).map(readRawDate)
}

function readOptionalRawDate(line: IcsLine | undefined): Date | undefined {
  if (!line) return undefined
  return readRawDate(line)
}

export function readRawDate(line: IcsLine) {
  const value = line.params.VALUE;

  if (value === undefined) {  
    if (line.params.TZID) {
      return parse(line.value, "yyyyMMdd'T'HHmmss", new Date())
    } else {
      return parse(line.value, "yyyyMMdd'T'HHmmssX", new Date())
    }            
  } else if (value === 'DATE') {
    return parse(line.value, 'yyyyMMdd', new Date())
  } else throw 'Unsupported date VALUE:'+value
}

function allLines(line: IcsLine): IcsLine[] {
  const lines: IcsLine[] = []
  let currentLine: IcsLine | undefined  = line
  while(currentLine) {
    lines.push(currentLine)
    currentLine = currentLine.next
  }
  return lines
}

function groupBy<T>(arr: T[], keyFunc: (x:T) => string): {[key: string]: T[]} {
  const out: {[key: string]: T[]} = {}

  return arr.reduce((acc, cur) => {
    const key = keyFunc(cur)
    if (acc[key]) {
      return {...acc, [key]: [...acc[key], cur]}
    } else {
      return {...acc, [key]: [cur]}
    }
  }, out)
}

function flatten<T>(arr: T[][]): T[] {
  return arr.reduce((acc, c) => [...acc, ...c])
}