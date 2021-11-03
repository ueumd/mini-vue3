import { track, trigger } from './effect.js'
import { reactive } from './reactive.js'
import { isObject, hasChanged, hasOwn } from '../shared.js'

function createGetter (isReadonly = false, shallow = false) {
  return function get (target, key, receiver) {
    const res = Reflect.get(target, key, receiver)

    // 取值的时候开始收集依赖
    track(target, 'get', key)

    // 判断是否是对象
    if (isObject(res)) {
      return reactive(res)
    }
    return res
  }
}

function createSetter (shallow = false) {
  return function set (target, key, value, receiver) {
    const hadKey = hasOwn(target, key)

    // 修改前获取到旧的值
    const oldValue = target[key]
    const result = Reflect.set(target, key, value, receiver)

    // 如果当前target对象中没有该key，则表示是新增属性
    if (!hadKey) {
      console.log(`用户新增了一个属性，key is ${key}, value is ${value}`)

      // 新增了一个属性，触发依赖的effect执行
      trigger(target, 'add', key, value)

      // 判断一下新设置的值和之前的值是否相同，不同则属于更新操作
    } else if (hasChanged(value, oldValue)) {
      console.log(`用户修改了一个属性，key is ${key}, value is ${value}`)
      trigger(target, 'set', key, value) // 修改了属性值，触发依赖的effect执行
    }
    return result
  }
}

const get = createGetter()
const set = createSetter()

export const mutableHandlers = {
  get,
  set
  // deleteProperty,
  // has,
  // ownKeys
}

export const mutableCollectionHandlers = {}
