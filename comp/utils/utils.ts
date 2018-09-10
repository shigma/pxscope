import Vue from 'vue/types'

export function randomID(): string {
  return Math.floor(Math.random() * 36 ** 6).toString(36)
}

export function getElement(ref: Vue | Vue[] | Element | Element[]): Element {
  const node = ref instanceof Array ? ref[0] : ref
  return '$el' in node ? node.$el : node
}
