import { useCallback, useEffect, useRef, useState } from 'react'
import { Button, Input, Pagination, Spin, Tag, Empty } from 'antd'
import {
  CodeOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  FilterOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { listResources, getSubjects, getResourceTypes, getTopKeywords } from '../api/resources'
import type { Resource, FacetItem } from '../types/resource'
import WordCloud from '../components/ui/WordCloud'

const HOT_KEYWORDS = [
  '太湖', '土地利用', '人口', '江苏省', '遥感', '地球化学',
  '空气污染', '洪泽湖', '生态', '城市', '水质', '气候',
]

const PAGE_SIZE = 10

function resourceAccent(type?: string) {
  if (type === '论文') return { color: '#10b981', rgb: '16,185,129' }
  if (type === '软件') return { color: '#248a3d', rgb: '36,138,61' }
  return { color: '#208152', rgb: '32,129,82' }
}

function resourceIcon(type?: string) {
  if (type === '论文') return <FileTextOutlined />
  if (type === '软件') return <CodeOutlined />
  return <DatabaseOutlined />
}

function formatStorage(bytes?: number) {
  if (!bytes) return null
  if (bytes >= 1e12) return `${(bytes / 1e12).toFixed(1)} TB`
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(1)} GB`
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB`
  return `${(bytes / 1e3).toFixed(1)} KB`
}

export default function SearchPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [subject, setSubject] = useState(searchParams.get('subject') ?? '')
  const [keyword, setKeyword] = useState(searchParams.get('keyword') ?? '')
  const [resourceType, setResourceType] = useState(searchParams.get('type') ?? '')
  const [privacy, setPrivacy] = useState(searchParams.get('privacy') ?? '')
  const [page, setPage] = useState(Number(searchParams.get('page') ?? 1))

  const [resources, setResources] = useState<Resource[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [subjects, setSubjects] = useState<FacetItem[]>([])
  const [types, setTypes] = useState<FacetItem[]>([])
  const [topKeywords, setTopKeywords] = useState<FacetItem[]>([])

  const inputRef = useRef<string>(query)

  const load = useCallback(async (q: string, sub: string, kw: string, tp: string, pv: string, pg: number) => {
    setLoading(true)
    try {
      const params: Record<string, string | number> = { limit: PAGE_SIZE, offset: (pg - 1) * PAGE_SIZE }
      if (q) params.q = q
      if (sub) params.subject = sub
      if (kw) params.keyword = kw
      if (tp) params.type = tp
      if (pv) params.privacy = pv
      const res = await listResources(params)
      setResources(res.data)
      setTotal(res.total)
    } catch {
      setResources([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    getSubjects().then(setSubjects).catch(() => {})
    getResourceTypes().then(setTypes).catch(() => {})
    getTopKeywords(60).then(setTopKeywords).catch(() => {})
  }, [])

  useEffect(() => {
    load(query, subject, keyword, resourceType, privacy, page)
  }, [subject, keyword, resourceType, privacy, page, load, query])

  function handleSearch() {
    const q = inputRef.current
    setQuery(q); setPage(1)
    const p: Record<string, string> = {}
    if (q) p.q = q
    if (subject) p.subject = subject
    if (keyword) p.keyword = keyword
    if (resourceType) p.type = resourceType
    if (privacy) p.privacy = privacy
    setSearchParams(p)
    load(q, subject, keyword, resourceType, privacy, 1)
  }

  return (
    <div>
      <div className="gs-search-hero">
        <h1 className="gs-gradient-text"><SearchOutlined /> 资源检索</h1>
        <p>搜索地理空间智能与人地系统领域科学资源</p>
      </div>

      <div className="gs-search-bar">
        <Input
          prefix={<SearchOutlined style={{ color: 'var(--t3)' }} />}
          placeholder="输入关键词、资源名称、机构..."
          defaultValue={query}
          onChange={(e) => { inputRef.current = e.target.value }}
          onPressEnter={handleSearch}
          allowClear
          size="large"
        />
        <Button type="primary" size="large" icon={<SearchOutlined />} onClick={handleSearch}>
          搜索
        </Button>
      </div>

      <div className="gs-chips">
        <FilterOutlined style={{ color: 'var(--t3)' }} />
        <span>热门：</span>
        {HOT_KEYWORDS.map((kw) => (
          <button
            key={kw}
            type="button"
            className={`gs-chip${keyword === kw ? ' gs-chip--active' : ''}`}
            onClick={() => { setKeyword(keyword === kw ? '' : kw); setPage(1) }}
          >
            {kw}
          </button>
        ))}
      </div>

      {topKeywords.length > 0 && (
        <section className="gs-wc-section">
          <div className="gs-wc-card">
            <p className="gs-filter-label" style={{ marginBottom: 16, marginTop: 0 }}>关键词分析</p>
            <WordCloud
              words={topKeywords.map(k => ({ word: k.name, count: k.count }))}
              onWordClick={(word) => { setKeyword(keyword === word ? '' : word); setPage(1) }}
              activeWord={keyword}
            />
          </div>
        </section>
      )}

      <div className="gs-search-layout">
        <aside className="gs-sidebar">
          <div className="gs-filter-group">
            <p className="gs-filter-label">资源类型</p>
            <button
              type="button"
              className={`gs-filter-btn${resourceType === '' ? ' gs-filter-btn--active' : ''}`}
              onClick={() => { setResourceType(''); setPage(1) }}
            >
              全部类型
            </button>
            {types.map((t) => (
              <button
                key={t.name}
                type="button"
                className={`gs-filter-btn${resourceType === t.name ? ' gs-filter-btn--active' : ''}`}
                onClick={() => { setResourceType(resourceType === t.name ? '' : t.name); setPage(1) }}
              >
                {t.name}
                <span className="gs-filter-count">{t.count}</span>
              </button>
            ))}
          </div>

          <div className="gs-filter-group">
            <p className="gs-filter-label">开放状态</p>
            {[['', '全部'], ['open', '开放获取'], ['condition', '条件开放']].map(([val, label]) => (
              <button
                key={val}
                type="button"
                className={`gs-filter-btn${privacy === val ? ' gs-filter-btn--active' : ''}`}
                onClick={() => { setPrivacy(privacy === val ? '' : val); setPage(1) }}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="gs-filter-group">
            <p className="gs-filter-label">学科方向</p>
            <button
              type="button"
              className={`gs-filter-btn${subject === '' ? ' gs-filter-btn--active' : ''}`}
              onClick={() => { setSubject(''); setPage(1) }}
            >
              全部
            </button>
            {subjects.map((s) => (
              <button
                key={s.name}
                type="button"
                className={`gs-filter-btn${subject === s.name ? ' gs-filter-btn--active' : ''}`}
                onClick={() => { setSubject(subject === s.name ? '' : s.name); setPage(1) }}
              >
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'left' }}>
                  {s.name}
                </span>
                <span className="gs-filter-count">{s.count}</span>
              </button>
            ))}
          </div>
        </aside>

        <div className="gs-results">
          <p className="gs-results__meta">
            {loading ? '' : `共找到 ${total} 个资源`}
          </p>

          {loading ? (
            <div className="gs-loading"><Spin size="large" /></div>
          ) : resources.length === 0 ? (
            <Empty description="暂无相关资源" />
          ) : (
            <>
              <div className="gs-result-list">
                {resources.map((r) => {
                  const accent = resourceAccent(r.resource_type_name)
                  return (
                    <article
                      key={r.source_id}
                      className="gs-result-item"
                      role="button"
                      tabIndex={0}
                      style={{ '--item-accent': accent.color, '--item-accent-rgb': accent.rgb } as React.CSSProperties}
                      onClick={() => navigate(`/resource/${r.source_id}`)}
                      onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/resource/${r.source_id}`) }}
                    >
                      <div className="gs-result-item__icon">{resourceIcon(r.resource_type_name)}</div>
                      <div className="gs-result-item__body">
                        <div className="gs-result-item__tags">
                          {r.resource_type_name && <Tag>{r.resource_type_name}</Tag>}
                          {r.privacy_type === 'open' ? <Tag color="green">开放获取</Tag> : <Tag color="orange">条件开放</Tag>}
                          {r.subjects.slice(0, 2).map((s) => <Tag key={s}>{s}</Tag>)}
                        </div>
                        <h3 className="gs-result-item__title">{r.name}</h3>
                        {r.name_en && <p className="gs-result-item__name-en">{r.name_en}</p>}
                        {r.description && (
                          <p className="gs-result-item__desc">
                            {r.description.slice(0, 160)}{r.description.length > 160 ? '…' : ''}
                          </p>
                        )}
                        <div className="gs-result-item__meta">
                          {r.keywords.slice(0, 4).map((kw) => <Tag key={kw}>{kw}</Tag>)}
                          {r.organization_name && <span>{r.organization_name}</span>}
                          {r.data_time && <span>时间：{r.data_time}</span>}
                          {r.storage_num ? <span>{formatStorage(r.storage_num)}</span> : null}
                          {r.file_count ? <span>{r.file_count.toLocaleString()} 个文件</span> : null}
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>

              {total > PAGE_SIZE && (
                <div className="gs-pagination">
                  <Pagination
                    current={page}
                    total={total}
                    pageSize={PAGE_SIZE}
                    onChange={(p) => { setPage(p); setSearchParams({ q: query, page: String(p) }) }}
                    showTotal={(t) => `共 ${t} 条`}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
