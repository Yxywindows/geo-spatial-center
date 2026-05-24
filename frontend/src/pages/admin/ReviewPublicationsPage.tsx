import { useCallback, useEffect, useState } from 'react'
import {
  Badge, Button, Col, Descriptions, Divider, Drawer,
  Form, Input, Modal, Row, Select, Skeleton, Space,
  Table, Tag, Timeline, Typography, message,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  CheckCircleOutlined, CloseCircleOutlined, LogoutOutlined,
  MailOutlined, PlayCircleOutlined, ReloadOutlined, RollbackOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import {
  listReviews, getReview, startReview, submitReview, sendMockEmail, getStats,
} from '../../api/adminPublications'
import type { GeoReview, GeoReviewListItem, GeoStats } from '../../api/adminPublications'
import { adminLogout, getAdminName } from '../../store/adminAuth'

const { Text, Title, Paragraph } = Typography

const STATUS_OPTIONS = [
  { value: '', label: '全部状态' },
  { value: 'pending', label: '待审核' },
  { value: 'reviewing', label: '审核中' },
  { value: 'approved', label: '已通过' },
  { value: 'rejected', label: '已驳回' },
  { value: 'returned', label: '退回修改' },
]

const STATUS_COLOR: Record<string, string> = {
  pending: 'orange', reviewing: 'blue', approved: 'green', rejected: 'red', returned: 'gold',
}
const STATUS_LABEL: Record<string, string> = {
  pending: '待审核', reviewing: '审核中', approved: '已通过', rejected: '已驳回', returned: '退回修改',
}

export default function ReviewPublicationsPage() {
  const navigate = useNavigate()
  const [data, setData] = useState<GeoReviewListItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 15

  const [stats, setStats] = useState<GeoStats | null>(null)

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [detail, setDetail] = useState<GeoReview | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const [reviewForm] = Form.useForm()
  const [reviewOpen, setReviewOpen] = useState(false)
  const [reviewLoading, setReviewLoading] = useState(false)
  const [reviewResult, setReviewResult] = useState<'APPROVED' | 'REJECTED' | 'RETURNED_FOR_REVISION'>('APPROVED')

  const [emailForm] = Form.useForm()
  const [emailOpen, setEmailOpen] = useState(false)
  const [emailLoading, setEmailLoading] = useState(false)

  const [startLoading, setStartLoading] = useState(false)

  const fetchList = useCallback(async (status: string, p: number) => {
    setLoading(true)
    try {
      const res = await listReviews({ status: status || undefined, limit: pageSize, offset: (p - 1) * pageSize })
      setData(res.items)
      setTotal(res.total)
    } catch { message.error('加载列表失败') }
    finally { setLoading(false) }
  }, [])

  const fetchStats = useCallback(async () => {
    try { setStats(await getStats()) } catch { /* ignore */ }
  }, [])

  useEffect(() => { fetchList(statusFilter, page) }, [fetchList, statusFilter, page])
  useEffect(() => { fetchStats() }, [fetchStats])

  const openDetail = async (id: number) => {
    setDrawerOpen(true)
    setDetail(null)
    setDetailLoading(true)
    try {
      setDetail(await getReview(id))
    } catch { message.error('加载详情失败') }
    finally { setDetailLoading(false) }
  }

  const handleStart = async () => {
    if (!detail) return
    setStartLoading(true)
    try {
      const updated = await startReview(detail.id)
      setDetail(updated)
      message.success('已开始审核')
      fetchList(statusFilter, page)
      fetchStats()
    } catch (err: unknown) {
      message.error((err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? '操作失败')
    } finally { setStartLoading(false) }
  }

  const openReview = (result: 'APPROVED' | 'REJECTED' | 'RETURNED_FOR_REVISION') => {
    setReviewResult(result)
    reviewForm.resetFields()
    setReviewOpen(true)
  }

  const handleReview = async () => {
    if (!detail) return
    try { await reviewForm.validateFields() } catch { return }
    const { reviewOpinion } = reviewForm.getFieldsValue()
    setReviewLoading(true)
    try {
      const updated = await submitReview(detail.id, { result: reviewResult, reviewOpinion: reviewOpinion?.trim() })
      setDetail(updated)
      message.success(
        reviewResult === 'APPROVED' ? '已通过审核' :
        reviewResult === 'REJECTED' ? '已驳回' : '已退回修改'
      )
      setReviewOpen(false)
      fetchList(statusFilter, page)
      fetchStats()
    } catch (err: unknown) {
      message.error((err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? '提交失败')
    } finally { setReviewLoading(false) }
  }

  const handleEmail = async () => {
    if (!detail) return
    try { await emailForm.validateFields() } catch { return }
    const { subject, content } = emailForm.getFieldsValue()
    setEmailLoading(true)
    try {
      const res = await sendMockEmail(detail.id, { subject: subject.trim(), content: content.trim() })
      message.success(`Mock 邮件已记录，收件人：${res.recipientEmail}`)
      emailForm.resetFields()
      setEmailOpen(false)
      const updated = await getReview(detail.id)
      setDetail(updated)
    } catch (err: unknown) {
      message.error((err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? '发送失败')
    } finally { setEmailLoading(false) }
  }

  const columns: ColumnsType<GeoReviewListItem> = [
    {
      title: '主中心工单号', dataIndex: 'mainTicketNo', width: 185,
      render: (v: string) => <span className="admin-mono">{v}</span>,
    },
    {
      title: '数据标题', dataIndex: 'resourceName', ellipsis: true,
      render: (v: string | null) => v ? <strong>{v}</strong> : <Text type="secondary">—</Text>,
    },
    { title: '上传者', dataIndex: 'submitterName', width: 90, render: (v: string | null) => v ?? '—' },
    {
      title: '状态', dataIndex: 'status', width: 100,
      render: (v: string) => <Tag color={STATUS_COLOR[v] ?? 'default'}>{STATUS_LABEL[v] ?? v}</Tag>,
    },
    { title: '审核员', dataIndex: 'reviewerName', width: 100, render: (v: string | null) => v ?? <Text type="secondary">—</Text> },
    {
      title: '收到时间', dataIndex: 'receivedAt', width: 130,
      render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '审核时间', dataIndex: 'reviewedAt', width: 130,
      render: (v: string | null) => v ? dayjs(v).format('YYYY-MM-DD HH:mm') : <Text type="secondary">—</Text>,
    },
    {
      title: '操作', width: 70, fixed: 'right' as const,
      render: (_: unknown, r: GeoReviewListItem) => (
        <Button type="link" size="small" onClick={(e) => { e.stopPropagation(); openDetail(r.id) }}>详情</Button>
      ),
    },
  ]

  const canStart = detail?.status === 'pending'
  const canReview = detail?.status === 'reviewing' || detail?.status === 'pending'
  const canEmail = !!(detail && detail.status !== 'approved' && detail.status !== 'rejected')

  const requireNoteResults: Array<'REJECTED' | 'RETURNED_FOR_REVISION'> = ['REJECTED', 'RETURNED_FOR_REVISION']

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <Title level={4} style={{ margin: 0, color: '#0f3554' }}>技术审核工单</Title>
          <span className="admin-page__subtitle">地理空间智能与人地系统分中心 · 数据发布审核</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {stats && (
            <Space size="large" style={{ fontSize: 13, color: '#52677a' }}>
              <span>待审核 <strong style={{ color: stats.pending > 0 ? '#fa8c16' : '#0f3554' }}>{stats.pending}</strong></span>
              <span>审核中 <strong>{stats.reviewing}</strong></span>
              <span>已通过 <strong style={{ color: '#52c41a' }}>{stats.approved}</strong></span>
            </Space>
          )}
          <span className="admin-page__user">{getAdminName()}</span>
          <Button size="small" icon={<LogoutOutlined />} onClick={() => { adminLogout(); navigate('/admin/login', { replace: true }) }}>退出</Button>
        </div>
      </div>

      <div className="admin-page__filters">
        <Select
          value={statusFilter}
          onChange={(v) => { setStatusFilter(v); setPage(1) }}
          options={STATUS_OPTIONS}
          style={{ width: 130 }}
        />
        <Button icon={<ReloadOutlined />} onClick={() => { fetchList(statusFilter, page); fetchStats() }}>刷新</Button>
      </div>

      {loading ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : (
        <Table
          dataSource={data}
          columns={columns}
          rowKey="id"
          scroll={{ x: 1000 }}
          onRow={(r) => ({ onClick: () => openDetail(r.id), style: { cursor: 'pointer' } })}
          pagination={{
            current: page,
            pageSize,
            total,
            onChange: setPage,
            showTotal: (t) => `共 ${t} 条`,
          }}
          className="admin-table"
          rowClassName={(r: GeoReviewListItem) => r.status === 'pending' ? 'admin-table__row--pending' : ''}
        />
      )}

      {/* ── Detail Drawer ─────────────────────────────────── */}
      <Drawer
        title={detail ? `工单详情 · ${detail.mainTicketNo}` : '工单详情'}
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setDetail(null) }}
        width={760}
        destroyOnClose
        extra={
          <Space>
            {canEmail && (
              <Button icon={<MailOutlined />} onClick={() => setEmailOpen(true)}>
                联系上传者
              </Button>
            )}
            {canStart && (
              <Button icon={<PlayCircleOutlined />} loading={startLoading} onClick={handleStart}>
                开始审核
              </Button>
            )}
            {canReview && (
              <>
                <Button
                  icon={<RollbackOutlined />}
                  onClick={() => openReview('RETURNED_FOR_REVISION')}
                >
                  退回修改
                </Button>
                <Button
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={() => openReview('REJECTED')}
                >
                  驳回
                </Button>
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={() => openReview('APPROVED')}
                >
                  通过
                </Button>
              </>
            )}
          </Space>
        }
      >
        {detailLoading && <Skeleton active paragraph={{ rows: 10 }} />}
        {!detailLoading && detail && (
          <div style={{ paddingBottom: 40 }}>
            <div style={{ marginBottom: 16 }}>
              <Badge
                status={
                  detail.status === 'approved' ? 'success'
                    : detail.status === 'rejected' ? 'error'
                      : detail.status === 'returned' ? 'warning'
                        : 'processing'
                }
                text={<strong style={{ fontSize: 15 }}>{STATUS_LABEL[detail.status] ?? detail.status}</strong>}
              />
            </div>

            <Divider orientation="left" orientationMargin={0}>数据信息</Divider>
            <Descriptions column={2} size="small" bordered style={{ marginBottom: 16 }}>
              <Descriptions.Item label="主中心工单号" span={2}>
                <Text style={{ fontFamily: 'monospace', fontSize: 12 }}>{detail.mainTicketNo}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="数据标题" span={2}>
                <strong>{detail.resourceName ?? '—'}</strong>
              </Descriptions.Item>
              {!!(detail.resourceMetadata?.abstract) && (
                <Descriptions.Item label="摘要" span={2}>
                  <Paragraph style={{ margin: 0, fontSize: 13, color: '#52677a' }}>
                    {String(detail.resourceMetadata.abstract)}
                  </Paragraph>
                </Descriptions.Item>
              )}
              {Array.isArray(detail.resourceMetadata?.keywords) && (detail.resourceMetadata.keywords as string[]).length > 0 && (
                <Descriptions.Item label="关键词" span={2}>
                  {(detail.resourceMetadata.keywords as string[]).map((k, i) => <Tag key={i}>{k}</Tag>)}
                </Descriptions.Item>
              )}
            </Descriptions>

            <Divider orientation="left" orientationMargin={0}>上传者信息</Divider>
            <Descriptions column={2} size="small" bordered style={{ marginBottom: 16 }}>
              <Descriptions.Item label="姓名">{detail.submitterName ?? '—'}</Descriptions.Item>
              <Descriptions.Item label="邮箱">{detail.submitterEmail ?? <Text type="secondary">—</Text>}</Descriptions.Item>
              <Descriptions.Item label="用户 ID"><Text style={{ fontFamily: 'monospace', fontSize: 12 }}>{detail.submitterId}</Text></Descriptions.Item>
            </Descriptions>

            <Divider orientation="left" orientationMargin={0}>审核信息</Divider>
            <Descriptions column={2} size="small" bordered style={{ marginBottom: 16 }}>
              <Descriptions.Item label="审核员">{detail.reviewerName ?? <Text type="secondary">—</Text>}</Descriptions.Item>
              <Descriptions.Item label="审核时间">
                {detail.reviewedAt ? dayjs(detail.reviewedAt).format('YYYY-MM-DD HH:mm') : <Text type="secondary">—</Text>}
              </Descriptions.Item>
              {detail.reviewNote && (
                <Descriptions.Item label="审核意见" span={2}>
                  <Text style={{ color: '#52677a' }}>{detail.reviewNote}</Text>
                </Descriptions.Item>
              )}
              <Descriptions.Item label="收到时间">{dayjs(detail.receivedAt).format('YYYY-MM-DD HH:mm:ss')}</Descriptions.Item>
              <Descriptions.Item label="主中心回调">
                {detail.callbackSent ? (
                  <Tag color="green">已回调</Tag>
                ) : (
                  <Tag color="orange">未回调</Tag>
                )}
              </Descriptions.Item>
            </Descriptions>

            {detail.mailContacts && detail.mailContacts.length > 0 && (
              <>
                <Divider orientation="left" orientationMargin={0}>联系记录</Divider>
                <Timeline
                  style={{ padding: '12px 0 0 8px' }}
                  items={detail.mailContacts.map((m) => ({
                    color: '#1677ff',
                    content: (
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{m.subject}</div>
                        <div style={{ fontSize: 12, color: '#66788a', marginTop: 2 }}>
                          {m.senderName} → {m.recipientEmail} · {dayjs(m.sentAt).format('YYYY-MM-DD HH:mm')}
                        </div>
                        <div style={{ marginTop: 6, fontSize: 12, color: '#52677a', whiteSpace: 'pre-wrap', background: '#f5f7fa', padding: '8px 10px', borderRadius: 4 }}>
                          {m.body}
                        </div>
                      </div>
                    ),
                  }))}
                />
              </>
            )}
          </div>
        )}
      </Drawer>

      {/* ── Review Modal ──────────────────────────────────── */}
      <Modal
        title={
          reviewResult === 'APPROVED' ? '通过审核'
            : reviewResult === 'REJECTED' ? '驳回工单'
              : '退回修改'
        }
        open={reviewOpen}
        onCancel={() => { setReviewOpen(false); reviewForm.resetFields() }}
        onOk={handleReview}
        okText={
          reviewResult === 'APPROVED' ? '确认通过'
            : reviewResult === 'REJECTED' ? '确认驳回'
              : '确认退回'
        }
        okButtonProps={{
          type: reviewResult === 'APPROVED' ? 'primary' : undefined,
          danger: reviewResult === 'REJECTED',
          loading: reviewLoading,
        }}
        cancelText="取消"
        destroyOnClose
        width={500}
      >
        <Row gutter={0} style={{ marginBottom: 16 }}>
          <Col span={24}>
            {reviewResult === 'APPROVED' && (
              <p style={{ color: '#52677a' }}>通过后将通知主中心，主中心可选择正式发布该数据集。</p>
            )}
            {reviewResult === 'REJECTED' && (
              <p style={{ color: '#cf1322' }}>驳回后工单将终结，请填写驳回理由（必填）。</p>
            )}
            {reviewResult === 'RETURNED_FOR_REVISION' && (
              <p style={{ color: '#d46b08' }}>退回后上传者可修改后重新提交，请填写退回原因（必填）。</p>
            )}
          </Col>
        </Row>
        <Form form={reviewForm} layout="vertical">
          <Form.Item
            name="reviewOpinion"
            label="审核意见"
            rules={[
              {
                required: requireNoteResults.includes(reviewResult as 'REJECTED' | 'RETURNED_FOR_REVISION'),
                message: '驳回或退回时必须填写审核意见',
              },
            ]}
          >
            <Input.TextArea
              rows={4}
              maxLength={500}
              showCount
              placeholder={
                reviewResult === 'APPROVED' ? '可填写通过意见（选填）'
                  : '请详细说明理由（必填）'
              }
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* ── Mock Email Modal ──────────────────────────────── */}
      <Modal
        title={<><MailOutlined /> 联系上传者（Mock 邮件）</>}
        open={emailOpen}
        onCancel={() => { setEmailOpen(false); emailForm.resetFields() }}
        onOk={handleEmail}
        okText="发送（记录）"
        okButtonProps={{ type: 'primary', loading: emailLoading }}
        cancelText="取消"
        destroyOnClose
        width={520}
      >
        {detail?.submitterEmail ? (
          <p style={{ color: '#52677a', marginBottom: 16 }}>
            收件人：<strong>{detail.submitterEmail}</strong>（Mock 模式，仅记录不实际发送）
          </p>
        ) : (
          <p style={{ color: '#cf1322', marginBottom: 16 }}>上传者未提供邮箱，无法发送 Mock 邮件。</p>
        )}
        <Form form={emailForm} layout="vertical">
          <Form.Item
            name="subject"
            label="邮件主题"
            rules={[{ required: true, message: '请填写主题' }]}
          >
            <Input maxLength={100} placeholder="如：关于您的数据集发布申请" />
          </Form.Item>
          <Form.Item
            name="content"
            label="邮件内容"
            rules={[{ required: true, message: '请填写内容' }]}
          >
            <Input.TextArea rows={5} maxLength={1000} showCount placeholder="请输入邮件正文" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
