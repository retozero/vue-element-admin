<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.title" placeholder="Title" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.importance" placeholder="Imp" clearable style="width: 90px" class="filter-item">
        <el-option v-for="item in importanceOptions" :key="item" :label="item" :value="item" />
      </el-select>
      <el-select v-model="listQuery.type" placeholder="Type" clearable class="filter-item" style="width: 130px">
        <el-option v-for="item in func_modules" :key="item.key" :label="item.display_name+'('+item.key+')'" :value="item.key" />
      </el-select>
      <el-select v-model="listQuery.sort" style="width: 140px" class="filter-item" @change="handleFilter">
        <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        Search
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        Add
      </el-button>
      <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">
        Export
      </el-button>
      <el-checkbox v-model="showReviewer" class="filter-item" style="margin-left:15px;" @change="tableKey=tableKey+1">
        reviewer
      </el-checkbox>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column label="id" prop="id" sortable="custom" align="center" width="80" :class-name="getSortClass('id')">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="func" width="150px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.func }}</span>
        </template>
      </el-table-column>
      <el-table-column label="funcCode" min-width="150px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.func_code }}</span>
        </template>
      </el-table-column>
      <el-table-column label="funcDesc" width="400px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.func_desc }}</span>
        </template>
      </el-table-column>
      <el-table-column label="funcModule" width="150px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.func_module }}</span>
        </template>
      </el-table-column>
      <el-table-column label="gmtCreate" width="170px" align="center">
        <template slot-scope="scope">
          <!-- <span>{{ scope.row.gmt_create | parseTime('{y}-{m}-{d} {h}:{i}') }}</span> -->
          <span>{{ scope.row.gmt_create == null ? '' : scope.row.gmt_create | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Actions" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            Edit
          </el-button>
          <el-button v-if="row.status!='deleted'" size="mini" type="danger" @click="handleModifyStatus(row,'deleted')">
            Delete
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item label="功能名称" prop="func">
          <el-input v-model="temp.func" />
        </el-form-item>
        <el-form-item label="指令代码" prop="func_code">
          <el-input v-model="temp.func_code" />
        </el-form-item>
        <el-form-item label="功能描述" prop="func_desc">
          <el-input v-model="temp.func_desc" />
        </el-form-item>
        <el-form-item label="图标地址" prop="func_icon">
          <el-input v-model="temp.func_icon" :autosize="{ minRows: 2, maxRows: 4}" type="textarea" placeholder="Please input" />
        </el-form-item>
        <el-form-item label="功能模块" prop="func_module">
          <el-select v-model="temp.func_module" class="filter-item" placeholder="请选择">
            <el-option v-for="item in func_modules" :key="item.key" :label="item.display_name" :value="item.key" />
          </el-select>
        </el-form-item>
        <el-form-item label="资源解析方式" prop="uri_use_type">
          <el-select v-model="temp.uri_use_type" class="filter-item" placeholder="请选择" @change="updateFuncClassName()">
            <el-option v-for="item in uri_use_types" :key="item.key" :label="item.display_name" :value="item.key" />
          </el-select>
        </el-form-item>
        <el-form-item v-show="false" label="资源解析类名" prop="func_class_name">
          <el-input v-model="temp.func_class_name" readonly="true" />
        </el-form-item>
        <el-form-item label="资源渲染方式" prop="uri_show_type">
          <el-select v-model="temp.uri_show_type" class="filter-item" placeholder="请选择">
            <el-option v-for="item in uri_show_types" :key="item.key" :label="item.display_name" :value="item.key" />
          </el-select>
        </el-form-item>
        <el-form-item label="渲染模板ID" prop="template_id">
          <el-select v-model="temp.template_id" class="filter-item" placeholder="请选择">
            <el-option v-for="item in template_ids" :key="item.key" :label="item.display_name" :value="item.key" />
          </el-select>
        </el-form-item>
        <el-form-item label="资源请求方法" prop="request_method">
          <el-select v-model="temp.request_method" class="filter-item" placeholder="请选择">
            <el-option v-for="item in request_methods" :key="item.key" :label="item.display_name" :value="item.key" />
          </el-select>
        </el-form-item>
        <el-form-item label="参数格式" prop="params_type">
          <el-select v-model="temp.params_type" class="filter-item" placeholder="请选择">
            <el-option v-for="item in params_types" :key="item.key" :label="item.display_name" :value="item.key" />
          </el-select>
        </el-form-item>
        <el-form-item label="参数公式" prop="params_formula">
          <el-input v-model="temp.params_formula" :autosize="{ minRows: 2, maxRows: 4}" type="textarea" placeholder="Please input" />
        </el-form-item>
        <el-form-item label="资源地址" prop="url">
          <el-input v-model="temp.url" :autosize="{ minRows: 2, maxRows: 4}" type="textarea" placeholder="Please input" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          Cancel
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          Confirm
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dialogPvVisible" title="Reading statistics">
      <el-table :data="pvData" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="key" label="Channel" />
        <el-table-column prop="pv" label="Pv" />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false">Confirm</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { fetchList, fetchPv, createArticle, updateArticle } from '@/api/article'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { list } from '@/api/third-config.js'

const func_modules = [
  { key: 'A招募上岗', display_name: 'A招募上岗' },
  { key: 'B产品学习', display_name: 'B产品学习' },
  { key: 'C营销云盘', display_name: 'C营销云盘' },
  { key: 'E行销平台', display_name: 'E行销平台' },
  { key: 'F客户管理', display_name: 'F客户管理' },
  { key: 'G自主经营', display_name: 'G自主经营' },
  { key: '凤凰社管家', display_name: '凤凰社管家' },
  { key: '基本法管家', display_name: '基本法管家' },
  { key: '服务网点', display_name: '服务网点' }
]

const uri_use_types = [
  { key: 'page_load', display_name: '页面加载' },
  { key: 'data_extract', display_name: '数据提取' },
  { key: 'miniprogram', display_name: '小程序' },
  { key: 'cloud_file', display_name: '云盘文件' },
  { key: 'product_card', display_name: '产品卡片' }
]

const uri_show_types = [
  { key: 'text', display_name: '文本' },
  { key: 'template', display_name: '模板' },
  { key: 'miniprogram', display_name: '小程序' }
]

const template_ids = [
  { key: 'template001', display_name: '产品在售' },
  { key: 'template-pagecard', display_name: '点击卡片' },
  { key: 'miniprogram', display_name: '小程序' },
  { key: 'template-commission', display_name: '查询佣金' },
  { key: 'template-product-card', display_name: '产品卡片' }
]

const request_methods = [
  { key: 'GET', display_name: 'GET' },
  { key: 'POST', display_name: 'POST' },
  { key: 'PUT', display_name: 'PUT' },
  { key: 'PATCH', display_name: 'PATCH' },
  { key: 'DELETE', display_name: 'DELETE' }
]

const params_types = [
  { key: 'application/json', display_name: 'application/json' },
  { key: 'encodeURI', display_name: 'encodeURI' },
  { key: 'cookie', display_name: 'cookie' }
]

// arr to obj, such as { CN : "China", US : "USA" }
const calendarTypeKeyValue = func_modules.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})

var data = list({ 'page': '1', 'size': '5' })
console.log(data)

export default {
  name: 'ThirdConfig',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    },
    typeFilter(type) {
      return calendarTypeKeyValue[type]
    }
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        importance: undefined,
        title: undefined,
        type: undefined,
        sort: '+id'
      },
      importanceOptions: [1, 2, 3],
      func_modules,
      uri_use_types,
      uri_show_types,
      template_ids,
      params_types,
      request_methods,
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      statusOptions: ['published', 'draft', 'deleted'],
      showReviewer: false,
      temp: {
        id: undefined,
        importance: 1,
        remark: '',
        timestamp: new Date(),
        title: '',
        type: '',
        status: 'published'
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        type: [{ required: true, message: 'type is required', trigger: 'change' }],
        timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
        title: [{ required: true, message: 'title is required', trigger: 'blur' }]
      },
      downloadLoading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.list = response.data.list
        this.total = response.data.total
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleModifyStatus(row, status) {
      this.$message({
        message: '操作Success',
        type: 'success'
      })
      row.status = status
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+id'
      } else {
        this.listQuery.sort = '-id'
      }
      this.handleFilter()
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        importance: 1,
        remark: '',
        timestamp: new Date(),
        title: '',
        status: 'published',
        type: ''
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.id = parseInt(Math.random() * 100) + 1024 // mock a id
          this.temp.author = 'vue-element-admin'
          createArticle(this.temp).then(() => {
            this.list.unshift(this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: 'Created Successfully',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.temp.timestamp = new Date(this.temp.timestamp)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          tempData.timestamp = +new Date(tempData.timestamp) // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          updateArticle(tempData).then(() => {
            for (const v of this.list) {
              if (v.id === this.temp.id) {
                const index = this.list.indexOf(v)
                this.list.splice(index, 1, this.temp)
                break
              }
            }
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: 'Update Successfully',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleDelete(row) {
      this.$notify({
        title: 'Success',
        message: 'Delete Successfully',
        type: 'success',
        duration: 2000
      })
      const index = this.list.indexOf(row)
      this.list.splice(index, 1)
    },
    handleFetchPv(pv) {
      fetchPv(pv).then(response => {
        this.pvData = response.data.pvData
        this.dialogPvVisible = true
      })
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['timestamp', 'title', 'type', 'importance', 'status']
        const filterVal = ['timestamp', 'title', 'type', 'importance', 'status']
        const data = this.formatJson(filterVal, this.list)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'table-list'
        })
        this.downloadLoading = false
      })
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}`
        ? 'ascending'
        : sort === `-${key}`
          ? 'descending'
          : ''
    },
    updateFuncClassName() {
      if (this.temp.uri_use_type === 'data_extract') {
        this.temp.func_class_name = 'funcDataExtractService'
      } else if (this.temp.uri_use_type === 'cloud_file') {
        this.temp.func_class_name = 'funcCloudService'
      } else if (this.temp.uri_use_type === 'miniprogram') {
        this.temp.func_class_name = 'funcMiniProgramService'
      } else if (this.temp.uri_use_type === 'product_card') {
        this.temp.func_class_name = 'funcProductCardService'
      } else {
        this.temp.func_class_name = 'funcPageLoadService'
      }
    }
  }
}
</script>

<style>
</style>
