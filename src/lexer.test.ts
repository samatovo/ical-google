import {readFileSync} from 'fs' 
import {lex, lexLine, clean, safe} from './lexer'

const noEvents = readFileSync('./src/examples/no-events.ics').toString()
const longDesc = readFileSync('./src/examples/long-desc.ics').toString()

test('lexing no-events', () => {
  expect(lex(noEvents).length).toBe(27)
})

test('lexing long desc (condensing lines)', () => {
  expect(lex(longDesc).length).toBe(23)
})


test('ics -> safe -> cleam', () => {
  expect(clean(safe(''))).toBe('')
  expect(clean(safe('left\\,right'))).toBe('left,right')
  expect(clean(safe('left\\;right'))).toBe('left;right')
  expect(clean(safe('left\\nright'))).toBe('left\nright')
  expect(clean(safe('left∑right'))).toBe('left∑right')
  expect(clean(safe('left∑comright'))).toBe('left∑comright')
  expect(clean(safe('left∑semright'))).toBe('left∑semright')
  expect(clean(safe('left∑nlnright'))).toBe('left∑nlnright')
  expect(clean(safe('left∑sumright'))).toBe('left∑sumright')
})

test('parsing long desc (escaping comma, semicolon and new line)', () => {
  expect(lex(longDesc)[13].name).toBe("DESCRIPTION")
  //expect(parse(longDesc)[13]).toBe("DESCRIPTION:Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua; Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur; Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum")
  //expect(parse(longDesc)[13]).toBe("DESCRIPTION:Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua; Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur; Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum")
})

test('lexing a line with no params', () => {
  const line = lexLine('VERSION:2.0')
  expect(line.name).toBe('VERSION')
  expect(line.params).toStrictEqual({})
  expect(line.value).toStrictEqual('2.0')
})

test('lexing a line with : in value', () => {
  const line = lexLine('VERSION:2.0:3.0')
  expect(line.value).toStrictEqual('2.0:3.0')
})

test('lexing a line with one param', () => {
  const line = lexLine('EXDATE;TZID=Europe/London:20201116T110000')
  expect(line.name).toBe('EXDATE')
  expect(line.params).toStrictEqual({TZID: 'Europe/London'})
  expect(line.value).toStrictEqual('20201116T110000')
})

test('lexing a line with several param', () => {
  const line = lexLine('ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;CN=Ewan Milne;X-NUM-GUESTS=0:mailto:ewan.milne@kaluza.com')
  expect(line.name).toBe('ATTENDEE')
  expect(line.params).toStrictEqual({
    'CUTYPE': 'INDIVIDUAL',
    'ROLE': 'REQ-PARTICIPANT',
    'PARTSTAT': 'ACCEPTED',
    'CN': 'Ewan Milne',
    'X-NUM-GUESTS': '0',
  })
  expect(line.value).toStrictEqual('mailto:ewan.milne@kaluza.com')
})

test('lexing a line with special in name', () => {
  const line = lexLine('one\\,two\\;three\\nfour∑com∑five:value')
  expect(line.name).toBe('one,two;three\nfour∑com∑five')
})
test('lexing a line with special in value', () => {
  const line = lexLine('key:one\\,two\\;three\\nfour')
  expect(line.value).toStrictEqual('one,two;three\nfour')
})
test('lexing a line with special in param', () => {
  const line = lexLine('key;one\\,two\\;three\\nfour=0:val')
  expect(line.params).toStrictEqual({'one,two;three\nfour': '0'})
})