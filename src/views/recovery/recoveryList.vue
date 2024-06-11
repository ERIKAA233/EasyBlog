<template>
  <div class="body">
    <div class="top-panel" style="padding:10px">
      <el-form @submit.native.prevent :model="searchForm" :inline="true" class="search-form" labelAlign="left">
        <el-row :gutter="5">
          <el-col :span="5">
            <el-form-item label="标题">
              <el-input v-model="searchForm.titleFuzzy" placeholder="支持模糊搜索" clearable @keyup.enter="loadDataList"
                allowClear></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-form-item>
              <el-button color="green" @click="loadDataList()">搜索</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <Table :columns="columns" :dataSource="tableData" :fetch="loadDataList" :options="tableOptions">
      <!-- 封面 -->
      <template #cover="{ index, row }">
        <Cover :cover="row.cover" />
      </template>
      <!-- 文章信息 -->
      <template #blogInfo="{ index, row }">
        <div>标题:{{ row.title }}</div>
        <div>文章类型:{{ row.blogType==0?'博客':'专题' }}
          <el-divider direction="vertical"></el-divider>
          <span>{{ row.blogType == 0 ? '分类：' : '专题：' }}</span>
          {{ row.categoryName || '--' }}
        </div>
        <div>作者:{{ row.nickName }}</div>
      </template>
      <!-- 编辑器 -->
      <template #typeName="{ index, row }">
        <div><span v-if="row.editorType === 0">富文本</span>
          <span v-else>Markdown</span>
        </div>
      </template>
      <!-- 状态 -->
      <template #status="{index,row}">
        <span v-if="row.status==1" style="color:green">{{ row.statusName }}</span>
        <span v-else style="color:red">{{ row.statusName }}</span>
      </template>
      <!-- 评论 -->

      <!-- 时间 -->
      <template #time="{ index, row }">
        <div>创建时间:{{ row.createTime }}</div>
        <div>更新时间:{{ row.lastUpdateTime }}</div>
      </template>
      <template #op="{ index, row }">
        <template v-if="row.userId==userInfo.userId||userInfo.roleType==1">
          <div class="op">
            <el-popconfirm width="200px" confirm-button-type="success" icon-color="green" confirm-button-text="确定"
              cancel-button-text="取消" :icon="InfoFilled" @confirm="reductionBlog(row)"
              :title="`您确定要恢复${row.title}吗?恢复后该博客将为草稿状态。`" @cancel="cancelEvent">
              <template #reference>
                <a href="#">还原</a>
              </template>
            </el-popconfirm>

            <el-divider direction="vertical"></el-divider>
            <el-popconfirm width="200px" confirm-button-type="success" icon-color="green" confirm-button-text="确定"
              cancel-button-text="取消" :icon="InfoFilled" @confirm="delBlog(row)" :title="`您确定要彻底删除${row.title}?`"
              @cancel="cancelEvent">
              <template #reference>
                <a href="#">删除</a>
              </template>
            </el-popconfirm>
          </div>
        </template>
        <span v-else>---</span>
      </template>
    </Table>
  </div>
</template>
<script setup>
import { ref, reactive, getCurrentInstance, onMounted } from 'vue'
import {useRouter} from 'vue-router'
import { ElMessage } from 'element-plus';
const rules = {}
const router=useRouter()
const { proxy } = getCurrentInstance()
const searchForm = reactive({})
const tableData = reactive({})
const blogEditRef = ref(null)
const userInfo = ref(proxy.VueCookies.get('userInfo') || {})
const blogRef = ref(null)
const tableOptions = {
  extHeight: 77,
}
const api = {
  loadDataList: '/blog/loadRecoveryList',
  reductionBlog:'blog/reductionBlog',
  delBlog: '/blog/delBlog'
}
const columns = [{
  label: "封面",
  prop: 'cover',
  width: 100,
  scopedSlots: 'cover',
},
{
  label: "文章信息",
  prop: 'categoryName',
  scopedSlots: 'blogInfo',
},
{
    label: "默认编辑器",
    prop: 'editorTypeName',
    width: 100,
},
{
  label: "状态",
  prop: 'status',
  width: 100,
  scopedSlots: 'status'
},
{
    label: "评论",
    prop: 'allowCommentTypeName',
    width: 100,
},
{
  label: "时间",
  prop: 'time',
  width: 250,
  scopedSlots: 'time'
},
{
  label: "操作",
  prop: 'op',
  width: 200,
  scopedSlots: 'op'
}
]
onMounted(()=>{
  loadDataList()
})
const loadDataList=async()=>{
  let params = {
    pageNo: tableData.pageNo,
    pageSize: tableData.pageSize
  }
  Object.assign(params, searchForm)

  let result = await proxy.request({
    url: api.loadDataList,
    params: params
  })
  if (result.code == 200) {
    Object.assign(tableData, result.data)
  }
}
const delBlog = async (data) => {
  let result = await proxy.request({
    url: api.delBlog,
    params: {
      blogId: data.blogId
    }
  })
  if (result.code == 200) {
    loadDataList()
    ElMessage({
      type: 'success',
      message: '删除成功!'
    })
  } else {
    ElMessage({
      type: 'error',
      message: '删除失败!'
    })
  }
}
const reductionBlog=async(data)=>{
  let result=await proxy.request({
    url:api.reductionBlog,
    params:{
      blogId:data.blogId,
    }
  })
  if(result.code==200){
    ElMessage({
      type:'success',
      message:'恢复成功!'
    })
    loadDataList()
  }else{
    ElMessage({
      type:'error',
      message:'恢复失败!'
    })
  }
}
</script>
<style scoped>
.op {
  display: flex;
  align-items: center;

  a {
    text-decoration: none;
    color: green;
  }

}


</style>
