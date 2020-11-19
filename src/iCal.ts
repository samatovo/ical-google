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
  const start = readRawDate(rawEvent.props.DTSTART)
  const end = readRawDate(rawEvent.props.DTEND)
  const interval = {start, end}
  const duration = intervalToDuration(interval)
  const rrule = readRRule(rawEvent.props.RRULE)

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
        nextCandidate = rrule(nextCandidate)

        if (nextCandidate.start > intervalFor.end) break;

        candidates.push(nextCandidate)
        if (loops++ > 100) throw new Error("Too many loops");
      } while(nextCandidate !== null)
      console.log('loops:', loops)
    }
    
    return candidates.filter(candidate => {
      const interval = {start: candidate.start, end: candidate.end}
      return areIntervalsOverlapping(interval, intervalFor)
    })
    // if(areIntervalsOverlapping(interval, intervalFor)) {
    //   return [instance]
    // } else {
    //   return []
    // }
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

  if (freq === 'DAILY') {
    return (prev:EventInstance): EventInstance => {
      return {
        ...prev,
        start: add(prev.start, {days: 1}),
        end: add(prev.end, {days: 1})
      }

    }
  } else throw new Error("Unsupported FREQ:" + freq);
  
  const unusedKeys = Object.keys(parts)
  if (unusedKeys.length > 0) throw new Error("rrule parameters not supported:"+unusedKeys);
}

export function readRawDate(rawEvent: IcsLine) {
  const value = rawEvent.params.VALUE;

  if (value === undefined) {               
    return parse(rawEvent.value, "yyyyMMdd'T'HHmmssX", new Date())
  } else if (value === 'DATE') {
    return parse(rawEvent.value, 'yyyyMMdd', new Date())
  } else throw 'Unsupported date VALUE:'+value

}

