import parseISO from 'date-fns/parseISO'
import {readFileSync} from 'fs'
import {loadICal} from './iCal'

const monday = parseISO('2020-11-16')
const tueday = parseISO('2020-11-17')
const wednesday = parseISO('2020-11-18')
const thursday = parseISO('2020-11-19')
const friday = parseISO('2020-11-20')
const saturday = parseISO('2020-11-21');

test('repeating daily - forever', () => {
  const eveyDayForever = readFileSync('./src/examples/every-day-forever.ics').toString()
  const ical = loadICal(eveyDayForever)
  
  const oneDay = ical.getEventsBetwen(monday, tueday)
  expect(oneDay.length).toBe(1)
  
  const twoDays = ical.getEventsBetwen(monday, wednesday)
  expect(twoDays.length).toBe(2)

  const fiveDays = ical.getEventsBetwen(monday, saturday)
  expect(fiveDays.length).toBe(5)
})

test('repeating daily - every other day', () => {
  const eveyDayForever = readFileSync('./src/examples/every-day-forever.ics').toString()
    .replace('RRULE:FREQ=DAILY', 'RRULE:FREQ=DAILY;INTERVAL=2')
  const ical = loadICal(eveyDayForever)
  
  const oneDay = ical.getEventsBetwen(monday, tueday)
  expect(oneDay.length).toBe(1)
  expect(oneDay).toBe
  
  const twoDays = ical.getEventsBetwen(monday, wednesday)
  expect(twoDays.length).toBe(1)

  const fiveDays = ical.getEventsBetwen(monday, saturday)
  expect(fiveDays.length).toBe(3)
})

test('repeating daily - count 2', () => {
  const eveyDayForever = readFileSync('./src/examples/every-day-forever.ics').toString()
    .replace('RRULE:FREQ=DAILY', 'RRULE:FREQ=DAILY;COUNT=2')
  const ical = loadICal(eveyDayForever)
  
  const oneDay = ical.getEventsBetwen(monday, tueday)
  expect(oneDay.length).toBe(1)
  expect(oneDay).toBe
  
  const twoDays = ical.getEventsBetwen(monday, wednesday)
  expect(twoDays.length).toBe(2)

  const fiveDays = ical.getEventsBetwen(monday, saturday)
  expect(fiveDays.length).toBe(2)
})

test('repeating daily - until tuesday', () => {
  const eveyDayForever = readFileSync('./src/examples/every-day-forever.ics').toString()
    .replace('RRULE:FREQ=DAILY', 'RRULE:FREQ=DAILY;UNTIL=20201118')
  const ical = loadICal(eveyDayForever)
  
  const oneDay = ical.getEventsBetwen(monday, tueday)
  expect(oneDay.length).toBe(1)
  expect(oneDay).toBe
  
  const twoDays = ical.getEventsBetwen(monday, wednesday)
  expect(twoDays.length).toBe(2)

  const fiveDays = ical.getEventsBetwen(monday, saturday)
  expect(fiveDays.length).toBe(2)
})
test('repeating daily - skip wednesday and friday', () => {
  const eveyDayForever = readFileSync('./src/examples/every-day-forever.ics').toString()
    .replace('RRULE:FREQ=DAILY', 'RRULE:FREQ=DAILY\r\nEXDATE;VALUE=DATE:20201118\r\nEXDATE;VALUE=DATE:20201120')
  const ical = loadICal(eveyDayForever)
  
  const oneDay = ical.getEventsBetwen(monday, tueday)
  expect(oneDay.length).toBe(1)
  expect(oneDay).toBe
  
  const twoDays = ical.getEventsBetwen(monday, wednesday)
  expect(twoDays.length).toBe(2)

  const threeDays = ical.getEventsBetwen(monday, thursday)
  expect(threeDays.length).toBe(2)

  const fiveDays = ical.getEventsBetwen(monday, saturday)
  expect(fiveDays.length).toBe(3)
})