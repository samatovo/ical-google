

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

type IcsLine = {
  name: string
  params: string[]
  values: string[]
}

export function lexLine(icsLine: string): IcsLine {
  const icsLineSafe = safe(icsLine)

  const [nameParams, ...valuesParts] = icsLineSafe.split(':')
  const value = valuesParts.join(':')
  const values = value.split(',')
  const [name, ...params] = nameParams.split(';')
  return {
    name: clean(name),
    params: cleanList(params),
    values: cleanList(values),
  }
}