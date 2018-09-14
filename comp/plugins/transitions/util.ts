/** Turn camelCase into kebab-case. */
function toKebab(string: string) {
  return string.replace(/[A-Z]/g, char => '_' + char.toLowerCase())
}

/** Generate css transition styles. */
export function style(
  properties: string[],
  duration: number,
  timingFunction: string
) {
  return properties
    .filter(name => !name.startsWith('transition'))
    .map(name => `${duration}s ${timingFunction} ${toKebab(name)}`)
    .join(',')
}

/** Emit events in functional components. */
export function emit(
  listeners: Record<string, Function | Function[]>,
  eventName: string,
  ...args: any[]
) {
  const listener = listeners[eventName]
  if (listener instanceof Array) {
    listener.forEach(func => func(...args))
  } else if (listener instanceof Function) {
    listener(...args)
  }
}

/** Store properties into dataset. */
export function store(element: HTMLElement, properties: string[]) {
  properties.forEach((name) => {
    element.dataset[name] = element.style[name]
  })
}

/** Restore properties from dataset. */
export function restore(element: HTMLElement, properties: string[]) {
  properties.forEach((name) => {
    element.style[name] = element.dataset[name]
  })
}

export namespace Types {
  export type Length = 'width' | 'height'
  export type ScrollLength = 'scrollWidth' | 'scrollHeight'
  export type ScrollStart = 'scrollLeft' | 'scrollTop'
  export type PaddingStart = 'paddingLeft' | 'paddingTop'
  export type PaddingEnd = 'paddingRight' | 'paddingBottom'
  export type Direction = 'vertical' | 'horizontal'
  export type Position = 'top' | 'bottom' | 'left' | 'right' | 'center'
}
