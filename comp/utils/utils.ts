import Vue from 'vue/types'

export function randomID(): string {
  return Math.floor(Math.random() * 36 ** 6).toString(36)
}

export function refElement(this: Vue, name: string): Element {
  const ref = this.$refs[name]
  const node = ref instanceof Array ? ref[0] : ref
  return '$el' in node ? node.$el : node
}

export const eventHandlers = {
  stop(event: Event): void {
    event.stopPropagation()
  },
  prevent(event: Event): void {
    event.preventDefault()
  },
}

let zIndex = 2000

export function nextZIndex() {
  return zIndex ++
}
