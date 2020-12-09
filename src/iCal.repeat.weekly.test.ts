import add from 'date-fns/add'
import parseISO from 'date-fns/parseISO'
import {readFileSync} from 'fs'
import {loadICal} from './iCal'

const monday1 = parseISO('2020-11-16')
const monday2 = add(monday1, {weeks: 1})
const monday3 = add(monday1, {weeks: 2})
const monday5 = add(monday1, {weeks: 4})
const tuesday3 = add(monday3, {days: 1})

const eveyWeekForever = readFileSync('./src/examples/every-week-forever.ics').toString()

test('repeating weekly - forever', () => {
  const ical = loadICal(eveyWeekForever)
  
  const oneWeek = ical.getEventsBetwen(monday1, monday2)
  expect(oneWeek).toStartAt('2020-11-16T00:00:00Z')
  
  const twoWeeks = ical.getEventsBetwen(monday1, monday3)
  expect(twoWeeks).toStartAt('2020-11-16T00:00:00Z', '2020-11-23T00:00:00Z')

  const twoWeeksAndADay = ical.getEventsBetwen(monday1, tuesday3)
  expect(twoWeeksAndADay).toStartAt('2020-11-16T00:00:00Z', '2020-11-23T00:00:00Z', '2020-11-30T00:00:00Z')
})

test('repeating weekly - forever on a day', () => {
  const eveyDayForever = eveyWeekForever.replace('RRULE:FREQ=WEEKLY', 'RRULE:FREQ=WEEKLY;BYDAY=MO')
  const ical = loadICal(eveyDayForever)
  
  const oneWeek = ical.getEventsBetwen(monday1, monday2)
  expect(oneWeek).toStartAt('2020-11-16T00:00:00Z')
  
  const twoWeeks = ical.getEventsBetwen(monday1, monday3)
  expect(twoWeeks).toStartAt('2020-11-16T00:00:00Z', '2020-11-23T00:00:00Z')

  const twoWeeksAndADay = ical.getEventsBetwen(monday1, tuesday3)
  expect(twoWeeksAndADay).toStartAt('2020-11-16T00:00:00Z', '2020-11-23T00:00:00Z', '2020-11-30T00:00:00Z')
})

test('repeating weekly - every other week', () => {
  const eveyDayForever = eveyWeekForever.replace('RRULE:FREQ=WEEKLY', 'RRULE:FREQ=WEEKLY;INTERVAL=2')
  const ical = loadICal(eveyDayForever)
  
  const oneWeek = ical.getEventsBetwen(monday1, monday2)
  expect(oneWeek).toStartAt('2020-11-16T00:00:00Z')
  
  const twoWeeks = ical.getEventsBetwen(monday1, monday3)
  expect(twoWeeks).toStartAt('2020-11-16T00:00:00Z')

  const twoWeeksAndADay = ical.getEventsBetwen(monday1, tuesday3)
  expect(twoWeeksAndADay).toStartAt('2020-11-16T00:00:00Z', '2020-11-30T00:00:00Z')
})

test('repeating weekly - retro RRULE:FREQ=WEEKLY;INTERVAL=2;BYDAY=WE', () => {
  /*
  DTSTART;TZID=Europe/London:20200930T130000
  DTEND;TZID=Europe/London:20200930T140000
  RRULE:FREQ=WEEKLY;WKST=SU;INTERVAL=2;BYDAY=WE
  */
  const eveyDayForever = eveyWeekForever
    .replace(/DTSTART;.*\r\n/, 'DTSTART;TZID=Europe/London:20200930T130000\r\n')
    .replace(/DTEND;.*\r\n/, 'DTEND;TZID=Europe/London:20200930T140000\r\n')
    .replace('RRULE:FREQ=WEEKLY', 'RRULE:FREQ=WEEKLY;INTERVAL=2;BYDAY=WE')
  const ical = loadICal(eveyDayForever)
  
  const oneWeek = ical.getEventsBetwen(monday1, monday2)
  expect(oneWeek).toStartAt()
  
  const twoWeeks = ical.getEventsBetwen(monday1, monday3)
  expect(twoWeeks).toStartAt('2020-11-25T13:00:00Z')

  const twoWeeksAndADay = ical.getEventsBetwen(monday1, monday5)
  expect(twoWeeksAndADay).toStartAt('2020-11-25T13:00:00Z', '2020-12-09T13:00:00Z')
})

test('repeating weekly - every week for 2 weeks', () => {
  const eveyDayForever = eveyWeekForever.replace('RRULE:FREQ=WEEKLY', 'RRULE:FREQ=WEEKLY;COUNT=2')
  const ical = loadICal(eveyDayForever)
  
  const oneWeek = ical.getEventsBetwen(monday1, monday2)
  expect(oneWeek).toStartAt('2020-11-16T00:00:00Z')
  
  const twoWeeks = ical.getEventsBetwen(monday1, monday3)
  expect(twoWeeks).toStartAt('2020-11-16T00:00:00Z', '2020-11-23T00:00:00Z')

  const twoWeeksAndADay = ical.getEventsBetwen(monday1, tuesday3)
  expect(twoWeeksAndADay).toStartAt('2020-11-16T00:00:00Z', '2020-11-23T00:00:00Z')
})

test('repeating weekly - every week until 2nd week', () => {
  const eveyDayForever = eveyWeekForever.replace('RRULE:FREQ=WEEKLY', 'RRULE:FREQ=WEEKLY;UNTIL=20201124')
  const ical = loadICal(eveyDayForever)
  
  const oneWeek = ical.getEventsBetwen(monday1, monday2)
  expect(oneWeek).toStartAt('2020-11-16T00:00:00Z')
  
  const twoWeeks = ical.getEventsBetwen(monday1, monday3)
  expect(twoWeeks).toStartAt('2020-11-16T00:00:00Z', '2020-11-23T00:00:00Z')

  const twoWeeksAndADay = ical.getEventsBetwen(monday1, tuesday3)
  expect(twoWeeksAndADay).toStartAt('2020-11-16T00:00:00Z', '2020-11-23T00:00:00Z')
})

test('repeating weekly - every week, skip 2nd', () => {
  const eveyDayForever = eveyWeekForever.replace('RRULE:FREQ=WEEKLY', 'RRULE:FREQ=WEEKLY\r\nEXDATE;VALUE=DATE:20201123')
  const ical = loadICal(eveyDayForever)
  
  const oneWeek = ical.getEventsBetwen(monday1, monday2)
  expect(oneWeek).toStartAt('2020-11-16T00:00:00Z')
  
  const twoWeeks = ical.getEventsBetwen(monday1, monday3)
  expect(twoWeeks).toStartAt('2020-11-16T00:00:00Z')

  const twoWeeksAndADay = ical.getEventsBetwen(monday1, tuesday3)
  expect(twoWeeksAndADay).toStartAt('2020-11-16T00:00:00Z', '2020-11-30T00:00:00Z')
})

test('repeating weekly - every week, on MON, WED and FRI', () => {
  const eveyDayForever = eveyWeekForever.replace('RRULE:FREQ=WEEKLY', 'RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR')
  const ical = loadICal(eveyDayForever)
  
  const oneWeek = ical.getEventsBetwen(monday1, monday2)
  expect(oneWeek).toStartAt('2020-11-16', '2020-11-18', '2020-11-20')

  const twoWeeks = ical.getEventsBetwen(monday1, monday3)
  expect(twoWeeks).toStartAt(
    '2020-11-16', '2020-11-18', '2020-11-20', 
    '2020-11-23', '2020-11-25', '2020-11-27'
  )

  const twoWeeksAndADay = ical.getEventsBetwen(monday1, tuesday3)
  expect(twoWeeksAndADay).toStartAt(
    '2020-11-16', '2020-11-18', '2020-11-20', 
    '2020-11-23', '2020-11-25', '2020-11-27',
    '2020-11-30'
  )
})