export function isNumber (input) {
  return /^\d+$/.test(input)
}

export function isFunction (input) {
  return typeof input === 'function'
}

export function isString (input) {
  return typeof input === 'string'
}