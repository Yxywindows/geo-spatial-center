import { useEffect, useRef, useState } from 'react'
import { Tag } from 'antd'
import {
  ArrowRightOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  GlobalOutlined,
  SearchOutlined,
  UnlockOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { listResources, getStats, getTopKeywords } from '../api/resources'
import type { Resource, StatsResponse, FacetItem } from '../types/resource'
import WordCloud from '../components/ui/WordCloud'
import heroGlobeUrl from '../assets/hero-globe.webp'

function useCountUp(target: number, duration = 1600) {
  const [count, setCount] = useState(0)
  const raf = useRef<number>(0)
  useEffect(() => {
    if (!target) return
    const start = performance.now()
    const animate = (now: number) => {
      const p = Math.min((now - start) / duration, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setCount(Math.floor(ease * target))
      if (p < 1) raf.current = requestAnimationFrame(animate)
    }
    raf.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf.current)
  }, [target, duration])
  return count
}

function resourceAccent(type?: string) {
  if (type === '论文') return { color: '#10b981', rgb: '16,185,129' }
  if (type === '软件') return { color: '#248a3d', rgb: '36,138,61' }
  return { color: '#208152', rgb: '32,129,82' }
}

function formatStorage(bytes?: number) {
  if (!bytes) return null
  if (bytes >= 1e12) return `${(bytes / 1e12).toFixed(1)} TB`
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(1)} GB`
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB`
  return `${(bytes / 1e3).toFixed(1)} KB`
}

const NAV_TILES = [
  { icon: <SearchOutlined />, title: '数据检索', desc: '全文搜索与多维度筛选，快速定位目标资源', path: '/search', color: '#208152', rgb: '32,129,82', bg: 'rgba(32,129,82,0.1)' },
  { icon: <UnlockOutlined />, title: '开放资源', desc: '浏览所有开放获取的数据集与论文', path: '/search?privacy=open', color: '#10b981', rgb: '16,185,129', bg: 'rgba(16,185,129,0.1)' },
  { icon: <FileTextOutlined />, title: '政策科普', desc: '数据政策解读与地理空间智能科普知识', path: '/policy', color: '#248a3d', rgb: '36,138,61', bg: 'rgba(36,138,61,0.1)' },
  { icon: <GlobalOutlined />, title: '全部资源', desc: '查看本分中心所有已发布资源', path: '/search', color: '#7fbf4d', rgb: '127,191,77', bg: 'rgba(127,191,77,0.12)' },
]

export default function HomePage() {
  const navigate = useNavigate()
  const [resources, setResources] = useState<Resource[]>([])
  const [stats, setStats] = useState<StatsResponse | null>(null)
  const [keywords, setKeywords] = useState<FacetItem[]>([])

  useEffect(() => {
    listResources({ limit: 6, sort: 'create_time' })
      .then((r) => { if (r.data.length) setResources(r.data.slice(0, 6)) })
      .catch(() => {})
    getStats().then(setStats).catch(() => {})
    getTopKeywords(50).then(setKeywords).catch(() => {})
  }, [])

  const total = useCountUp(stats?.total ?? 0)
  const openCount = useCountUp(stats?.open_count ?? 0)
  const subjectCount = useCountUp(stats?.subject_count ?? 0)
  const datasetCount = useCountUp(stats?.dataset_count ?? 0)
  const wcWords = keywords.map((k) => ({ word: k.name, count: k.count }))

  return (
    <div>
      <section className="gs-hero">
        <div className="gs-hero__inner">
          <div className="gs-hero__content">
            <div className="gs-hero__eyebrow">
              <GlobalOutlined style={{ fontSize: 12 }} />
              Sub-center · Geospatial Intelligence &amp; Human-Earth Systems
            </div>
            <h1 className="gs-hero__title">地理空间智能与人地系统</h1>
            <p className="gs-hero__subtitle">
              聚焦地理空间智能（GeoAI）与人地系统科学，汇聚多源时空数据融合、空间智能分析与区域治理
              关键研究，构建面向复杂人地系统的空间认知与模拟能力。
            </p>
            <div className="gs-hero__actions">
              <button type="button" className="gs-hero__btn-primary" onClick={() => navigate('/search')}>
                开始检索 <ArrowRightOutlined />
              </button>
              <button type="button" className="gs-hero__btn-secondary" onClick={() => navigate('/policy')}>
                了解更多
              </button>
            </div>
          </div>
          <div className="gs-hero__visual" aria-hidden="true">
            <img src={heroGlobeUrl} alt="" />
          </div>
        </div>
      </section>

      <section className="gs-stat-band" aria-label="资源统计">
        <div className="gs-stat">
          <span className="gs-stat__icon"><DatabaseOutlined /></span>
          <span className="gs-stat__val">{total}</span>
          <span className="gs-stat__lbl">资源总数</span>
        </div>
        <div className="gs-hero__divider" />
        <div className="gs-stat">
          <span className="gs-stat__icon"><UnlockOutlined /></span>
          <span className="gs-stat__val">{openCount}</span>
          <span className="gs-stat__lbl">开放获取</span>
        </div>
        <div className="gs-hero__divider" />
        <div className="gs-stat">
          <span className="gs-stat__icon"><FileTextOutlined /></span>
          <span className="gs-stat__val">{subjectCount}</span>
          <span className="gs-stat__lbl">学科方向</span>
        </div>
        <div className="gs-hero__divider" />
        <div className="gs-stat">
          <span className="gs-stat__icon"><DatabaseOutlined /></span>
          <span className="gs-stat__val">{datasetCount}</span>
          <span className="gs-stat__lbl">数据集</span>
        </div>
      </section>

      {wcWords.length > 0 && (
        <section className="gs-wc-section">
          <div className="gs-wc-card">
            <div className="gs-section-head">
              <h2>关键词云 / 热门主题</h2>
              <button type="button" className="gs-section-link" onClick={() => navigate('/search')}>
                查看全部 <ArrowRightOutlined />
              </button>
            </div>
            <WordCloud words={wcWords} />
          </div>
        </section>
      )}

      <section className="gs-tiles">
        <div className="gs-section-head">
          <h2>功能入口</h2>
        </div>
        <div className="gs-tiles__grid">
          {NAV_TILES.map((tile) => (
            <button
              key={tile.title}
              type="button"
              className="gs-tile"
              style={{ '--tile-color': tile.color, '--tile-rgb': tile.rgb, '--tile-bg': tile.bg } as React.CSSProperties}
              onClick={() => navigate(tile.path)}
            >
              <div className="gs-tile__icon">{tile.icon}</div>
              <div className="gs-tile__content">
                <div className="gs-tile__title">{tile.title}</div>
                <div className="gs-tile__desc">{tile.desc}</div>
              </div>
              <ArrowRightOutlined className="gs-tile__arrow" />
            </button>
          ))}
        </div>
      </section>

      {resources.length > 0 && (
        <section>
          <div className="gs-section-head">
            <h2>最新资源</h2>
            <button type="button" className="gs-section-link" onClick={() => navigate('/search')}>
              查看全部 <ArrowRightOutlined />
            </button>
          </div>
          <div className="gs-res-grid">
            {resources.map((r, i) => {
              const accent = resourceAccent(r.resource_type_name)
              return (
                <article
                  key={r.source_id}
                  className="gs-res-card"
                  role="button"
                  tabIndex={0}
                  style={{
                    '--card-accent': accent.color,
                    '--card-accent-rgb': accent.rgb,
                    animationDelay: `${i * 60}ms`,
                  } as React.CSSProperties}
                  onClick={() => navigate(`/resource/${r.source_id}`)}
                  onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/resource/${r.source_id}`) }}
                >
                  <div>
                    <div className="gs-res-card__badges">
                      <Tag>{r.resource_type_name ?? '资源'}</Tag>
                      {r.privacy_type === 'open' && <Tag color="green">开放</Tag>}
                    </div>
                    {r.subjects.length > 0 && (
                      <p className="gs-res-card__subject">{r.subjects[0]}</p>
                    )}
                    <h3 className="gs-res-card__title">{r.name}</h3>
                    <div className="gs-res-card__tags">
                      {r.keywords.slice(0, 3).map((kw) => <Tag key={kw}>{kw}</Tag>)}
                    </div>
                  </div>
                  <div className="gs-res-card__footer">
                    <span className="gs-res-card__org">{r.organization_name ?? '—'}</span>
                    {r.storage_num ? <span className="gs-res-card__size">{formatStorage(r.storage_num)}</span> : null}
                    <ArrowRightOutlined style={{ color: 'var(--t4)', flexShrink: 0 }} />
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
