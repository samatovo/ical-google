import parseISO from 'date-fns/parseISO'
import {readFileSync} from 'fs'
import {loadICal} from './iCal'

test('getting simple events in duration - day', () => {
  const longDesc = readFileSync('./src/examples/long-desc.ics').toString()
  const ical = loadICal(longDesc)

  const dayBefore = parseISO('2020-11-17')
  const dayOf = parseISO('2020-11-18')
  const dayEnd = parseISO('2020-11-19')
  const dayAfter = parseISO('2020-11-20');
  
  const before = ical.getEventsBetwen(dayBefore, dayOf)
  expect(before.length).toBe(0)
  
  const during = ical.getEventsBetwen(dayOf, dayEnd)
  expect(during.length).toBe(1)

  const after = ical.getEventsBetwen(dayEnd, dayAfter)
  expect(after.length).toBe(0)

})

test('getting simple events in duration - hour', () => {
  const simpleLunch = readFileSync('./src/examples/simple-lunch.ics').toString()
  const ical = loadICal(simpleLunch)

  const timeBefor = parseISO('2020-11-18T09:00:00')
  const timeStart = parseISO('2020-11-18T13:00:00')
  const timeEnd = parseISO('2020-11-18T14:00:00')
  const timeAfter = parseISO('2020-11-18T19:00:00')
  
  const before = ical.getEventsBetwen(timeBefor, timeStart)
  expect(before.length).toBe(0)
  
  const during = ical.getEventsBetwen(timeStart, timeEnd)
  expect(during.length).toBe(1)

  const after = ical.getEventsBetwen(timeEnd, timeAfter)
  expect(after.length).toBe(0)

})

test('getting multiple simple events in duration - day', () => {
  const simpleLunch = readFileSync('./src/examples/simple-multiple.ics').toString()
  const ical = loadICal(simpleLunch)

  const dayOneStart = parseISO('2020-11-17')
  const dayTwoStart = parseISO('2020-11-18')
  const dayTwoEnd = parseISO('2020-11-19')
  const dayThreeEnd = parseISO('2020-11-20');
  
  const threeDays = ical.getEventsBetwen(dayOneStart, dayThreeEnd)
  expect(threeDays.length).toBe(9)
  expect(threeDays).toBeIcsInstances(["Alpha", "Bravo", "Charlie", "Delta", "Echo", "Foxtrot", "Golf", "Hotel", "India"])
  
  const during = ical.getEventsBetwen(dayTwoStart, dayTwoEnd)
  expect(during.length).toBe(3)
  expect(during).toBeIcsInstances(["Delta", "Echo", "Foxtrot"])

})