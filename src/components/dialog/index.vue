<template>
  <div>
    <el-dialog :show-close="showClose" :draggable="true" :showClose="showClose" :title="title" class="cust-dialog"
      :top="top" :close-on-click-modal="false" 
      :modelValue="show" :width="width" :showCancel="showCancel">
      <div class="dialog-body">
        <slot></slot>
      </div>
      <template v-if="buttons&&buttons.length>0||showCancel">
        <div class="dialog-footer">
          <el-button link @click="close">取消</el-button>
           <el-button v-for="btn in buttons" :type="btn.type" 
           @click="btn.click" color="green">{{ btn.text }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
const props = defineProps({
  title:{
    type:String,
  },
  show: {
    type: Boolean,
    default: false
  },
  showClose: {
    type: Boolean,
    default: false
  },
  showCancel: {
    type: Boolean,
    default: true
  },
  top: {
    type: String,
    default: '50px'
  },
  width: {
    type: String,
    default: "30%"
  },
  buttons:{
    type:Array,
  }
})
const emit=defineEmits()
const close=()=>{
  emit('close')
}


</script>
<style scoped lang="scss">
.cust-dialog{
  .dialog-body{
      padding-top:30px;
      border-top: 1px solid #ddd;
      min-height:100px;
  }
  .dialog-footer{
    text-align: right;
  }
}
</style>
