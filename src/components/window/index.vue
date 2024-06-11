<template>
  <div class="window" v-if="show" :style="{ width: windowWidth + 'px' }">
    <div class="title">
      <el-icon class="icon-back" @click="close">
        <Back />
      </el-icon>
    </div>
    <div class="Body">
      <slot></slot>
    </div>
    <div class="footer">
      <template v-if="buttons && buttons.length > 0 || showCancel">
        <div class="dialog-footer">
          <el-button link @click="close" v-if="showCancel">取消</el-button>
          <el-button @click="btn.click" v-for="btn in buttons" :type="btn.type" color="green">{{ btn.text
            }}</el-button>
        </div>
      </template>
    </div>
  </div>
</template>
<script setup>
const windowWidth = window.innerWidth - 300
const bodyHeight = window.innerHeight - 30 - 50
const emit = defineEmits()
const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  buttons: {
    type: Array
  },
  showCancel: {
    type: Boolean,
    default: true
  }
})
const close = () => {
  emit('closeWindow')
}

</script>

<style scoped lang="scss">
.window {
  position: absolute;
  top: 0px;
  left: 10px;
  width: 100%;
  height: calc(100vh - 90px);
  background: #fff;
  z-index: 50;

  .title {
    height: 30px;
    display: flex;
    align-items: center;
    padding-left: 10px;

    .icon-back {
      cursor: pointer;
    }
  }

  .Body {
    height: calc(100vh - 200px);
    padding: 10px;
    overflow:auto;

    .title-input {
      border-bottom: 1px solid #ddd;
      width: 100%;

      :deep(.el-input__wrapper) {
        box-shadow: 0 0 0 0px var(--el-input-border-color, var(--el-border-color)) inset;
        cursor: default;
      }

    }

  }

  .footer {
    // border-top: 1px solid #ddd;
    text-align: center;
    line-height: 50px;
  }
}
</style>
