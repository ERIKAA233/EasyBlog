<template>
  <div>
    <div class="top-panel" style="padding:10px">
      <el-form :model="searchFormData" :inline="true">
        <el-form-item label="标题" prop="titleFuzzy">
          <el-input v-model="searchFormData.titleFuzzy" placeholder="支持模糊搜索" clearable
            @keyup.enter="loadDataList"></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="searchFormData.status" placeholder="选择状态过滤" style="width: 200px">
            <el-option :value="0" label="草稿" />
            <el-option :value="1" label="已发布" />
          </el-select>
        </el-form-item>
        <el-form-item label="分类" prop="categoryId">
          <el-select v-model="searchFormData.categoryId" placeholder="请选择分类" style="width: 200px">
            <el-option v-for="item in categoryList" :label="item.categoryName" :value="item.categoryId" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button @click="loadDataList" color="green" type="primary">搜索</el-button>
          <el-button @click="showEdit('add')" color="green" type="primary">新增博客</el-button>
        </el-form-item>
      </el-form>
    </div>
    <Table :columns="columns" :showPagination="true" :dataSource="tableData" :fetch="loadDataList"
      :options="tableOptions">
      <!-- 封面 -->
      <template #cover="{ index, row }">
        <Cover :cover="row.cover" />
      </template>
      <!-- 文章信息 -->
      <template #blogInfo="{ index, row }">
        <div>标题:{{ row.title }}</div>
        <div>分类:{{ row.categoryName }}</div>
        <div>作者:{{ row.nickName }}</div>
      </template>
      <!-- 类型 -->
      <template #typeName="{ index, row }">
        <div>类型:<span v-if="row.type === 0">原创</span><span v-if="row.type === 1">转载</span></div>
        <div v-if="row.type === 1">转载地址:{{ row.reprintUrl }}</div>
        <div>作者:{{ row.nickName }}</div>
      </template>
      <!-- 状态 -->
      <template #statusName="{ index, row }">
        <span v-if="row.status === 1" style="color:green;">{{ row.statusName }}</span>
        <span v-else style="color:red;">{{ row.statusName }}</span>
      </template>
      <!-- 时间 -->
      <template #time="{ index, row }">
        <div>创建时间:{{ row.createTime }}</div>
        <div>更新时间:{{ row.lastUpdateTime }}</div>
      </template>
      <template #op="{ index, row }">
        <div class="op">
          <div v-if="userInfo.userId == row.userId || userInfo.roleType==1">
            <a href="#" @click="showEdit('update', row)">修改</a>
            <el-divider direction="vertical"></el-divider>
            <el-popconfirm width="200px" confirm-button-type="success" icon-color="green" confirm-button-text="确定"
              cancel-button-text="取消" :icon="InfoFilled" @confirm="delBlog(row)" :title="`您确定要删除${row.title}?`"
              @cancel="cancelEvent">
              <template #reference>
                <a href="#">删除</a>
              </template>
            </el-popconfirm>
            <el-divider direction="vertical"></el-divider>
          </div>
          <a href="#" @click="showDetail(row.blogId)">预览</a>
        </div>
      </template>
    </Table>
    <!-- 新增弹窗 -->
    <BlogEdit ref="blogEditRef" @callBack="loadDataList" />
    <!-- 修改弹窗 -->
    <BlogDetail ref="blogRef" />
  </div>
</template>
<script setup>
import { ref, reactive, getCurrentInstance, onMounted } from 'vue'
import BlogEdit from './blogEdit.vue'
import BlogDetail from './blogDetail.vue'
import { ElMessage } from 'element-plus';
onMounted(() => {
  loadCategoryList();
  loadDataList()
})

const columns = [{
  label: "封面",
  prop: 'cover',
  width: 80,
  scopedSlots: 'cover',
},
{
  label: "文章信息",
  prop: 'categoryName',
  scopedSlots: 'blogInfo',
},
{
  label: "编辑器",
  prop: 'editorTypeName',
  width: 100,
},
{
  label: "类型",
  prop: 'typeName',
  width: 200,
  scopedSlots: 'typeName'
},
{
  label: "评论",
  prop: 'allowCommentTypeName',
  width: 100,
},
{
  label: "状态",
  prop: 'statusName',
  width: 100,
  scopedSlots: 'statusName'
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
const { proxy } = getCurrentInstance()
const userInfo = ref(proxy.VueCookies.get('userInfo') || {})
const searchFormData = reactive({})
const tableData = reactive({})
const blogEditRef = ref(null)
const blogRef=ref(null)
const tableOptions = {
  extHeight: 77,
}
const api = {
  loadCategory: '/category/loadAllCategory4Blog',
  loadDataList: '/blog/loadBlog',
  delBlog: '/blog/recoveryBlog'
}
const categoryList = ref([])

//加载分类
const loadCategoryList = async () => {
  let result = await proxy.request({
    url: api.loadCategory
  })
  categoryList.value = result.data
}
const loadDataList = async () => {
  let params = {
    pageNo: tableData.pageNo,
    pageSize: tableData.pageSize
  }
  Object.assign(params, searchFormData)

  let result = await proxy.request({
    url: api.loadDataList,
    params: params
  })
  if (result.code == 200) {
    Object.assign(tableData, result.data)
  }
}
// 删除博客
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
const showEdit = (type, data) => {
  blogEditRef.value.init(type, data)
}
//详情
const showDetail = (blogId) => {
  blogRef.value.showDetail(blogId)
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
