// shared/index.js
export const isObject = (val) => val !== null && typeof val === 'object'

export const hasOwn = (target, key) => Object.prototype.hasOwnProperty.call(target, key)

export const hasChanged = (newValue, oldValue) => newValue !== oldValue

export function isFunction (value) {
  return typeof value === 'function'
}

export function isArray (value) {
  return Array.isArray(value)
}

export function isString (value) {
  return typeof value === 'string'
}

export function isNumber (value) {
  return typeof value === 'number'
}

const camelizeRE = /-(\w)/g
export function camelize (str) {
  return str.replace(camelizeRE, (_, c) => (c ? c.toUpperCase() : ''))
}

export function capitalize (str) {
  return str[0].toUpperCase() + str.slice(1)
}

export function isBoolean (value) {
  return typeof value === 'boolean'
}
