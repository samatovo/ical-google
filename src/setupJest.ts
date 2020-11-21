
import chalk from 'chalk';
import diff, {diffStringsUnified} from 'jest-diff';
import formatISOReal from "date-fns/formatISO";
import isEqual from "date-fns/isEqual";
import parseISO from "date-fns/parseISO";
import type { EventInstance } from './iCal';

export {};

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeDate(expected: string): CustomMatcherResult
      toBeDates(expected: string[]): CustomMatcherResult
      toBeIcsInstances(expected: string[]): CustomMatcherResult
      toStartAt(...expected: string[]): CustomMatcherResult
    }
  }
}

const formatISO = (date: Date) => {
  try {
    return formatISOReal(date)
  } catch (e) {
    return e.toString()
  }
}

interface CustomMatcherResult {
  pass: boolean
  message: () => string
}

const makeResult = <T>(name: string, expected: string, received:string) => ({
  pass: expected === received,
  message: () => `expect(${chalk.green('expected')})${expected === received?'.not':''}.${name}(${chalk.red('received')})\n`+
  //`\nExpected: ${chalk.green(expected)}`+
  //`\nReceived: ${chalk.red(received)}`+
  `\n${diffStringsUnified(expected, received, {omitAnnotationLines: true})}`
})


const toBeDate = (received: Date, expected: string): CustomMatcherResult => {
  const expectedDate = parseISO(expected)
  return makeResult('toBeDate', expected, formatISO(received))
}

const toBeDates = (received: Date[], expected: string[]): CustomMatcherResult => {
  const expectedDate = expected.map(x => parseISO(x)).sort()
  const receivedDate = [...received].sort()
  const expectedDateStrings = expectedDate.map(x=>formatISO(x)).join()
  const receivedDateStrings = receivedDate.map(x=>formatISO(x)).join()
  return makeResult('toBeDates', expectedDateStrings, receivedDateStrings)
}

const toBeIcsInstances = (received: EventInstance[], expected: string[]): CustomMatcherResult => {
  const receivedStr = [...received].sort(sortStartDates).map(r => JSON.stringify(r.summary)).join(', ')
  const expectedStr = expected.map(s => JSON.stringify(s)).join(', ')
  return makeResult('toBeIcsInstances', expectedStr, receivedStr)
}

const toStartAt = (received: EventInstance[], ...expected: string[]): CustomMatcherResult => {
  const expectedDate = expected.map(x => parseISO(x)).sort(sortDates)
  const receivedDate = received.map(x => x.start).sort(sortDates)
  const expectedDateStrings = expectedDate.map(x=>formatISO(x)).join()
  const receivedDateStrings = receivedDate.map(x=>formatISO(x)).join()
  return makeResult('toStartAt', expectedDateStrings, receivedDateStrings)
}

const sortDates = (a: Date, b: Date) => a.getTime() - b.getTime()
const sortStartDates = (a: EventInstance, b: EventInstance) => a.start.getTime() - b.start.getTime()

expect.extend({
  toBeDate,
  toBeDates,
  toBeIcsInstances,
  toStartAt
});