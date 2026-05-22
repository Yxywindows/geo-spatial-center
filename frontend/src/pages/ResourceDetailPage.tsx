import { useEffect, useState } from 'react'
import { Spin, Tag, Descriptions, Empty } from 'antd'
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  CodeOutlined,
  DatabaseOutlined,
  DownloadOutlined,
  EyeOutlined,
  FileOutlined,
  FileTextOutlined,
  LinkOutlined,
  MailOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import { getResource } from '../api/resources'
import type { Resource } from '../types/resource'

function formatStorage(bytes?: number) {
  if (!bytes) return '—'
  if (bytes >= 1e12) return `${(bytes / 1e12).toFixed(2)} TB`
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(2)} GB`
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(2)} MB`
  return `${(bytes / 1e3).toFixed(1)} KB`
}

function typeIcon(type?: string) {
  if (type === '论文') return <FileTextOutlined />
  if (type === '软件') return <CodeOutlined />
  return <DatabaseOutlined />
}

export default function ResourceDetailPage() {
  const { sourceId } = useParams<{ sourceId: string }>()
  const navigate = useNavigate()
  const [resource, setResource] = useState<Resource | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!sourceId) return
    setLoading(true)
    getResource(sourceId)
      .then(setResource)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [sourceId])

  if (loading) return (
    <div className="gs-loading" style={{ minHeight: 400 }}><Spin size="large" /></div>
  )

  if (error || !resource) return (
    <div style={{ padding: '40px 0' }}>
      <Empty description="资源不存在或暂时无法访问" />
      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <button type="button" className="gs-detail-back" onClick={() => navigate(-1)}>
          <ArrowLeftOutlined /> 返回
        </button>
      </div>
    </div>
  )

  return (
    <div>
      <button type="button" className="gs-detail-back" onClick={() => navigate(-1)}>
        <ArrowLeftOutlined /> 返回列表
      </button>

      {/* Hero */}
      <div className="gs-detail-hero">
        <div className="gs-detail-hero__inner">
          <div className="gs-detail-hero__icon">{typeIcon(resource.resource_type_name)}</div>
          <div>
            <div className="gs-detail-hero__badges">
              {resource.resource_type_name && <Tag>{resource.resource_type_name}</Tag>}
              {resource.privacy_type === 'open'
                ? <Tag color="green">开放获取</Tag>
                : <Tag color="orange">条件开放{resource.privacy_condition ? ` — ${resource.privacy_condition}` : ''}</Tag>}
              {resource.subjects.map((s) => <Tag key={s}>{s}</Tag>)}
            </div>
            <h1 className="gs-detail-hero__title">{resource.name}</h1>
            {resource.name_en && <p className="gs-detail-hero__title-en">{resource.name_en}</p>}
            <div className="gs-detail-hero__meta">
              {resource.organization_name && <span><UserOutlined /> {resource.organization_name}</span>}
              {resource.approve_time && <span><CalendarOutlined /> {resource.approve_time}</span>}
              <span><EyeOutlined /> 浏览 {resource.visit_num}</span>
              <span><DownloadOutlined /> 下载 {resource.download_num}</span>
              {resource.version && <span>版本 {resource.version}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Keywords */}
      {resource.keywords?.length > 0 && (
        <div className="gs-detail-section">
          <h2 className="gs-detail-section__title">关键词</h2>
          <div className="gs-kw-tags">
            {resource.keywords.map((kw) => (
              <span key={kw} className="gs-kw-tag" onClick={() => navigate(`/search?keyword=${encodeURIComponent(kw)}`)}>
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      {resource.description && (
        <div className="gs-detail-section">
          <h2 className="gs-detail-section__title">摘要</h2>
          <p className="gs-detail-text">{resource.description}</p>
        </div>
      )}

      {resource.detailed_description && (
        <div className="gs-detail-section">
          <h2 className="gs-detail-section__title">详细说明</h2>
          <p className="gs-detail-text">{resource.detailed_description}</p>
        </div>
      )}

      {/* Basic info */}
      <div className="gs-detail-section">
        <h2 className="gs-detail-section__title">基本信息</h2>
        <Descriptions bordered column={2} size="small">
          <Descriptions.Item label="资源 ID">{resource.source_id}</Descriptions.Item>
          <Descriptions.Item label="资源类型">{resource.resource_type_name ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="版本">{resource.version ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="许可协议">{resource.license ?? '—'}</Descriptions.Item>
          {resource.data_time && <Descriptions.Item label="数据时间">{resource.data_time}</Descriptions.Item>}
          {resource.region && <Descriptions.Item label="地理范围">{resource.region}</Descriptions.Item>}
          <Descriptions.Item label="开放状态">
            {resource.privacy_type === 'open' ? '开放获取' : `条件开放${resource.privacy_condition ? ` — ${resource.privacy_condition}` : ''}`}
          </Descriptions.Item>
          <Descriptions.Item label="存储大小">{formatStorage(resource.storage_num)}</Descriptions.Item>
          {resource.file_count != null && (
            <Descriptions.Item label="文件数量">{resource.file_count.toLocaleString()} 个</Descriptions.Item>
          )}
          {resource.create_time && <Descriptions.Item label="创建时间">{resource.create_time}</Descriptions.Item>}
          {resource.approve_time && <Descriptions.Item label="发布时间">{resource.approve_time}</Descriptions.Item>}
          {resource.doi && (
            <Descriptions.Item label="DOI" span={2}>
              <a href={`https://doi.org/${resource.doi}`} target="_blank" rel="noreferrer" style={{ color: 'var(--cyan)' }}>
                <LinkOutlined /> {resource.doi}
              </a>
            </Descriptions.Item>
          )}
        </Descriptions>
      </div>

      {/* File formats */}
      {resource.file_formats && resource.file_formats.length > 0 && (
        <div className="gs-detail-section">
          <h2 className="gs-detail-section__title"><FileOutlined /> 文件格式</h2>
          <div className="gs-file-formats">
            {resource.file_formats.map((f) => (
              <div key={f.name} className="gs-file-badge">
                <span className="gs-file-badge__ext">.{f.name}</span>
                <span className="gs-file-badge__count">×{f.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Authors */}
      {resource.authors && resource.authors.length > 0 && (
        <div className="gs-detail-section">
          <h2 className="gs-detail-section__title"><TeamOutlined /> 作者列表</h2>
          <div className="gs-authors-grid">
            {resource.authors.map((a, i) => (
              <div key={i} className="gs-author-card">
                <div className="gs-author-card__name"><UserOutlined style={{ marginRight: 6 }} />{a.name}</div>
                {a.en_name && <div className="gs-author-card__en">{a.en_name}</div>}
                {a.Organization && <div className="gs-author-card__org">{a.Organization.name}</div>}
                {a.email && <div className="gs-author-card__email"><a href={`mailto:${a.email}`}><MailOutlined style={{ marginRight: 4 }} />{a.email}</a></div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Corresponding author */}
      {(resource.corresponding_author_name || resource.corresponding_author_email) && (
        <div className="gs-detail-section">
          <h2 className="gs-detail-section__title">通讯作者</h2>
          <Descriptions bordered column={2} size="small">
            {resource.corresponding_author_name && (
              <Descriptions.Item label={<><UserOutlined /> 姓名</>}>{resource.corresponding_author_name}</Descriptions.Item>
            )}
            {resource.corresponding_author_email && (
              <Descriptions.Item label={<><MailOutlined /> 邮箱</>}>
                <a href={`mailto:${resource.corresponding_author_email}`} style={{ color: 'var(--cyan)' }}>
                  {resource.corresponding_author_email}
                </a>
              </Descriptions.Item>
            )}
          </Descriptions>
        </div>
      )}

      {/* Unit info */}
      {(resource.unit_name || resource.unit_address) && (
        <div className="gs-detail-section">
          <h2 className="gs-detail-section__title">所属单位</h2>
          <Descriptions bordered column={1} size="small">
            {resource.unit_name && <Descriptions.Item label="单位名称">{resource.unit_name}</Descriptions.Item>}
            {resource.unit_address && <Descriptions.Item label="单位地址">{resource.unit_address}</Descriptions.Item>}
            {resource.unit_postal_code && <Descriptions.Item label="邮政编码">{resource.unit_postal_code}</Descriptions.Item>}
          </Descriptions>
        </div>
      )}
    </div>
  )
}
