
import chalk from 'chalk';
import formatISO from "date-fns/formatISO";
import isEqual from "date-fns/isEqual";
import parseISO from "date-fns/parseISO";
import type { EventInstance } from './src/iCal';


export {};



declare global {
  namespace jest {
    interface Matchers<R> {
      toBeDate(expected: string): CustomMatcherResult
      toBeIcsInstances(expected: string[]): CustomMatcherResult
    }
  }
}

interface CustomMatcherResult {
  pass: boolean
  message: () => string
}

const makeResult = (name: string, expected: string, received:string, pass: boolean) => ({
  pass,
  message: () => `expect(${chalk.green('expected')})${pass?'.not':''}.${name}(${chalk.red('received')})\n`+
  `\nExpected: ${chalk.green(expected)}`+
  `\nReceived: ${chalk.red(received)}`
})


const toBeDate = (received: Date, expected: string): CustomMatcherResult => {
  const expectedDate = parseISO(expected)
  return makeResult('toBeDate', expected, formatISO(received), isEqual(received, expectedDate))
}

const toBeIcsInstances = (received: EventInstance[], expected: string[]): CustomMatcherResult => {
  const receivedStr = received.map(r => JSON.stringify(r.summary)).sort().join(', ')
  const expectedStr = expected.map(s => JSON.stringify(s)).sort().join(', ')
  return makeResult('toBeIcsInstances', expectedStr, receivedStr, receivedStr === expectedStr)
}

expect.extend({
  toBeDate,
  toBeIcsInstances
});