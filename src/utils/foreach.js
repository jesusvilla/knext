function forEachIterable (iterable, cb) {
  for (let i = 0, length = iterable.length; i < length; i++) {
    cb(iterable[i], i)
  }
}

function forEachObject (object, cb) {
  forEachIterable(Object.keys(object), key => {
    cb(object[key], key)
  })
}

/**
 * forEach
 *
 * @callback iterableCallback
 * @param {*} item - Value of each element
 * @param {(number|string)} key - If 'element' is iterable then returns number, else string
 *
 * @param {(*[]|Object|string)} element
 * @param {iterableCallback} cb - The callback of each iteration
 */
module.exports = function forEach (element, cb) {
  if (element == null) {
    return void 0
  }
  if (element.length !== void 0) {
    forEachIterable(element, cb)
  } else if (typeof element === 'object') {
    forEachObject(element, cb)
  }
}