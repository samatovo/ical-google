import add from 'date-fns/add'
import parseISO from 'date-fns/parseISO'
import {readFileSync} from 'fs'
import {loadICal} from './iCal'

const monday1 = parseISO('2020-11-16')
const monday2 = add(monday1, {weeks: 1})
const monday3 = add(monday1, {weeks: 2})
const tuesday3 = add(monday3, {days: 1})

const eveyWeekForever = readFileSync('./src/examples/every-week-forever.ics').toString()

test('getting simple events in duration - day', () => {
  const ical = loadICal(eveyWeekForever)
  
  const oneWeek = ical.getEventsDuringInterval(monday1, monday2)
  expect(oneWeek).toStartAt('2020-11-16T00:00:00Z')
  
  const twoWeeks = ical.getEventsDuringInterval(monday1, monday3)
  expect(twoWeeks).toStartAt('2020-11-16T00:00:00Z', '2020-11-23T00:00:00Z')

  const twoWeeksAndADay = ical.getEventsDuringInterval(monday1, tuesday3)
  expect(twoWeeksAndADay).toStartAt('2020-11-16T00:00:00Z', '2020-11-23T00:00:00Z', '2020-11-30T00:00:00Z')
})

test('getting simple events in duration - every other week', () => {
  const eveyDayForever = eveyWeekForever.replace('RRULE:FREQ=WEEKLY', 'RRULE:FREQ=WEEKLY;INTERVAL=2')
  const ical = loadICal(eveyDayForever)
  
  const oneWeek = ical.getEventsDuringInterval(monday1, monday2)
  expect(oneWeek).toStartAt('2020-11-16T00:00:00Z')
  
  const twoWeeks = ical.getEventsDuringInterval(monday1, monday3)
  expect(twoWeeks).toStartAt('2020-11-16T00:00:00Z')

  const twoWeeksAndADay = ical.getEventsDuringInterval(monday1, tuesday3)
  expect(twoWeeksAndADay).toStartAt('2020-11-16T00:00:00Z', '2020-11-30T00:00:00Z')
})

test('getting simple events in duration - every week for 2 weeks', () => {
  const eveyDayForever = eveyWeekForever.replace('RRULE:FREQ=WEEKLY', 'RRULE:FREQ=WEEKLY;COUNT=2')
  const ical = loadICal(eveyDayForever)
  
  const oneWeek = ical.getEventsDuringInterval(monday1, monday2)
  expect(oneWeek).toStartAt('2020-11-16T00:00:00Z')
  
  const twoWeeks = ical.getEventsDuringInterval(monday1, monday3)
  expect(twoWeeks).toStartAt('2020-11-16T00:00:00Z', '2020-11-23T00:00:00Z')

  const twoWeeksAndADay = ical.getEventsDuringInterval(monday1, tuesday3)
  expect(twoWeeksAndADay).toStartAt('2020-11-16T00:00:00Z', '2020-11-23T00:00:00Z')
})

test('getting simple events in duration - every week until 2nd week', () => {
  const eveyDayForever = eveyWeekForever.replace('RRULE:FREQ=WEEKLY', 'RRULE:FREQ=WEEKLY;UNTIL=20201123')
  const ical = loadICal(eveyDayForever)
  
  const oneWeek = ical.getEventsDuringInterval(monday1, monday2)
  expect(oneWeek).toStartAt('2020-11-16T00:00:00Z')
  
  const twoWeeks = ical.getEventsDuringInterval(monday1, monday3)
  expect(twoWeeks).toStartAt('2020-11-16T00:00:00Z', '2020-11-23T00:00:00Z')

  const twoWeeksAndADay = ical.getEventsDuringInterval(monday1, tuesday3)
  expect(twoWeeksAndADay).toStartAt('2020-11-16T00:00:00Z', '2020-11-23T00:00:00Z')
})

test('getting simple events in duration - every week, skip 2nd', () => {
  const eveyDayForever = eveyWeekForever.replace('RRULE:FREQ=WEEKLY', 'RRULE:FREQ=WEEKLY\r\nEXDATE;VALUE=DATE:20201123')
  const ical = loadICal(eveyDayForever)
  
  const oneWeek = ical.getEventsDuringInterval(monday1, monday2)
  expect(oneWeek).toStartAt('2020-11-16T00:00:00Z')
  
  const twoWeeks = ical.getEventsDuringInterval(monday1, monday3)
  expect(twoWeeks).toStartAt('2020-11-16T00:00:00Z')

  const twoWeeksAndADay = ical.getEventsDuringInterval(monday1, tuesday3)
  expect(twoWeeksAndADay).toStartAt('2020-11-16T00:00:00Z', '2020-11-30T00:00:00Z')
})

test('getting simple events in duration - every week, on MON, WED and FRI', () => {
  const eveyDayForever = eveyWeekForever.replace('RRULE:FREQ=WEEKLY', 'RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR')
  const ical = loadICal(eveyDayForever)
  
  const oneWeek = ical.getEventsDuringInterval(monday1, monday2)
  expect(oneWeek).toStartAt('2020-11-16', '2020-11-18', '2020-11-20')
  
  
  // const twoWeeks = ical.getEventsDuringInterval(monday1, monday3)
  // expect(twoWeeks).toStartAt('2020-11-16T00:00:00Z')

  // const twoWeeksAndADay = ical.getEventsDuringInterval(monday1, tuesday3)
  // expect(twoWeeksAndADay).toStartAt('2020-11-16T00:00:00Z', '2020-11-30T00:00:00Z')
})