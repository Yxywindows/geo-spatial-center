import { useEffect, useState } from 'react'
import { Badge, Button, Empty, Select, Skeleton, Table, Tag, Typography } from 'antd'
import { EyeOutlined, HomeOutlined, LogoutOutlined, ReloadOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import type { ColumnsType } from 'antd/es/table'
import { listAdminRequests } from '../../api/admin'
import type { GeoRequestListItem } from '../../api/admin'
import { adminLogout, getAdminName } from '../../store/adminAuth'

const { Title } = Typography

const STATUS_OPTIONS = [
  { value: '', label: '全部状态' },
  { value: 'pending', label: '待审批' },
  { value: 'approved', label: '已批准' },
  { value: 'rejected', label: '已驳回' },
]

const SORT_OPTIONS = [
  { value: 'desc', label: '最新优先' },
  { value: 'asc', label: '最早优先' },
]

function StatusCell({ status }: { status: string }) {
  if (status === 'pending') return <Badge status="processing" text="待审批" />
  if (status === 'approved') return <Badge status="success" text="已批准" />
  if (status === 'rejected') return <Badge status="error" text="已驳回" />
  return <Tag>{status}</Tag>
}

export default function ReviewListPage() {
  const navigate = useNavigate()
  const [data, setData] = useState<GeoRequestListItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [sort, setSort] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)
  const pageSize = 10

  function load() {
    setLoading(true)
    listAdminRequests({
      status: statusFilter || undefined,
      sort,
      limit: pageSize,
      offset: (page - 1) * pageSize,
    })
      .then((r) => { setData(r.data); setTotal(r.total) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [statusFilter, sort, page])

  function handleLogout() {
    adminLogout()
    navigate('/admin/login', { replace: true })
  }

  const columns: ColumnsType<GeoRequestListItem> = [
    {
      title: '申请编号',
      dataIndex: 'main_request_no',
      width: 190,
      render: (v: string) => <span className="admin-mono">{v}</span>,
    },
    {
      title: '申请人',
      dataIndex: 'user_name',
      width: 100,
      render: (v: string | null) => v ?? '—',
    },
    {
      title: '所在单位',
      dataIndex: 'user_institution',
      ellipsis: true,
    },
    {
      title: '数据名称',
      dataIndex: 'resource_name',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 110,
      render: (v: string) => <StatusCell status={v} />,
    },
    {
      title: '提交时间',
      dataIndex: 'received_at',
      width: 120,
      render: (v: string) => new Date(v).toLocaleDateString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_: unknown, record: GeoRequestListItem) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/admin/review/${record.id}`)}
        >
          详情
        </Button>
      ),
    },
  ]

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-page__header">
        <div>
          <Title level={4} style={{ margin: 0, color: '#0f3554' }}>数据访问审批</Title>
          <span className="admin-page__subtitle">地理空间智能与人地系统分中心</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="admin-page__user">{getAdminName()}</span>
          <Button size="small" icon={<HomeOutlined />} onClick={() => navigate('/')}>返回分中心</Button>
          <Button size="small" icon={<LogoutOutlined />} onClick={handleLogout}>退出</Button>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-page__filters">
        <Select
          value={statusFilter}
          onChange={(v) => { setStatusFilter(v); setPage(1) }}
          options={STATUS_OPTIONS}
          style={{ width: 130 }}
        />
        <Select
          value={sort}
          onChange={(v) => { setSort(v as 'asc' | 'desc'); setPage(1) }}
          options={SORT_OPTIONS}
          style={{ width: 110 }}
        />
        <Button icon={<ReloadOutlined />} onClick={load}>刷新</Button>
      </div>

      {/* Table */}
      {loading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : data.length === 0 ? (
        <Empty description="暂无申请记录" style={{ padding: '60px 0' }} />
      ) : (
        <Table
          dataSource={data}
          columns={columns}
          rowKey="id"
          onRow={(record) => ({
            onClick: () => navigate(`/admin/review/${record.id}`),
            style: { cursor: 'pointer' },
          })}
          pagination={{
            current: page,
            pageSize,
            total,
            onChange: setPage,
            showTotal: (t) => `共 ${t} 条`,
          }}
          className="admin-table"
          rowClassName={(r: GeoRequestListItem) => r.status === 'pending' ? 'admin-table__row--pending' : ''}
        />
      )}
    </div>
  )
}
