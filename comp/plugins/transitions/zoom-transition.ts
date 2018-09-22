import { style, emit, store, restore, Types } from '../../utils/transition'
import { FunctionalComponentOptions } from 'vue'

/** Test if a position indicates vertical transition. */
function isVertical(position: any) {
  return position === 'top' || position === 'bottom'
}

/** Test if a position indicates horizontal transition. */
function isHorizontal(position: any) {
  return position === 'left' || position === 'right'
}

interface Props {
  origin: Types.Position | number
  direction: Types.Direction
  duration: number
  timingFunction: string
}

export default {
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

    if (isVertical(origin) || (!isHorizontal(origin) && direction !== 'horizontal')) {
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
          store(el, properties)
          el.style.opacity = '0'
          el.style.transform = transform
          el.style.transition = transition
          el.style.transformOrigin = transformOrigin
        },
        enter(el: HTMLElement, done: Function) {
          el.style.opacity = '1'
          el.style.transform = null
          setTimeout(done, 1000 * duration)
        },
        afterEnter(el: HTMLElement) {
          restore(el, properties)
          emit(listeners, 'after-enter', el)
        },
        beforeLeave(el: HTMLElement) {
          emit(listeners, 'before-leave', el)
          store(el, properties)
          el.style.opacity = '1'
          el.style.transform = null
          el.style.transition = transition
          el.style.transformOrigin = transformOrigin
        },
        leave(el: HTMLElement, done: Function) {
          el.style.opacity = '0'
          el.style.transform = transform
          setTimeout(done, 1000 * duration)
        },
        afterLeave(el: HTMLElement) {
          restore(el, properties)
          emit(listeners, 'after-leave', el)
        },
      }
    }, children)
  }
} as FunctionalComponentOptions<Props>
