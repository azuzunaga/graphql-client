/**
 * A mustache function that transforms
 *
 * [ {{foo}} ~ {{bar}}
 * ]
 *
 * with [{ foo: 'a', bar: 1 }, { foo: 'b', bar: 2 }] into
 *
 * [ a ~ 1
 * , b ~ 2
 * ]
 */
export const templateOverList = <T>(text: string, list: Array<T>) => {
  const match = text.match(/^\s*\n(.*?)\n(.*?)\n\s*$/)
  if (!match) {
    throw new Error('templateOverList requires a two-line template')
  }

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const render = (template: string, elem: any): string =>
    template
      .replace(/{{\.}}/g, (_) => elem)
      .replace(/{{(.*?)}}/g, (_, name) => elem[name])

  const templateFirst = match[1]
  const templateRest = templateFirst.replace(/[^\s]/, ',')
  const suffix = match[2]

  const listFirst = list[0]
  const listRest = list.slice(1)

  const lines = ([] as string[]).concat(
    render(templateFirst, listFirst),
    listRest.map((elem) => render(templateRest, elem)),
    suffix
  )

  return lines.map((s) => s + '\n').join('')
}

/**
 * Loosely based on lodash's assign.
 */
export const mergeObjects = <T extends object>(objects: T[]): T =>
  objects.reduce((acc, obj) => ({ ...acc, ...obj }), {} as T)
