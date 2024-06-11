<template>
  <div>
    <el-button color="green" @click="showEdit('add')">新增专题</el-button>
    <el-row :gutter="10" style="margin-top:10px;">
      <el-col :span="14">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>专题</span>
            </div>
          </template>
          <Table ref="dataTableRef" :columns="columns" :showPagination="true" :dataSource="tableData"
            :fetch="loadDataList" :options="tableOptions" @rowClick="rowClick">
            <template #cover="{ index, row }">
              <Cover :cover="row.cover" />
            </template>
            <template #op="{ index, row }">
              <div class="op">
                <span v-if="userInfo.userId == row.userId">
                  <a href="#" @click="showEdit('update', row)">修改</a>
                  <el-divider direction="vertical"></el-divider>
                  <el-popconfirm width="200px" confirm-button-type="success" icon-color="green" confirm-button-text="确定"
                    cancel-button-text="取消" :icon="InfoFilled" @confirm="del(row)" :title="`您确定要删除${row.title}?`"
                    @cancel="cancelEvent">
                    <template #reference>
                      <a href="#">删除</a>
                    </template>
                  </el-popconfirm>
                </span>
                <div v-else>---</div>
              </div>
            </template>
          </Table>
        </el-card>
      </el-col>
      <el-col :span="10">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>专题文章</span>
            </div>
          </template>
          <div class="special-blog-tree">
            <el-alert title="拖动文章修改排序" type="info" show-icon :closable="false"></el-alert>
            <el-tree class="tree-panel" ref="refTree" :data="blogList" defaultExpandAll node-key="blogId"
              :expand-on-click-node="false" :props="treeProps" :highlight-current="true" draggable
              @node-drop="blogDrag">
              <template #default="{ node, data }">
                <span class="custom-node-style">
                  <span class="node-title">{{ data.title }}
                    <span v-if="data.status == 0" style="color:red">
                      草稿
                    </span>
                  </span>
                  <span class="node-op">
                    <template v-if="data.blogId === '0'">
                      <a href="#" @click="editBlog('add', data)">新增文章</a>
                    </template>
                    <template v-else>
                      <a href="#" @click="showDetail(data)">预览</a>
                      <el-divider direction="vertical"></el-divider>
                      <!-- 权限控制 -->
                      <span v-if="userInfo.userId == data.userId">
                        <a href="#" @click="editBlog('edit', data)">修改</a>
                        <el-divider direction="vertical"></el-divider>
                        <el-popconfirm width="200px" confirm-button-type="success" icon-color="green"
                          confirm-button-text="确定" cancel-button-text="取消" :icon="InfoFilled" @confirm="delBlog(data)"
                          :title="`您确定要删除${data.title}?`" @cancel="cancelEvent">
                          <template #reference>
                            <a href="#">删除</a>
                          </template>
                        </el-popconfirm>
                        <el-divider direction="vertical"></el-divider>
                      </span>
                      <a href="#" @click="editBlog('add', data)">新增下级文章</a>
                    </template>
                  </span>
                </span>
              </template>
            </el-tree>
          </div>
        </el-card>
      </el-col>
    </el-row>
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
    <BlogEdit ref="blogEditRef" @callback="saveBlogCallback" />
    <BlogDetail ref="blogDetailRef" />

  </div>
</template>
<script setup>
import BlogEdit from './blogEdit.vue'
import BlogDetail from './blogDetail.vue'
import { ElMessage } from 'element-plus';
import { getCurrentInstance, reactive, nextTick, ref } from 'vue'
const { proxy } = getCurrentInstance()
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
  loadDataList: '/category/loadCategory4Special',
  saveCategory: '/category/saveCategory4Special',
  delCategory: '/category/delCategory4Special',
  getSpecialInfo: 'blog/getSpecialInfo',
  delBlog: '/blog/recoveryBlog',
  updateSpecialBlogSort: '/blog/updateSpecialBlogSort'
}
const userInfo = ref(proxy.VueCookies.get('userInfo') || {})
const tableData = reactive({})
const currentCategoryId = ref(null)
const dataTableRef = ref(null)
const formData = reactive({})
const formDataRef = ref()
const rules = {
  categoryName: [{ required: true, message: '请输入分类名称' }],

}
const tableOptions = {
  extHeight: 146,
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
    Object.assign(tableData, result.data)
    if (currentCategoryId.value == null && result.data.list.length > 0) {
      currentCategoryId.value = result.data.list[0].categoryId
      loadBlogList()
    }
    nextTick(() => {
      dataTableRef.value.setCurrentRow('categoryId', currentCategoryId.value)
    })
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
        type: 'success',
        message: '操作成功!'
      })
      loadDataList()
    } else {
      ElMessage({
        type: 'error',
        message: '操作失败!'
      })
    }
  })
}
//删除
const del = async (data) => {
  let result = await proxy.request({
    url: api.delCategory,
    params: {
      categoryId: data.categoryId
    }
  })
  if (result.code == 200) {
    loadDataList()
    currentCategoryId.value = null
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
//专题树
//获取专题列表
const rowClick = (row) => {
  currentCategoryId.value = row.categoryId
  loadBlogList()
}
const blogList = ref([])
const loadBlogList = async () => {
  let result = await proxy.request({
    url: api.getSpecialInfo,
    params: {
      categoryId: currentCategoryId.value,
      showType: '1',
    }
  })
  if (result.code == 200) {
    blogList.value = result.data
  }
}
const treeProps = {
  childern: 'children',
  label: 'title',
  value: 'blogId'
}
//新增修改专题博客
const blogEditRef = ref(null)
const editBlog = (type, data) => {
  blogEditRef.value.init(type, data)
}
//保存博客
const saveBlogCallback = () => {
  loadBlogList()
}
const delBlog = async (data) => {
  let result = await proxy.request({
    url: api.delBlog,
    params: {
      blogId: data.blogId
    }
  })
  if (result.code == 200) {
    loadBlogList()
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
//拖拽
const blogDrag = async (draggingNode, dropNode, dropType, ev) => {
  let parentNode = null;
  if (dropType == 'inner') {
    parentNode = dropNode;
  } else {
    parentNode = dropNode.parent
  }
  const blogId = draggingNode.data.blogId;
  const pBlogId = parentNode.data.blogId;
  const blogIds = [];
  parentNode.childNodes.forEach((element) => {
    blogIds.push(element.data.blogId);
  })
  let params = {
    blogId, pBlogId,
    blogIds: blogIds.join(',')
  }
  let result = await proxy.request({
    url: api.updateSpecialBlogSort,
    params
  })
  if (result.code == 200) {
    loadBlogList()
  }
}
//预览
const blogDetailRef = ref(null)
const showDetail = (data) => {
  blogDetailRef.value.showDetail(data)
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

  .not-allow {
    cursor: not-allowed;
    color: #ddd
  }
}

.tree-panel {
  height: calc(100vh - 300px);
  overflow: auto;

  .custom-node-style {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;

    a {
      text-decoration: none;
      color: green;
    }
  }
}
</style>
