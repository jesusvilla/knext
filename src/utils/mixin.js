function copyProperties (target, source) {
  const allPropertyNames = Object.getOwnPropertyNames(source).concat(Object.getOwnPropertySymbols(source))

  allPropertyNames.forEach((propertyName) => {
    if (propertyName.match(/^(?:constructor|prototype|arguments|caller|name|bind|call|apply|length)$/)) {
      return void 0
    }
    Object.defineProperty(target, propertyName, Object.getOwnPropertyDescriptor(source, propertyName))
  })
}

export default function allOf (BaseClass, ...Mixins) {
  class Base extends BaseClass {
    constructor (...args) {
      super(...args)

      Mixins.forEach(Mixin => {
        copyProperties(this, new Mixin(...args))
      })
    }
  }

  Mixins.forEach(Mixin => {
    copyProperties(Base.prototype, Mixin.prototype)
  })

  return Base
}