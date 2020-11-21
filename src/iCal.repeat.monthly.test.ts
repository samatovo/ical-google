import add from 'date-fns/add'
import parseISO from 'date-fns/parseISO'
import {readFileSync} from 'fs'
import {loadICal} from './iCal'

const november = parseISO('2020-11-01')
const december = parseISO('2020-12-01')
const january =  parseISO('2021-01-01')
const february =  parseISO('2021-02-01')

const eveyMonthForever = readFileSync('./src/examples/every-month-forever.ics').toString()

test('repeat monthly - forever', () => {
  const ical = loadICal(eveyMonthForever)
  
  const oneMonth = ical.getEventsDuringInterval(november, december)
  expect(oneMonth).toStartAt('2020-11-16')
  
  const twoMonths = ical.getEventsDuringInterval(november, january)
  expect(twoMonths).toStartAt('2020-11-16', '2020-12-16')

  const threeMonths = ical.getEventsDuringInterval(november, february)
  expect(threeMonths).toStartAt('2020-11-16', '2020-12-16', '2021-01-16')
})

test('repeat monthly - forever on 16th', () => {
  const ical = loadICal(eveyMonthForever.replace('RRULE:FREQ=MONTHLY','RRULE:FREQ=MONTHLY;BYMONTHDAY=16'))
  
  const oneMonth = ical.getEventsDuringInterval(november, december)
  expect(oneMonth).toStartAt('2020-11-16')
  
  const twoMonths = ical.getEventsDuringInterval(november, january)
  expect(twoMonths).toStartAt('2020-11-16', '2020-12-16')

  const threeMonths = ical.getEventsDuringInterval(november, february)
  expect(threeMonths).toStartAt('2020-11-16', '2020-12-16', '2021-01-16')
})

test('repeat monthly - every other month', () => {
  const ical = loadICal(eveyMonthForever.replace('RRULE:FREQ=MONTHLY', 'RRULE:FREQ=MONTHLY;INTERVAL=2'))
  
  const oneMonth = ical.getEventsDuringInterval(november, december)
  expect(oneMonth).toStartAt('2020-11-16')
  
  const twoMonths = ical.getEventsDuringInterval(november, january)
  expect(twoMonths).toStartAt('2020-11-16')

  const threeMonths = ical.getEventsDuringInterval(november, february)
  expect(threeMonths).toStartAt('2020-11-16', '2021-01-16')
})


test('repeat monthly - for two months', () => {
  const ical = loadICal(eveyMonthForever.replace('RRULE:FREQ=MONTHLY', 'RRULE:FREQ=MONTHLY;COUNT=2'))
  
  const oneMonth = ical.getEventsDuringInterval(november, december)
  expect(oneMonth).toStartAt('2020-11-16')
  
  const twoMonths = ical.getEventsDuringInterval(november, january)
  expect(twoMonths).toStartAt('2020-11-16', '2020-12-16')

  const threeMonths = ical.getEventsDuringInterval(november, february)
  expect(threeMonths).toStartAt('2020-11-16', '2020-12-16')
})

test('repeat monthly - until second month', () => {
  const ical = loadICal(eveyMonthForever.replace('RRULE:FREQ=MONTHLY', 'RRULE:FREQ=MONTHLY;UNTIL=20201217'))
  
  const oneMonth = ical.getEventsDuringInterval(november, december)
  expect(oneMonth).toStartAt('2020-11-16')
  
  const twoMonths = ical.getEventsDuringInterval(november, january)
  expect(twoMonths).toStartAt('2020-11-16', '2020-12-16')

  const threeMonths = ical.getEventsDuringInterval(november, february)
  expect(threeMonths).toStartAt('2020-11-16', '2020-12-16')
})

test('repeat monthly - skip second month', () => {
  const ical = loadICal(eveyMonthForever.replace('RRULE:FREQ=MONTHLY', 'RRULE:FREQ=MONTHLY\r\nEXDATE;VALUE=DATE:20201216'))
  
  const oneMonth = ical.getEventsDuringInterval(november, december)
  expect(oneMonth).toStartAt('2020-11-16')
  
  const twoMonths = ical.getEventsDuringInterval(november, january)
  expect(twoMonths).toStartAt('2020-11-16')

  const threeMonths = ical.getEventsDuringInterval(november, february)
  expect(threeMonths).toStartAt('2020-11-16', '2021-01-16')
})

test('repeat monthly - on 16th, 20th and 5th', () => {
  const ical = loadICal(eveyMonthForever.replace('RRULE:FREQ=MONTHLY', 'RRULE:FREQ=MONTHLY;BYMONTHDAY=16,20,5'))
  
  const oneMonth = ical.getEventsDuringInterval(november, december)
  expect(oneMonth).toStartAt('2020-11-16', '2020-11-20')
  
  const twoMonths = ical.getEventsDuringInterval(november, january)
  expect(twoMonths).toStartAt('2020-11-16', '2020-11-20', '2020-12-16','2020-12-05','2020-12-20')
  
})

test('repeat monthly - alternat months on 16th, 20th and 5th', () => {
  const ical = loadICal(eveyMonthForever.replace('RRULE:FREQ=MONTHLY', 'RRULE:FREQ=MONTHLY;BYMONTHDAY=16,20,5;INTERVAL=2'))
  
  const oneMonth = ical.getEventsDuringInterval(november, december)
  expect(oneMonth).toStartAt('2020-11-16', '2020-11-20')
  
  const twoMonths = ical.getEventsDuringInterval(november, january)
  expect(twoMonths).toStartAt('2020-11-16', '2020-11-20')
  
  const threeMonths = ical.getEventsDuringInterval(november, february)
  expect(threeMonths).toStartAt('2020-11-16', '2020-11-20', '2021-01-16','2021-01-05','2021-01-20')
})