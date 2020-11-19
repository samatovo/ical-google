import {readFileSync} from 'fs'
import {parseIcs} from './parser'


test('parse empty VCALENDAR', () => {
  expect(parseIcs('BEGIN:VCALENDAR\r\nEND:VCALENDAR'))
    .toEqual({blocks:{}, props:{}})
})

test('parse VCALENDAR with one key', () => {
  expect(parseIcs('BEGIN:VCALENDAR\r\nKEY:ONE\r\nEND:VCALENDAR'))
    .toEqual({
      "blocks": {},
      "props": {
        "KEY": {
          "line": "KEY:ONE",
          "name": "KEY",
          "params": {},
          "value": "ONE",
          "values": [
            "ONE",
          ],
        }
      }
    })
})

const noEvents = readFileSync('./src/examples/no-events.ics').toString()
const longDesc = readFileSync('./src/examples/long-desc.ics').toString()

test('parsing no-events', () => {
  const iCalObject = parseIcs(noEvents)
  expect(iCalObject.blocks.VEVENT).toBe(undefined)
})

test('parsing long desc', () => {
  const iCalObject = parseIcs(longDesc)
  expect(iCalObject.blocks.VEVENT.length).toBe(1)
})

