import { formatISO, isEqual } from "date-fns"
import add from "date-fns/add"
import areIntervalsOverlapping from "date-fns/areIntervalsOverlapping"
import intervalToDuration from "date-fns/intervalToDuration"
import parse from "date-fns/parse"
import sub from "date-fns/sub"
import { IcsLine } from "./lexer"
import { ICalObject, parseIcs } from "./parser"

function flatten<T>(arr: T[][]): T[] {
  return arr.reduce((acc, c) => [...acc, ...c])
}

export function loadICal(icsText: string) {
  const parsed = parseIcs(icsText)
  const rawEvents = parsed.blocks.VEVENT || []
  const events = rawEvents.map(readRawEvent)

  const getEventsDuringInterval = (start: Date, end: Date) => {
    return flatten(events.map(e => e.getEventsDuringInterval(start, end)))
  }

  return {
    events,

    getEventsDuringInterval
  }
}
 
export interface EventInstance {
  start: Date
  end: Date
  summary: string
  description: string
}

function readRawEvent(rawEvent: ICalObject) {
  const start = readMandatoryRawDate(rawEvent.props.DTSTART, 'DTSTART')
  const end = readMandatoryRawDate(rawEvent.props.DTEND, 'DTEND')
  const interval = {start, end}
  const duration = intervalToDuration(interval)
  const rrule = readRRule(rawEvent.props.RRULE)
  const exdates = readRawDates(rawEvent.props.EXDATE).map(x => formatISO(x))

  const summary = rawEvent.props.SUMMARY.value
  const description = rawEvent.props.DESCRIPTION.value

  const instance: EventInstance = {
    start,
    end,
    summary,
    description
  }

  const getEventsDuringInterval = (start: Date, end: Date) => {
    const intervalFor = {start, end: sub(end, {seconds:1})}
    
    const candidates = [instance]

    if (rrule) {
      let nextCandidate = instance
      let loops = 0
      do {
        nextCandidate = rrule.func(nextCandidate)

        if (nextCandidate.start > intervalFor.end) break;

        if (!exdates.includes(formatISO(nextCandidate.start))) {
          candidates.push(nextCandidate)
        }
        if (candidates.length >= rrule.count) break
        if (nextCandidate.start >= rrule.until) break
        if (loops++ > 100) throw new Error("Too many loops");
      } while(nextCandidate !== null)
      // console.log('loops:', loops)
    }
    
    return candidates.filter(candidate => {
      const interval = {start: candidate.start, end: candidate.end}
      return areIntervalsOverlapping(interval, intervalFor)
    })
  }

  return {
    start,
    end,

    instance,

    getEventsDuringInterval
  }  
}

export function readRRule(rrule: IcsLine) {
  if (!rrule) return null
  const parts: {[key: string]: string} = rrule.value.split(';').reduce((acc, c) => {
    const [k, v] = c.split('=')
    return {...acc, [k]: v}
  }, {})

  if (!parts.FREQ) throw new Error("RRULE is missing FREQ");
  const freq = parts.FREQ; delete parts.FREQ
  const interval = parseInt(parts.INTERVAL || '1'); delete parts.INTERVAL
  const count = parseInt(parts.COUNT || `${Number.MAX_SAFE_INTEGER}` ); delete parts.COUNT
  const until = parseIcsDate(parts.UNTIL || '99990101'); delete parts.UNTIL

  let func: (prev: EventInstance) => EventInstance

  if (freq === 'DAILY') {
    func = (prev:EventInstance): EventInstance => {
      return {
        ...prev,
        start: add(prev.start, {days: interval}),
        end: add(prev.end, {days: interval})
      }

    }
  } else if (freq === 'WEEKLY') {
    func = (prev:EventInstance): EventInstance => {
      return {
        ...prev,
        start: add(prev.start, {weeks: interval}),
        end: add(prev.end, {weeks: interval})
      }

    }
  } else throw new Error("Unsupported FREQ:" + freq);
  
  const unusedKeys = Object.keys(parts)
  if (unusedKeys.length > 0) throw new Error("rrule parameters not supported:"+unusedKeys);

  return {
    func,
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

export function readMandatoryRawDate(rawEvents: IcsLine, name: string) {
  if (!rawEvents) throw new Error('Missing mandatory var:'+name) 
  return readRawDate(rawEvents)
}

export function readRawDates(firstLine: IcsLine) {
  return allLines(firstLine).map(readRawDate)
}

export function readRawDate(line: IcsLine) {
  const value = line.params.VALUE;

  if (value === undefined) {               
    return parse(line.value, "yyyyMMdd'T'HHmmssX", new Date())
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

