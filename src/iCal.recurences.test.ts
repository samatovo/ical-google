import add from 'date-fns/add'
import parseISO from 'date-fns/parseISO'
import {readFileSync} from 'fs'
import {loadICal} from './iCal'

const monday = parseISO('2020-11-16')
const tuesday = parseISO('2020-11-17')
const wednesday = parseISO('2020-11-18')
const thursday = parseISO('2020-11-19')
const saturday = parseISO('2020-11-21')

test('weekly event with moved event', () => {
  const icsString = readFileSync('./src/examples/moved-event.ics').toString()
  const ical = loadICal(icsString)
  
  const oneDay = ical.getEventsDuringInterval(monday, tuesday)
  expect(oneDay).toStartAt('2020-11-16T13:00:00Z')
  expect(oneDay).toBeIcsInstances(['Weekly'])
  
  const twoDays = ical.getEventsDuringInterval(monday, wednesday)
  expect(twoDays).toStartAt('2020-11-16T13:00:00Z')

  const threeDays = ical.getEventsDuringInterval(monday, thursday)
  expect(threeDays).toStartAt('2020-11-16T13:00:00Z','2020-11-18T13:00:00Z','2020-11-18T15:00:00Z')
  expect(threeDays).toBeIcsInstances(['Weekly', 'Weekly', 'Weekly'])
  
  const fiveDays = ical.getEventsDuringInterval(monday, saturday)
  expect(fiveDays).toStartAt('2020-11-16T13:00:00Z','2020-11-18T13:00:00Z','2020-11-18T15:00:00Z', '2020-11-19T13:00:00Z','2020-11-20T13:00:00Z')
  expect(fiveDays).toBeIcsInstances(['Weekly', 'Weekly', 'Weekly', 'Weekly special', 'Weekly'])

  //expect('123aaa4a5a6').toBe('123456')
})
