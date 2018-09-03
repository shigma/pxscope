let hasModal = false
let modalFade = true
let modalDom: HTMLElement

const instances = {}

function getModal() {
  if (modalDom) {
    hasModal = true
  } else {
    hasModal = false
    modalDom = document.createElement('div')
    modalDom.addEventListener('touchmove', (event) => {
      event.preventDefault()
      event.stopPropagation()
    })
    modalDom.addEventListener('click', doOnModalClick)
  }
  return modalDom
}

export let zIndex = 2000

export function nextZIndex() {
  return zIndex ++
}

export function getInstance(id) {
  return instances[id]
}

export function register(id, instance) {
  if (id && instance) {
    instances[id] = instance
  }
}

export function deregister(id) {
  if (id) delete instances[id]
}

export const modalStack = []

export function getTopModal() {
  return modalStack[modalStack.length - 1]
}

export function doOnModalClick() {
  const topItem = getTopModal()
  if (!topItem) return
  const instance = getInstance(topItem.id)
  if (instance && instance.closeOnClickModal) {
    instance.close()
  }
}

export function openModal(id, zIndex, dom, modalClass, _modalFade) {
  if (!id || zIndex === undefined) return
  modalFade = _modalFade

  if (modalStack.find(modal => modal.id === id)) return

  const modalDom = getModal()

  modalDom.classList.add('v-modal')
  if (modalFade && !hasModal) {
    modalDom.classList.add('v-modal-enter')
  }
  if (modalClass) {
    modalClass.trim().split(/\s+/).forEach((item) => {
      return modalDom.classList.add(item)
    })
  }
  setTimeout(() => modalDom.classList.remove('v-modal-enter'), 200)

  if (dom && dom.parentNode && dom.parentNode.nodeType !== 11) {
    dom.parentNode.appendChild(modalDom)
  } else {
    document.body.appendChild(modalDom)
  }

  if (zIndex) {
    modalDom.style.zIndex = zIndex
  }
  modalDom.tabIndex = 0
  modalDom.style.display = ''

  this.modalStack.push({ id, zIndex, modalClass })
}

export function closeModal(id) {
  let modalDom = getModal()

  const topItem = getTopModal()
  if (!topItem) return
  if (topItem.id === id) {
    if (topItem.modalClass) {
      topItem.modalClass.trim().split(/\s+/).forEach((item) => {
        modalDom.classList.remove(item)
      })
    }
    modalStack.pop()
    if (modalStack.length > 0) {
      modalDom.style.zIndex = modalStack[modalStack.length - 1].zIndex
    }
  } else {
    for (let i = modalStack.length - 1; i >= 0; i--) {
      if (modalStack[i].id === id) {
        modalStack.splice(i, 1)
        break
      }
    }
  }

  if (modalStack.length === 0) {
    if (modalFade) modalDom.classList.add('v-modal-leave')
    setTimeout(() => {
      if (modalStack.length === 0) {
        if (modalDom.parentNode) modalDom.parentNode.removeChild(modalDom)
        modalDom.style.display = 'none'
        modalDom = undefined
      }
      modalDom.classList.remove('v-modal-leave')
    }, 200)
  }
}

// handle `esc` key when the popup is shown
window.addEventListener('keydown', (event) => {
  if (event.keyCode === 27) {
    const topModal = getTopModal()
    if (!topModal) return
    const instance = getInstance(topModal.id)
    if (instance && instance.closeOnPressEscape) {
      instance.handleClose
        ? instance.handleClose()
        : instance.handleAction
        ? instance.handleAction('cancel')
        : instance.close()
    }
  }
})
