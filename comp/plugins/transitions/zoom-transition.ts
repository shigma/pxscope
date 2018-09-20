import { style, emit, store, restore, Types } from './util'
import { FunctionalComponentOptions } from 'vue'

/** Test if a position indicates vertical transition. */
export function isVertical(position: any) {
  return position === 'top' || position === 'bottom'
}

/** Test if a position indicates horizontal transition. */
export function isHorizontal(position: any) {
  return position === 'left' || position === 'right'
}

interface Props {
  origin: Types.Position | number
  direction: Types.Direction
  duration: number
  timingFunction: string
}

module.exports = {
  functional: true,

  props: {
    origin: {
      type: String,
      default: 'top',
    },
    direction: {
      type: String,
      default: 'vertical',
    },
    duration: {
      type: Number,
      default: 0.3,
    },
    timingFunction: {
      type: String,
      default: 'cubic-bezier(0.23, 1, 0.32, 1)',
    },
  },

  render(createElement, {
    props: {
      origin,
      direction,
      duration,
      timingFunction,
    },
    listeners,
    children,
  }) {

    let transform: string
    let transformOrigin: string

    if (isVertical(origin) || (!isHorizontal(orientation) && direction !== 'horizontal')) {
      transform = 'scaleY(0)'
      transformOrigin = 'center ' + origin
    } else {
      transform = 'scaleX(0)'
      transformOrigin = origin + ' center'
    }

    const properties = ['transition', 'transform', 'transformOrigin', 'opacity']
    const transition = style(properties, duration, timingFunction)
    
    return createElement('transition', {
      attrs: { css: false },
      on: {
        beforeEnter(el: HTMLElement) {
          emit(listeners, 'before-enter', el)
          store(el, [...properties, transition])
          el.style.transition = transition
        },
        enter(el: HTMLElement, done: Function) {
          el.style.opacity = '0'
          el.style.transform = transform
          el.style.transformOrigin = transformOrigin
          setTimeout(done, 1000 * duration)
        },
        afterEnter(el: HTMLElement) {
          restore(el, [...properties, transition])
          emit(listeners, 'after-enter', el)
        },
        beforeLeave(el: HTMLElement) {
          emit(listeners, 'before-leave', el)
          el.dataset.oldTransition = el.style.transition
          el.dataset.oldPaddingTop = el.style.paddingTop
          el.dataset.oldPaddingBottom = el.style.paddingBottom
          el.dataset.oldOverflow = el.style.overflow
          el.style.height = el.scrollHeight + 'px'
          el.style.overflow = 'hidden'
        },
        leave(el: HTMLElement, done: Function) {
          if (el.scrollHeight !== 0) {
            el.style.transition = transition
            el.style.height = '0'
            el.style.paddingTop = '0'
            el.style.paddingBottom = '0'
          }
          setTimeout(done, 1000 * duration)
        },
        afterLeave(el: HTMLElement) {
          el.style.transition = el.dataset.oldTransition
          el.style.height = ''
          el.style.overflow = el.dataset.oldOverflow
          el.style.paddingTop = el.dataset.oldPaddingTop
          el.style.paddingBottom = el.dataset.oldPaddingBottom
          emit(listeners, 'after-leave', el)
        },
      }
    }, children)
  }
} as FunctionalComponentOptions<Props>
