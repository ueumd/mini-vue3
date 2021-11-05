import { track, trigger } from './effect.js'
import { hasChanged, isObject } from '../shared.js'
import { reactive } from './reactive.js'

export function ref (value) {
  if (isRef(value)) {
    return value
  }

  return new RefImpl(value)
}

export function isRef (value) {
  return !!(value && value.__isRef)
}

function convert (value) {
  return isObject(value) ? reactive(value) : value
}

class RefImpl {
  constructor (value) {
    this.__isRef = true
    this._value = convert(value)
  }

  get value () {
    track(this, 'value')
    return this._value
  }

  set value (newValue) {
    if (hasChanged(newValue, this.__value)) {
      this._value = convert(newValue)
      trigger(this, 'value')
    }
  }
}
