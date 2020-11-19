import {lex, IcsLine} from './lexer'

export function parseIcs(icsString: string) {
  const lines: IcsLine[] = lex(icsString)
  const {icalObject, rest} = readBlock('VCALENDAR', lines)
  
  return icalObject
}

export type ICalObject = {
  props: {[key: string]: IcsLine}
  blocks: {[key: string]: ICalObject[]}
}
type ReadBlockType = {
  icalObject: ICalObject
  rest: IcsLine[]
}

function readBlock(blockName: string, lines: IcsLine[]): ReadBlockType {
	let [head, ...rest] = lines
	if (head.line !== `BEGIN:${blockName}`) throw `Malfomed section, must start with "BEGIN:${blockName}" but got: ${head.line}`

  const icalObject: ICalObject = {
    blocks: {},
    props: {}
  }

  do {
    let [current, ...more] = rest
    if(current.name === 'END') {
      if (current.line !== `END:${blockName}`) throw `Malfomed section, must end with "END:${blockName}" but got: ${current.line}`
      return {icalObject, rest:more}
    }

    if (current.name === 'BEGIN') {
      const {icalObject: innerIcalObject, rest: innerRest} = readBlock(current.value, rest)
      if (!Array.isArray(icalObject.blocks[current.value])) {
        icalObject.blocks[current.value] = []
      }
      icalObject.blocks[current.value].push(innerIcalObject)
      rest = innerRest
    } else {
      icalObject.props[current.name] = current
      rest = more
    }
  } while(true)
}