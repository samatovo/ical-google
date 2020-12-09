test.todo('Find way to have real data')

import { endOfDay, formatISO } from 'date-fns'
import add from 'date-fns/add'
import parseISO from 'date-fns/parseISO'
import startOfDay from 'date-fns/startOfDay'
import {readFileSync} from 'fs'
import {loadICal} from './iCal'



const real = readFileSync('./src/examples/basic.ics').toString()

test('sams calendar', () => {
  const ical = loadICal(real)
  
  const interval = {start: startOfDay(new Date()), end: endOfDay(new Date())}
  // const interval = {start: parseISO('2020-12-07'), end: parseISO('2020-12-08')}

  const oneWeek = ical
    .getEventsDuringInterval(interval)
    .sort((a,b) => a.start.getTime() - b.start.getTime())

  console.log(groupBy(oneWeek, x => formatISO( startOfDay(x.start))))
  
})

function groupBy<T>(arr: T[], keyFunc: (x:T) => string): {[key: string]: T[]} {

  const out: {[key: string]: T[]} = {}

  return arr.reduce((acc, cur) => {
    const key = keyFunc(cur)
    if (acc[key]) {
      return {...acc, [key]: [...acc[key], cur]}
    } else {
      return {...acc, [key]: [cur]}
    }
  }, out)
}



// test('standup', () => {
//   const canceledStandup = readFileSync('./src/examples/canceled-standup.ics').toString()
//   const ical = loadICal(canceledStandup)
  
//   const oneWeek = ical.getEventsDuringInterval(parseISO('2020-11-16'), parseISO('2020-11-20'))
//   expect(oneWeek.length).toBe(0)
  
  
// })
// test('bast planning', () => {
//   // RRULE:FREQ=WEEKLY;WKST=MO;INTERVAL=2;BYDAY=WE
//   const canceledStandup = readFileSync('./src/examples/bast-planning.ics').toString()
//   const ical = loadICal(canceledStandup)
  
//   const oneWeek = ical.getEventsDuringInterval(parseISO('2020-11-16'), parseISO('2020-11-20'))
//   expect(oneWeek.length).toBe(0)
  
  
// })

// test('bast tech refine', () => {
//   // RRULE:FREQ=WEEKLY;BYDAY=MO
//   const cal = readFileSync('./src/examples/bast-tech-refine.ics').toString()
//   const ical = loadICal(cal)
  
//   const oneWeek = ical.getEventsDuringInterval(parseISO('2020-11-16'), parseISO('2020-11-20'))
//   expect(oneWeek).toStartAt('2020-11-16T14:15:00Z')
  
  
// })

// test('bast team checkin', () => {
//   // RRULE:FREQ=WEEKLY;WKST=MO;UNTIL=20201112T235959Z;INTERVAL=4
//   const cal = readFileSync('./src/examples/bast-team-checkin.ics').toString()
//   const ical = loadICal(cal)
  
//   const oneWeek = ical.getEventsDuringInterval(parseISO('2020-11-16'), parseISO('2020-11-20'))
//   expect(oneWeek).toStartAt('2020-11-16T15:00:00Z')
  
  
// })