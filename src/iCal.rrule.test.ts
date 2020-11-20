import {readFileSync} from 'fs'
import { readRRule } from "./iCal"
import { lexLine } from "./lexer"


test('parse a RRULE with BYDATE', () => {
  const november = 10
  const start = new Date(2020, november, 16)
  const rule = readRRule(lexLine('RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR'), start)
  
  expect(rule!.func({start, end:start, summary: '', description: ''}))
    .toStartAt('2020-11-18', '2020-11-20','2020-11-23')
})

