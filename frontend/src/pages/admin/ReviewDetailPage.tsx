import { useEffect, useState } from 'react'
import {
  Alert, Badge, Button, Descriptions, Divider,
  Form, Input, Modal, Skeleton, Tag, Typography, message,
} from 'antd'
import {
  ArrowLeftOutlined, CheckOutlined, CloseOutlined,
  DownloadOutlined, FileOutlined, LinkOutlined,
} from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import { approveAdminRequest, getAdminRequest, rejectAdminRequest } from '../../api/admin'
import type { GeoRequest } from '../../api/admin'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input

const USE_SCENARIO_LABEL: Record<string, string> = {
  research: '科学研究',
  education: '教育教学',
  government: '政府应用',
  commercial: '商业用途',
  other: '其他',
}

const MAIN_CENTER_UPLOAD_BASE = 'http://localhost:3001/api/upload'

function StatusBadge({ status }: { status: string }) {
  if (status === 'pending') return <Badge status="processing" text="待审批" />
  if (status === 'approved') return <Badge status="success" text="已批准" />
  if (status === 'rejected') return <Badge status="error" text="已驳回" />
  return <Tag>{status}</Tag>
}

export default function ReviewDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [req, setReq] = useState<GeoRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [approveModalOpen, setApproveModalOpen] = useState(false)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [approveNote, setApproveNote] = useState('')
  const [rejectNote, setRejectNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getAdminRequest(Number(id))
      .then(setReq)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="admin-page"><Skeleton active paragraph={{ rows: 12 }} /></div>

  if (notFound || !req) {
    return (
      <div className="admin-page" style={{ textAlign: 'center', paddingTop: 80 }}>
        <p style={{ color: '#8c8c8c' }}>申请记录不存在</p>
        <Button onClick={() => navigate('/admin/review')}>返回列表</Button>
      </div>
    )
  }

  const isPending = req.status === 'pending'
  const isApproved = req.status === 'approved'
  const isRejected = req.status === 'rejected'

  async function handleApprove() {
    setSubmitting(true)
    try {
      const res = await approveAdminRequest(Number(id), approveNote)
      setReq(res.data)
      setApproveModalOpen(false)
      setApproveNote('')
      message.success('已批准，审批结果已回传主中心')
    } catch {
      message.error('操作失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleReject() {
    if (!rejectNote.trim()) {
      message.warning('请填写驳回理由')
      return
    }
    setSubmitting(true)
    try {
      const res = await rejectAdminRequest(Number(id), rejectNote.trim())
      setReq(res.data)
      setRejectModalOpen(false)
      setRejectNote('')
      message.success('已驳回，审批结果已回传主中心')
    } catch {
      message.error('操作失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="admin-page">
      <button className="admin-back" onClick={() => navigate('/admin/review')}>
        <ArrowLeftOutlined /> 返回审批列表
      </button>

      <div className="admin-detail">
        {/* Header */}
        <div className="admin-detail__header">
          <div>
            <Title level={4} style={{ margin: 0 }}>审批详情</Title>
            <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 12 }}>
              <Text type="secondary" className="admin-mono">{req.main_request_no}</Text>
              <StatusBadge status={req.status} />
            </div>
          </div>
          {isPending && (
            <div style={{ display: 'flex', gap: 10 }}>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => setApproveModalOpen(true)}
              >
                同意
              </Button>
              <Button
                danger
                icon={<CloseOutlined />}
                onClick={() => setRejectModalOpen(true)}
              >
                驳回
              </Button>
            </div>
          )}
        </div>

        {/* Approved result */}
        {isApproved && (
          <Alert
            type="success"
            showIcon
            className="admin-detail__result-alert"
            message={
              <div>
                <strong>已批准</strong>
                {req.reviewer_note && <div style={{ marginTop: 4, fontSize: 13 }}>审批意见：{req.reviewer_note}</div>}
                <Divider dashed style={{ margin: '10px 0' }} />
                {req.download_url && (
                  <div style={{ marginBottom: 6 }}>
                    <LinkOutlined style={{ marginRight: 6 }} />
                    <Text style={{ marginRight: 8 }}>下载地址：</Text>
                    <Button size="small" type="link" href={req.download_url} target="_blank" icon={<DownloadOutlined />}>
                      {req.download_url}
                    </Button>
                  </div>
                )}
                {req.token_expires_at && (
                  <div style={{ fontSize: 12, color: '#52677a' }}>
                    有效期至：{new Date(req.token_expires_at).toLocaleString('zh-CN')}
                  </div>
                )}
                {req.allowed_ips && req.allowed_ips.length > 0 && (
                  <div style={{ marginTop: 6, fontSize: 13 }}>
                    <Text type="secondary">绑定 IP：</Text>
                    {req.allowed_ips.map((ip, i) => (
                      <Tag key={i} style={{ fontFamily: 'monospace' }}>{ip}</Tag>
                    ))}
                  </div>
                )}
                <div style={{ marginTop: 6, fontSize: 12, color: req.callback_sent ? '#52c41a' : '#faad14' }}>
                  {req.callback_sent ? '✓ 审批结果已同步回主中心' : '⚠ 回调主中心待重试'}
                </div>
              </div>
            }
          />
        )}

        {/* Rejected result */}
        {isRejected && (
          <Alert
            type="error"
            showIcon
            className="admin-detail__result-alert"
            message={
              <div>
                <strong>已驳回</strong>
                {req.reviewer_note && (
                  <Paragraph style={{ margin: '6px 0 0', color: '#a8071a' }}>
                    驳回理由：{req.reviewer_note}
                  </Paragraph>
                )}
                <div style={{ marginTop: 6, fontSize: 12, color: req.callback_sent ? '#cf1322' : '#faad14' }}>
                  {req.callback_sent ? '✓ 驳回结果已同步回主中心' : '⚠ 回调主中心待重试'}
                </div>
              </div>
            }
          />
        )}

        {/* Basic info */}
        <div className="admin-detail__section">
          <Divider orientation="left" orientationMargin={0}>申请基本信息</Divider>
          <Descriptions column={2} size="small" bordered>
            <Descriptions.Item label="申请编号" span={2}>
              <Text code>{req.main_request_no}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="提交时间">
              {new Date(req.received_at).toLocaleString('zh-CN')}
            </Descriptions.Item>
            <Descriptions.Item label="申请时 IP">
              <Text code>{req.applicant_ip ?? '—'}</Text>
            </Descriptions.Item>
          </Descriptions>
        </div>

        {/* Resource */}
        <div className="admin-detail__section">
          <Divider orientation="left" orientationMargin={0}>申请数据信息</Divider>
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="数据名称">
              <strong>{req.resource_name ?? '—'}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Root ID">
              <Text code>{req.resource_id}</Text>
            </Descriptions.Item>
            {req.resource_detail && (
              <Descriptions.Item label="数据摘要">
                <Text style={{ fontSize: 13, color: '#52677a' }}>{req.resource_detail}</Text>
              </Descriptions.Item>
            )}
          </Descriptions>
        </div>

        {/* Applicant */}
        <div className="admin-detail__section">
          <Divider orientation="left" orientationMargin={0}>申请人信息</Divider>
          <Descriptions column={2} size="small" bordered>
            <Descriptions.Item label="姓名">{req.user_name ?? '—'}</Descriptions.Item>
            <Descriptions.Item label="所在单位">{req.user_institution ?? '—'}</Descriptions.Item>
            <Descriptions.Item label="邮箱">{req.user_email ?? '—'}</Descriptions.Item>
            <Descriptions.Item label="电话">{req.user_phone ?? '—'}</Descriptions.Item>
          </Descriptions>
        </div>

        {/* Purpose */}
        <div className="admin-detail__section">
          <Divider orientation="left" orientationMargin={0}>申请用途</Divider>
          <Descriptions column={2} size="small" bordered>
            <Descriptions.Item label="使用场景">
              {req.use_scenario
                ? (USE_SCENARIO_LABEL[req.use_scenario] ?? req.use_scenario)
                : <Text type="secondary">—</Text>}
            </Descriptions.Item>
            <Descriptions.Item label="申请说明" span={2}>
              <Paragraph style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{req.purpose ?? '—'}</Paragraph>
            </Descriptions.Item>
          </Descriptions>
        </div>

        {/* Attachment */}
        <div className="admin-detail__section">
          <Divider orientation="left" orientationMargin={0}>盖章扫描件</Divider>
          {req.attachment_path ? (
            <div className="admin-detail__attachment">
              <FileOutlined style={{ color: '#0f5f8f', fontSize: 18 }} />
              <div>
                <div style={{ fontFamily: 'monospace', fontSize: 12 }}>{req.attachment_path}</div>
                <div style={{ marginTop: 6, display: 'flex', gap: 8 }}>
                  <Button
                    size="small"
                    icon={<DownloadOutlined />}
                    href={`${MAIN_CENTER_UPLOAD_BASE}/${req.attachment_path}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    查看 / 下载附件
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <Text type="secondary">暂无附件（申请提交时未上传或旧格式申请）</Text>
          )}
        </div>
      </div>

      {/* Approve modal */}
      <Modal
        open={approveModalOpen}
        title={<span style={{ color: '#0f5f8f' }}><CheckOutlined /> 确认批准</span>}
        onOk={handleApprove}
        onCancel={() => setApproveModalOpen(false)}
        okText="确认批准"
        cancelText="取消"
        okButtonProps={{ loading: submitting }}
      >
        <p>批准后系统将自动生成数据下载链接，并将申请时 IP 绑定为允许下载的 IP 地址。</p>
        <p>审批结果将自动同步回主中心。</p>
        <Form layout="vertical" style={{ marginTop: 12 }}>
          <Form.Item label="审批意见（可选）">
            <TextArea
              rows={3}
              value={approveNote}
              onChange={(e) => setApproveNote(e.target.value)}
              placeholder="请输入审批意见，如有效期说明、使用限制等"
              maxLength={500}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Reject modal */}
      <Modal
        open={rejectModalOpen}
        title={<span style={{ color: '#cf1322' }}><CloseOutlined /> 确认驳回</span>}
        onOk={handleReject}
        onCancel={() => setRejectModalOpen(false)}
        okText="确认驳回"
        cancelText="取消"
        okType="danger"
        okButtonProps={{ loading: submitting }}
      >
        <p>驳回后审批结果将自动同步回主中心，申请人可在个人中心查看驳回理由。</p>
        <Form layout="vertical" style={{ marginTop: 12 }}>
          <Form.Item
            label={<span>驳回理由 <span style={{ color: '#ff4d4f' }}>*</span></span>}
          >
            <TextArea
              rows={4}
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="请详细说明驳回原因，以便申请人补充材料后重新申请"
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
