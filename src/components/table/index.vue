<template>
  <div>
    <el-table ref="dataTable"
              :data="dataSource.list||[]"
              :height="tableHeight"
              :stripe="options.stripe"
              :border="options.border"
              header-row-class-name="table-header-row"
              highlight-current-row
              @row-click="handleRowClick"
              @selection-change="handleSelectionChange">
    <el-table-column v-if="options.selectType && options.selectType=='checkbox'"
                     type="selection"
                     width="50"
                     align="center"></el-table-column>
    <el-table-column v-if="options.showIndex"
                     label="序号"
                     type="index"
                     width="60"
                     align="center"></el-table-column>

    <template v-for="(column,index) in columns">
      <template v-if="column.scopedSlots">
        <el-table-column :key="index" 
                         :prop="column.prop"
                         :label="column.label"
                         :align="column.align || 'left' "
                         :width="column.width">
        <template #default="scope">
          <slot :name="column.scopedSlots"
                :index="scope.$index"
                :row="scope.row">
          </slot>
        </template>
      </el-table-column>
      </template>
      <template v-else>
        <el-table-column :key="index"
                         :prop="column.prop"
                         :label="column.label"
                         :align="column.align || 'left' "
                         :width="column.width"
                         :fixed="column.fixed">
        </el-table-column>
      </template>
    </template>
  </el-table>
  <div class="pagination"
  v-if="showPagination">
  <el-pagination v-if="dataSource.totalCount"
                 background
                 :total="dataSource.totalCount"
                 :page-sizes="[15,30,50,100]"
                 :current-page.sync="dataSource.pageNo"
                 layout="total,sizes,prev,pager,next,jumper"
                 @size-change="handlePageSizeChange"
                 @current-change="handlePageNoChange"
                 style="text-align:right;"></el-pagination>

  </div>
</div>
</template>
<script setup>
import {ref} from 'vue'
const emit=defineEmits(['rowSelected','rowClick']);
const props=defineProps({
  dataSource:Object,
  showPagination:{
    type:Boolean,
    default:true,
  },
  options:{
    type:Object,
    default:{
      extHeight:0,
      showIndex:false,
    },
  },
  columns:Array,
  fetch:Function,
  initFetch:{
    type:Boolean,
    default:true,
  }
})
const radioSelectRowIndex=ref(null)
const topHeight=60 + 20 + 30 + 46
const tableHeight = ref(
  props.options.tableHeight
    ? props.options.tableHeight
    : window.innerHeight - topHeight - props.options.extHeight
)
const dataTable=ref();
const handleRowClick = (row) => {
  emit('rowClick', row)
}
const handleSelectionChange = (row) => {
  emit('rowSelected', row);
};
const handlePageSizeChange = (size) => {
  props.dataSource.pageSize = size;
  props.dataSource.pageNo = 1;
  props.fetch()
}
const handlePageNoChange = (pageNo) => {
  props.dataSource.pageNo = pageNo;
  props.fetch();
}
const setCurrentRow = (rowKey, rowValue) => {
  let row = props.dataSource.list.find((item) => {
    return item[rowKey] === rowValue;
  })
  dataTable.value.setCurrentRow(row)
}
defineExpose({ setCurrentRow })
const init=()=>{
  if(props.initFetch&& props.fetch){
    props.fetch()
  }
}
init();
</script>
<style>
.el-pagination.is-background .el-pager li.is-active{
  background:green !important
}
.pagination{
  padding-top:10px;
}
.el-pagination{
  justify-content: right;
}
.el-table__body tr.current-row>td.el-table__cell{
  background-color:#e6f0f9
}
.el-table__body tr:hover > td.el-table__cell{
  background-color: #e6f0f9 !important;
}
</style>
