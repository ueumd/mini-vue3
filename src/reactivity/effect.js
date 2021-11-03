let uid = 0

// 存放当前执行的effect
let activeEffect

// 如果存在多个effect，则依次放入栈中
const effectStack = []

/**
 * 用于存储副作用，并建立副作用和依赖的关系
 * 一个副作用可能依赖多个响应式对象，一个响应式对里可能依赖多个属性
 * 同一个属性又可能被多个副作用依赖，因此targetMap设计如下
 *
 * {
 *   [target]: {
 *     [key]:[]
 *   },
 *   [target]: {
 *     [key]:[]
 *   }
 * }
 */
const targetMap = new WeakMap()

export function effect (fn, options = {}) {
  // 返回一个响应式的effect函数
  const effect = createReactiveEffect(fn, options)

  if (!options.lazy) { // 如果不是计算属性的effect，那么会立即执行该effect
    effect()
  }
  return effect
}

function createReactiveEffect (fn, options) {
  /**
   * 所谓响应式的effect，就是该effect在执行的时候会将自己放入到effectStack收到栈顶，
   * 同时将自己标记为activeEffect，以便进行依赖收集与reactive进行关联
   */
  const effect = function reactiveEffect () {
    if (!effectStack.includes(effect)) { // 防止不停的更改属性导致死循环
      try {
        // 在取值之前将当前effect放到栈顶并标记为activeEffect
        // 将自己放到effectStack的栈顶
        effectStack.push(effect)
        // 同时将自己标记为activeEffect
        activeEffect = effect
        console.log('effectStack:', effectStack)
        return fn() // 执行effect的回调就是一个取值的过程
      } finally {
        effectStack.pop() // 从effectStack栈顶将自己移除
        activeEffect = effectStack[effectStack.length - 1] // 将effectStack的栈顶元素标记为activeEffect
        // console.log('activeEffect', activeEffect)
      }
    }
  }

  effect.options = options
  effect.id = uid++
  effect.deps = [] // 依赖了哪些属性，哪些属性变化了需要执行当前effect
  return effect
}

/**
 * 取值的时候开始收集依赖，即收集effect
 */
export function track (target, type, key) {
  if (!activeEffect) { // 收集依赖的时候必须要存在activeEffect
    return
  }
  let depsMap = targetMap.get(target) // 根据target对象取出当前target对应的depsMap结构
  // 第一次收集依赖可能不存在
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }
  let dep = depsMap.get(key) // 根据key取出对应的用于存储依赖的Set集合
  if (!dep) { // 第一次可能不存在
    depsMap.set(key, (dep = new Set()))
  }
  if (!dep.has(activeEffect)) { // 如果依赖集合中不存在activeEffect
    dep.add(activeEffect) // 将当前effect放到依赖集合中
    // 一个effect可能使用到了多个key，所以会有多个dep依赖集合
    activeEffect.deps.push(dep) // 让当前effect也保存一份dep依赖集合
  }
}

/**
 * 数据发生变化的时候，触发依赖的effect执行
 */
export function trigger (target, type, key, value) {
  const depsMap = targetMap.get(target) // 获取当前target对应的Map
  if (!depsMap) { // 如果该对象没有收集依赖
    console.log('该对象还未收集依赖') // 比如修改值的时候，没有调用过effect
    return
  }
  const effects = new Set() // 存储依赖的effect
  const add = (effectsToAdd) => {
    if (effectsToAdd) {
      effectsToAdd.forEach(effect => {
        effects.add(effect)
      })
    }
  }
  const run = (effect) => {
    effect() // 立即执行effect
  }
  /**
   *  对于effect中使用到的数据，那肯定是响应式对象中已经存在的key，当数据变化后肯定能通过该key拿到对应的依赖，
   * 对于新增的key，我们也不需要通知effect执行。
   * 但是对于数组而言，如果给数组新增了一项，我们是需要通知的，如果我们仍然以key的方式去获取依赖那肯定是无法获取到的，
   * 因为也是属于新增的一个索引，之前没有对其收集依赖，但是我们使用数组的时候会使用JSON.stringify(arr)，此时会取length属性，
   * 索引会收集length的依赖，数组新增元素后，其length会发生变化，我们可以通过length属性去获取依赖
   */
  if (key !== null) {
    add(depsMap.get(key)) // 对象新增一个属性，由于没有依赖故不会执行
  }
  if (type === 'add') { // 处理数组元素的新增
    add(depsMap.get(Array.isArray(target) ? 'length' : ''))
  }
  // 遍历effects并执行
  effects.forEach(run)
}
