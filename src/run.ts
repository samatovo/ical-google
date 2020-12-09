import { endOfDay, formatISO, startOfDay } from 'date-fns'
import add from 'date-fns/add'
import parseISO from 'date-fns/parseISO'
import {readFileSync} from 'fs'
import {loadICal} from './iCal'


// const basic = readFileSync('./src/examples/basic.ics').toString()
// const ical = loadICal(basic)
// const start = startOfDay(new Date())
// const end = endOfDay(new Date())


// const today = ical.getEventsDuringInterval({start, end})
// console.log(today)

const monday1 = parseISO('2020-11-16')
const monday2 = add(monday1, {weeks: 1})
const monday3 = add(monday1, {weeks: 2})
const monday4 = add(monday1, {weeks: 3})
const tuesday3 = add(monday3, {days: 1})
const eveyWeekForever = readFileSync('./src/examples/every-week-forever.ics').toString()

const eveyDayForever = eveyWeekForever
    .replace(/DTSTART;.*\r\n/, 'DTSTART;TZID=Europe/London:20200930T130000\r\n')
    .replace(/DTEND;.*\r\n/, 'DTEND;TZID=Europe/London:20200930T140000\r\n')
    .replace('RRULE:FREQ=WEEKLY', 'RRULE:FREQ=WEEKLY;INTERVAL=2;BYDAY=WE')
  const ical = loadICal(eveyDayForever)
  
  // const oneWeek = ical.getEventsBetwen(parseISO('2020-09-01'), parseISO('2020-12-31'))
  const oneWeek = ical.getEventsBetwen(monday1, monday2)
  console.log(JSON.stringify(oneWeek.map(x => formatISO(x.start)), null, '  '))
  // expect(oneWeek).toStartAt('2020-11-18T13:00:00Z')
  
  // const twoWeeks = ical.getEventsBetwen(monday1, monday3)
  // expect(twoWeeks).toStartAt('2020-11-18T13:00:00Z')

  // const twoWeeksAndADay = ical.getEventsBetwen(monday1, monday4)
  // expect(twoWeeksAndADay).toStartAt('2020-11-18T13:00:00Z', '2020-12-02T13:00:00Z')