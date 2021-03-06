## mini-vue3

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Title</title>
</head>
<body>
<div>
  <div>msg: <span id="msgBox">{{ msg }}</span></div>
  <div>vue: <span id="vueBox">{{ lang.vue }}</span></div>

  <button id="updateMsgValueBtn">修改msg值</button>
  <button id="setVue">修改Vue的值</button>
</div>

<script type="module">
  import { effect, reactive } from '../index.js'

  const state = reactive({
    msg: Date.now(),
    lang: {
      vue: '3.0'
    }
  })

  window.state = state

  // 默认执行一次
  effect(() => {
    msgBox.innerText = state.msg
  })
  effect(() => {
    vueBox.innerText = state.lang.vue
  })

  // 定义一个使用到响应式数据的 dom更新函数
  updateMsgValueBtn.onclick = function () {
    state.msg = Date.now()
    console.log(state)
  }

  // 点击触发数据更新
  setVue.onclick = function () {
    state.lang.vue = 'vue-next ' + Date.now()
  }

</script>
</body>
</html>

```
