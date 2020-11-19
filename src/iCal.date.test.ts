import {readFileSync} from 'fs'
import { loadICal, readRawDate } from "./iCal"
import { lexLine } from "./lexer"


test('parse a DATE', () => {
  const line = lexLine('DTSTART;VALUE=DATE:20201118')
  expect(readRawDate(line)).toBeDate('2020-11-18T00:00:00Z')
})

test('parse a DATETIME', () => {
  const line = lexLine('DTSTART:20201118T130000Z')
  expect(readRawDate(line)).toBeDate('2020-11-18T13:00:00Z')
})



test('parsing long desc', () => {
  const longDesc = readFileSync('./src/examples/long-desc.ics').toString()
  const ical = loadICal(longDesc)

  expect(ical.events.length).toBe(1)

  const event = ical.events[0]
  expect(event.start).toBeDate('2020-11-18T00:00:00Z')
  expect(event.end).toBeDate('2020-11-19T00:00:00Z')

})