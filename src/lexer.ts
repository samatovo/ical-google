

// Take in an ics text and return a bunch of lines
export function lex(icsText: string): IcsLine[] {
  const lines = icsText.replace(/\r\n /g, '').split(/\r\n/)
  const cleanLines = lines.map(lexLine)
  return cleanLines
}

export function safe(icsLine: string) {
  return icsLine
    .replace(/∑/g, '∑sum')
    .replace(/\\\,/g, '∑com')
    .replace(/\\\;/g, '∑sem')
    .replace(/\\n/g, '∑nln')
}

export function clean(safe: string): string {
  return safe
    .replace(/∑com/g, ',')
    .replace(/∑sem/g, ';')
    .replace(/∑nln/g, '\n')
    .replace(/∑sum/g, '∑')
}

function cleanList(safeList: string[]): string[] {
  return safeList.map(clean)
}

export type IcsLine = {
  line: string
  name: string
  params: {[key: string]: string}
  values: string[]
  value: string
  next?: IcsLine
}

export function lexLine(icsLine: string): IcsLine {
  const icsLineSafe = safe(icsLine)

  const [nameParams, ...valuesParts] = icsLineSafe.split(':')
  const value = valuesParts.join(':')
  const values = cleanList(value.split(','))
  const [name, ...paramsList] = nameParams.split(';')
  const cleanParams = cleanList(paramsList)
  const params = cleanParams
    .map(str => str.split('='))
    .reduce((acc, [k, v]) =>({...acc, [k]: v}), {})
  return {
    get line() { return name + cleanParams.map(p => `;${p}`).join() + ":" + values.join(',')},
    name: clean(name),
    params,
    values,
    get value(){ return  values[0] }
  }
}