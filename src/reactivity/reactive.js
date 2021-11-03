import { isObject } from '../shared.js'
import { mutableHandlers, mutableCollectionHandlers } from './baseHandlers.js'

const collectionTypes = new Set([Set, Map, WeakMap, WeakSet])

export function reactive (target) {
  // 给函数传入不同的handlers然后通过target类型进判断
  return createReactiveObject(target, false, mutableHandlers, mutableCollectionHandlers)
}

function createReactiveObject (target, isReadonly, baseHandlers, collectionHandlers) {
  // 如果传入的target不是对象，那么直接返回该对象即可
  if (!isObject(target)) {
    return target
  }
  // 根据传入的target的类型判断该使用哪种handler，如果是Set或Map则采用collectionHandlers，如果是普通对象或数组则采用baseHandlers
  const observed = new Proxy(target, collectionTypes.has(target.constructor) ? collectionHandlers : baseHandlers)
  return observed
}
