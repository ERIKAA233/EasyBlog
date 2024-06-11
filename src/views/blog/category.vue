<template>
  <div>
    <el-button v-if="userInfo.roleType==1" color="green" @click="showEdit('add')">新增分类</el-button>
    <Table :columns="columns" :showPagination="false" :dataSource="tableData" :fetch="loadDataList"
      :options="tableOptions">
      <template #cover="{ index, row }">
        <Cover :cover="row.cover" />
      </template>
      <template #op="{ index, row }">
        <div class="op" v-if="userInfo.roleType == 1">
          <a href="#" @click="showEdit('update', row)">修改</a>
          <el-divider direction="vertical"></el-divider>
          <el-popconfirm width="200px" confirm-button-type="success" icon-color="green" confirm-button-text="确定"
            cancel-button-text="取消" :icon="InfoFilled" @confirm="del(row)" :title="`您确定要删除${row.categoryName}?`"
            @cancel="cancelEvent">
            <template #reference>
              <a href="#">删除</a>
            </template>
          </el-popconfirm>
          <el-divider direction="vertical"></el-divider>
          <a href="#" :class="[index==0?'not-allow':'a-link']" @click="changeSort(index,'up')">上移</a>
          <el-divider direction="vertical"></el-divider>
          <a href="#" :class="[index == tableData.list.length-1? 'not-allow' : 'a-link']"
            @click="changeSort(index, 'down')">下移</a>
        </div>
        <span v-else>---</span>
      </template>
    </Table>
    <Dialog :show="dialogConfig.show" :title="dialogConfig.title" :buttons="dialogConfig.buttons"
      @close="dialogConfig.show = false" width="500px">
      <el-form :model="formData" :rules="rules" ref="formDataRef" label-width="100px">
        <!-- 账号输入框 -->
        <el-form-item prop="categoryName" label="名称">
          <el-input v-model="formData.categoryName" placeholder="请输入名称" size="large" clearable>
          </el-input>
        </el-form-item>
        <!-- 密码输入框 -->
        <el-form-item label="封面" prop="cover">
          <CoverUpload v-model="formData.cover" />
        </el-form-item>
        <el-form-item label="简介" prop="categoryDesc">
          <el-input type="textarea" :autosize="{ minRows: 4, maxRows: 4 }" v-model="formData.categoryDesc"
            placeholder="请输入简介" size="large" clearable>
          </el-input>
        </el-form-item>
      </el-form>
    </Dialog>

  </div>
</template>
<script setup>
import { ElMessage } from 'element-plus';
import { getCurrentInstance, reactive, nextTick, ref } from 'vue'
const { proxy } = getCurrentInstance()
const userInfo = ref(proxy.VueCookies.get('userInfo') || {})
const columns = [{
  label: "封面",
  prop: 'cover',
  width: 100,
  scopedSlots: 'cover',
},
{
  label: "名称",
  prop: 'categoryName',
  width: 200,
},
{
  label: "简介",
  prop: 'categoryDesc',
},
{
  label: "博客数量",
  prop: 'blogCount',
  width: 100,
},
{
  label: "操作",
  prop: 'op',
  width: 200,
  scopedSlots: 'op'
}
]
const api = {
  "loadDataList": '/category/loadAllCategory4Blog',
  'saveCategory': '/category/saveCategory4Blog',
  'delCategory': '/category/delCategory4Blog',
  'changeSort':'/category/changeCategorySort4Blog'
}
const tableData = reactive({})
const formData = reactive({})
const formDataRef = ref()
const rules = {
  categoryName: [{ required: true, message: '请输入分类名称' }],

}
const tableOptions = {
  extHeight: 10,
}
//新增 修改

const dialogConfig = reactive({
  show: false,
  title: '标题',
  buttons: [
    {
      type: 'primary',
      text: '确定',
      click: (e) => {
        submitForm();
      }
    },
  ]
})
const loadDataList = async () => {
  let result = await proxy.request({
    url: api.loadDataList
  })
  if (result.code == 200) {
    tableData.list = result.data
  }
}

const showEdit = (type, data) => {
  dialogConfig.show = true
  nextTick(() => {
    formDataRef.value.resetFields()
    formData.categoryId = undefined
    if (type == "add") {
      dialogConfig.title = '新增分类'
    } else if (type == "update") {
      dialogConfig.title = '编辑分类'
      Object.assign(formData, data)
    }
  })
}
const submitForm = () => {
  formDataRef.value.validate(async (valid) => {
    if (!valid) return
    let params = {}
    Object.assign(params, formData)
    let result = await proxy.request({
      url: api.saveCategory,
      params,
    })
    if (result.code == 200) {
      dialogConfig.show = false
      ElMessage({
        type:'success',
        message:'操作成功!'
      })
      loadDataList()
    }else{
      ElMessage({
        type:'error',
        message:'操作失败!'
      })
    }
  })
}
//删除
const del = async(data) => {
  let result =await proxy.request({
    url:api.delCategory,
    params:{
      categoryId:data.categoryId
    }
  })
  if(result.code==200){
    loadDataList()
    ElMessage({
      type:'success',
      message:'删除成功!'
    })
  }else{
    ElMessage({
      type:'error',
      message:'删除失败!'
    })
  }
}

const changeSort=async(index,type)=>{
  let categoryList=tableData.list;
  if(type==='down' && index===categoryList.length-1 || type==='up' && index===0){
    return
  }

  let temp = categoryList[index]
  let number=type=='down'?1:-1
  categoryList.splice(index,1)
  categoryList.splice(index+number,0,temp)

  let result =await proxy.request({
    url:api.changeSort,
    dataType:'json',
    params:categoryList,
  })
  if(result.code==200){
    ElMessage({
      type:'success',
      message:type==='up'?'上移成功':'下移成功'
    })
    loadDataList()
  }
}
</script>
<style scoped lang="scss">
.op {
  display: flex;
  align-items: center;

  a {
    text-decoration: none;
    color: green;
  }
  .not-allow{
    cursor:not-allowed;
    color:#ddd
  }
}
</style>
