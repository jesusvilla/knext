// https://stackoverflow.com/questions/29879267/es6-class-multiple-inheritance
/* function getProps (obj) {
  const properties = new Set()
  let currentObj = obj
  do {
    Object.getOwnPropertyNames(currentObj).map(item => properties.add(item))
    Object.getOwnPropertySymbols(currentObj).map(item => properties.add(item))
  } while (Object.getPrototypeOf(currentObj) !== Object.getPrototypeOf({}) && (currentObj = Object.getPrototypeOf(currentObj)))
  return [...properties]
} */

function copyProperties (target, source) {
  const totalProps = []
  let currentObj = source
  do {
    const properties = []
    Object.getOwnPropertyNames(currentObj).map(item => properties.push(item))
    Object.getOwnPropertySymbols(currentObj).map(item => properties.push(item))

    properties.forEach(propertyName => {
      if (totalProps.indexOf(propertyName) === -1) {
        totalProps.push(propertyName)
      } else {
        return void 0
      }
      if (propertyName.match(/^(?:constructor|prototype|arguments|caller|name|bind|call|apply|toString|length)$/)) {
        return void 0
      }
      const desc = Object.getOwnPropertyDescriptor(currentObj, propertyName)
      Object.defineProperty(target, propertyName, desc)
    })
  } while (Object.getPrototypeOf(currentObj) !== Object.getPrototypeOf({}) && (currentObj = Object.getPrototypeOf(currentObj)))
}

export default function allOf (/* BaseClass, ...Mixins */) {
  if (arguments.length === 0) {
    throw new Error('Arguments is required')
  }

  if (arguments.length === 1) {
    return class extends arguments[0] {}
  }

  class Base extends arguments[0] {
    constructor (...args) {
      super(...args)

      for (let i = 1; i < arguments.length; i++) {
        copyProperties(this, new arguments[i](...args))
      }
    }
  }

  for (let i = 1; i < arguments.length; i++) {
    copyProperties(Base.prototype, arguments[i].prototype)
  }

  return Base
}

/* function extend (BaseClass, ExtendClass) {
  // https://alligator.io/js/class-composition/
  if (ExtendClass === void 0) {
    ExtendClass = function (...args) {
      return new BaseClass(...args)
    }
  }
  ExtendClass.prototype = Object.create(BaseClass)
  ExtendClass.prototype.constructor = ExtendClass

  return ExtendClass
}

export default function mixin () {
  if (arguments.length === 0) {
    throw new Error('Arguments is required')
  }

  let newClass = arguments[0]
  if (arguments.length > 1) {
    for (let i = 1; i < arguments.length; i++) {
      newClass = extend(newClass, arguments[i])
    }
  }
  return newClass
}
*/

/* const _typeof = typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol' ? function (obj) {
  return typeof obj
} : function (obj) {
  return obj && typeof Symbol === 'function' && obj.constructor === Symbol ? 'symbol' : typeof obj
}

function _inherits (subClass, superClass) {
  if (typeof superClass !== 'function' && superClass !== null) {
    throw new TypeError('Super expression must either be null or a function, not ' + (
      typeof superClass === 'undefined' ? 'undefined' : _typeof(superClass)))
  }
  subClass.prototype = Object.create(
    superClass && superClass.prototype,
    {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    })
  if (superClass) {
    Object.setPrototypeOf
      ? Object.setPrototypeOf(subClass, superClass)
      : subClass.__proto__ = superClass.__proto__ // eslint-disable-line no-proto
  }
}

export default function mixin () {
  let NewSuperClass = function () {}
  for (let i = 0; i < arguments.length; i++) {
    _inherits(NewSuperClass, arguments[i])
    NewSuperClass = arguments[i]
  }
  return NewSuperClass
} */