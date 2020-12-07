import { endOfDay, startOfDay } from 'date-fns'
import add from 'date-fns/add'
import parseISO from 'date-fns/parseISO'
import {readFileSync} from 'fs'
import {loadICal} from './iCal'


const basic = readFileSync('./src/examples/basic.ics').toString()
const ical = loadICal(basic)
const start = startOfDay(new Date())
const end = endOfDay(new Date())


const today = ical.getEventsDuringInterval(start, end)
console.log(today)

