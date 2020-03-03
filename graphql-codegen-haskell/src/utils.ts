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
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const render = (template: string, elem: any): string =>
    template
      .replace(/{{\.}}/g, (_) => elem)
      .replace(/{{(.*?)}}/g, (_, name) => elem[name])

  const templateFirst = removeEmptyLines(text)
  const templateRest = templateFirst.replace(/[^\s]/, ',')

  if (list.length === 0) {
    return templateFirst.replace(/(\s*[^\s]).*/, '$1') + '\n'
  }

  const listFirst = list[0]
  const listRest = list.slice(1)

  const lines = ([] as string[]).concat(
    render(templateFirst, listFirst),
    listRest.map((elem) => render(templateRest, elem))
  )

  return lines.map((s) => s + '\n').join('')
}

/**
 * Loosely based on lodash's assign.
 */
export const mergeObjects = <T extends object>(objects: T[]): T =>
  objects.reduce((acc, obj) => ({ ...acc, ...obj }), {} as T)

/**
 * Remove empty lines in the given string.
 */
const removeEmptyLines = (s: string) =>
  s
    .split('\n')
    .filter((s) => !s.match(/^\s*$/))
    .join('\n')
