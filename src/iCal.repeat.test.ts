import parseISO from 'date-fns/parseISO'
import {readFileSync} from 'fs'
import {loadICal} from './iCal'

test('getting simple events in duration - day', () => {
  const eveyDayForever = readFileSync('./src/examples/every-day-forever.ics').toString()
  const ical = loadICal(eveyDayForever)

  const monday = parseISO('2020-11-16')
  const tueday = parseISO('2020-11-17')
  const wednesday = parseISO('2020-11-18')
  const friday = parseISO('2020-11-20');
  
  const oneDay = ical.getEventsDuringInterval(monday, tueday)
  expect(oneDay.length).toBe(1)
  
  const twoDays = ical.getEventsDuringInterval(monday, wednesday)
  expect(twoDays.length).toBe(2)

  const fiveDays = ical.getEventsDuringInterval(monday, friday)
  expect(fiveDays.length).toBe(5)
})