function broadcast(componentName, eventName, ...args) {
  this.$children.forEach((child) => {
    if (child.$options.componentName === componentName) {
      child.$emit.call(child, eventName, ...args)
    } else {
      broadcast.call(child, componentName, eventName, ...args)
    }
  })
}

module.exports = {
  methods: {
    broadcast,
    dispatch(componentName, eventName, ...args) {
      let parent = this.$parent || this.$root
      let name = parent.$options.componentName
      while (parent && (!name || name !== componentName)) {
        parent = parent.$parent
        if (parent) name = parent.$options.componentName
      }
      if (parent) parent.$emit.apply(parent, eventName, ...args)
    },
  }
}
