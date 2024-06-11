<template>
  <div>
    <div class="top-panel" style="padding:10px">
      <el-form :model="searchFormData" :inline="true">
        <el-form-item label="昵称" prop="nickName">
          <el-input v-model="searchFormData.nickNameFuzzy" placeholder="支持模糊搜索" @keyup.enter="loadUserList"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="searchFormData.phoneFuzzy" placeholder="支持模糊搜索" @keyup.enter="loadUserList"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button @click="loadUserList" color="green" type="primary">搜索</el-button>
          <el-button v-if="userInfo.roleType==1" @click="showEdit('add')" color="green" type="primary">新增账号</el-button>
        </el-form-item>
      </el-form>
    </div>
    <Table :columns="columns" :showPagination="true" :dataSource="tableData" :fetch="loadUserList"
      :options="tableOptions">
      <!-- 头像 -->
      <template #avatar="{ index, row }">
        <Cover :cover="row.avatar" />
      </template>
      <!-- 用户信息 -->
      <template #UserInfo="{ index, row }">
        <div>昵&nbsp;&nbsp;&nbsp;&nbsp;称:{{ row.nickName }}</div>
        <div>手机号:{{ row.phone }}</div>
        <div>职&nbsp;&nbsp;&nbsp;&nbsp;业:{{ row.profession }}</div>
      </template>
      <!-- 默认编辑器类型 -->
      <template #typeName="{ index, row }">
        <div><span v-if="row.editorType === 0">富文本</span>
          <span v-else>Markdown</span>
        </div>
      </template>
      <!-- 角色 -->
      <template #roleInfo="{index,row}">
        <div>{{ row.roleTypeName }}</div>
      </template>
      <!-- 状态 -->
      <template #statusInfo="{ index, row }">
        <span :style="{color:row.status==1?'green':'red'}">{{ row.statusName }}</span>
      </template>
      <!-- 时间 -->
      <template #time="{ index, row }">
        <div>创建时间:{{ row.createTime }}</div>
        <div>最后登录时间:{{row.lastLoginTime }}</div>
      </template>
      <template #op="{ index, row }">
        <div class="op" v-if="userInfo.userId==row.userId">
          <a href="#" @click="showEdit('edit', row)">修改</a>
          <el-divider direction="vertical"></el-divider>
          <el-popconfirm width="200px" confirm-button-type="success" icon-color="green" confirm-button-text="确定"
            cancel-button-text="取消" :icon="InfoFilled" @confirm="changeAccountStatus(row)"
            :title="`您确定要${ row.status == 0 ? '启用' : '禁用' }${row.nickName}吗?`" @cancel="cancelEvent">
            <template #reference>
              <a href="#">{{ row.status == 0 ? '启用' : '禁用' }}</a>
            </template>
          </el-popconfirm>
          <el-divider direction="vertical"></el-divider>
          <a href="#" @click="showUpdatePassword(row.userId)">修改密码</a>
          <el-divider direction="vertical"></el-divider>
          <el-popconfirm width="200px" confirm-button-type="success" icon-color="green" confirm-button-text="确定"
            cancel-button-text="取消" :icon="InfoFilled" @confirm="delUser(row)" :title="`您确定要删除${row.nickName}?`"
            @cancel="cancelEvent">
            <template #reference>
              <a href="#">删除</a>
            </template>
          </el-popconfirm>
        </div>
        <span v-else>---</span>
      </template>
    </Table>
    <Dialog :show="editDialogInfo.show" :title="editDialogInfo.title" :buttons="editDialogInfo.buttons"
      @close="editDialogInfo.show = false" width="900px">
      <el-form :model="formData" :rules="rules" ref="editFormRef" label-width="100px" class="blog-setting-form">
        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="昵称" prop="nickName">
              <el-input :maxLength="30" v-model="formData.nickName"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号" prop="phone">
              <el-input :maxLength="11" v-model="formData.phone"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="10" v-if="formData.userId == null">
          <el-col :span="12">
            <el-form-item label="密码" prop="password">
              <el-input v-model="formData.password" type="password" :maxLength="20"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="再输入密码" prop="rePassword">
              <el-input v-model="formData.rePassword" type="password" :maxLength="20"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="默认编辑器" prop="editorType">
              <el-radio-group v-model="formData.editorType">
                <el-radio :label="0">富文本编辑器</el-radio>
                <el-radio :label="1">Markdown编辑器</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="职业" prop="profession">
              <el-input v-model="formData.profession"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="头像" prop="avatar">
              <CoverUpload v-model="formData.avatar" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="24">
            <el-form-item label="简介" prop="introduction">
              <EditorHtml id="introduction" :height="250" ref="introduction" v-model="formData.introduction" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </Dialog>
    <!-- 修改密码框 -->
    <Dialog :show="dialogConfig.show" :title="dialogConfig.title" :buttons="dialogConfig.buttons"
      @close="dialogConfig.show = false" width="400px">
      <el-form :model="formData" :rules="rules" ref="passwordFormRef" label-width="100px">
        <!-- 密码输入框 -->
        <el-form-item prop="password" label="密码" type="password">
          <el-input v-model="formData.password" placeholder="请输入密码" size="large" clearable>
          </el-input>
        </el-form-item>
        <el-form-item prop="rePassword" label="重复密码" type="password">
          <el-input v-model="formData.rePassword" placeholder="请再次输入密码" size="large" clearable>
          </el-input>
        </el-form-item>
      </el-form>
    </Dialog>
  </div>

</template>
<script setup>
import { ref, reactive, getCurrentInstance, onMounted,nextTick } from 'vue'
import { ElMessage } from 'element-plus';
const {proxy} =getCurrentInstance()
const columns = [{
  label: "头像",
  prop: 'avatar',
  width: 100,
  scopedSlots: 'avatar',
},
{
  label: "用户信息",
  prop: 'nickName',
  scopedSlots: 'UserInfo',
},
{
  label: "默认编辑器",
  prop: 'editorTypeName',
  width: 100,
},
{
  label: "角色",
  prop: 'roleTypeName',
  width: 200,
  scopedSlots: 'roleInfo'
},
{
  label: "状态",
  prop: 'statusInfo',
  width: 100,
  scopedSlots: 'statusInfo'
},
{
  label: "时间",
  prop: 'time',
  width: 300,
  scopedSlots: 'time'
},
{
  label: "操作",
  prop: 'op',
  width: 300,
  scopedSlots: 'op'
}
]
const api = {
  loadUserList:'setting/loadUser',
  saveTeamUser:'setting/saveTeamUser',
  updateStatus:'setting/updateStatus',
  delUser:'setting/delUser',
  updatePassword:'setting/updatePassword'
}
const validatePass = (role, value, callback) => {
  if (value !== formData.value.password) {
    callback(new Error(rules.message))
  } else {
    callback()
  }
}
const rules = {
  nickName:[{required:true,message:'昵称不能为空'}],
  editorType:[{required:true,message:'请选择默认编辑器'}],
  password: [{ required: true, message: '请输入密码' },
  {
    validator: proxy.verify.password,
    message: '密码最少8位，只能数字/字母/特殊字符'
  },
  ],
  rePassword: [{ required: true, message: '请再次输入密码' },
  {
    validator: validatePass,
    message: '两次输入的密码不一致'
  }
  ],
  phone: [{ required: true, message: '请输入手机号' },
  {
    validator: proxy.verify.phone,
    trigger: 'blur',
    message: '请输入正确的手机号'
  }
  ],
}
const searchFormData = reactive({})
const tableData = reactive({})
const formData = ref({})
const editFormRef = ref()
const userInfo = ref(proxy.VueCookies.get('userInfo') || {})
const tableOptions = {
  extHeight: 77,
}
const editDialogInfo = reactive({
  show: false,
  title: '新增用户',
  buttons: [
    {
      type: 'primary',
      text: '确定',
      click: (e) => {
        submitForm()
      }
    },
  ]
})
onMounted(()=>{
  loadUserList()
})
const loadUserList = async () => {
  let params = {
    pageNo: tableData.pageNo,
    pageSize: tableData.pageSize
  }
  Object.assign(params, searchFormData)
  let result = await proxy.request({
    url: api.loadUserList,
    params: params
  })
  if (result.code == 200) {
    Object.assign(tableData, result.data)
  }
}
const showEdit = (type, data) => {
  editDialogInfo.show = true
  nextTick(() => {
    editFormRef.value.resetFields()
    formData.categoryId = undefined
    if (type == "add") {
      editDialogInfo.edit=false,
      editDialogInfo.title = '新增账号'
      formData.value={
        introduction: ''
      }
    }else{
      editDialogInfo.edit = true,
      editDialogInfo.title = '修改账号'
      formData.value=data
    } 
  })
}
const submitForm = () => {
  editFormRef.value.validate(async (valid) => {
    if (!valid) return
    let params = {}
    Object.assign(params, formData.value)
    delete params.createTime
    delete params.lastLoginTime
    let result = await proxy.request({
      url: api.saveTeamUser,
      params,
    })
    if (result.code == 200) {
      editDialogInfo.show = false
      ElMessage({
        type: 'success',
        message: '操作成功!'
      })
      loadUserList()
    } else {
      ElMessage({
        type: 'error',
        message: '操作失败!'
      })
    }
  })
}
const changeAccountStatus= async (data) => {
  let status=data.status==0?1:0
  let result = await proxy.request({
    url: api.updateStatus,
    params: {
      userId:data.userId,
      status:status
    }
  })
  if (result.code == 200) {
    loadUserList()
    ElMessage({
      type: 'success',
      message: data.status==0?'启用成功！':'禁用成功！'
    })
  } else {
    ElMessage({
      type: 'error',
      message: data.status == 0 ? '启用失败！' : '禁用失败！'
    })
  }
}
const delUser = async (data) => {
  let result = await proxy.request({
    url: api.delUser,
    params: {
      userId: data.userId,
    }
  })
  if (result.code == 200) {
    loadUserList()
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
//修改密码
const passwordFormRef = ref()
const dialogConfig = reactive({
  show: false,
  title: '修改密码',
  buttons: [
    {
      type: 'primary',
      text: '确定',
      click: (e) => {
        submitPass();
      }
    },
  ]
})
const showUpdatePassword = (userId) => {
  dialogConfig.show = true
  nextTick(() => {
    passwordFormRef.value.resetFields()
    formData.value={userId: userId}
  })
}
const submitPass = () => {
  passwordFormRef.value.validate(async (valid) => {
    if (!valid) return
    let result = await proxy.request({
      url: api.updatePassword,
      params: {
        userId:formData.value.userId,
        password: formData.value.password
      }
    })
    if (result.code == 200) {
      dialogConfig.show = false
      ElMessage({
        type: 'success',
        message: '修改密码成功!'
      })
    } else {
      ElMessage({
        type: 'error',
        message: '修改密码失败!'
      })
    }
  })
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
