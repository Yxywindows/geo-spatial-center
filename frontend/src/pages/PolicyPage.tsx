import { useState } from 'react'
import { Tag } from 'antd'
import {
  ArrowRightOutlined,
  BookOutlined,
  BulbOutlined,
  FileProtectOutlined,
  FileTextOutlined,
  GlobalOutlined,
  RocketOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { SCI_ARTICLES } from '../data/science'
import { POLICY_ARTICLES } from '../data/policies'

type Tab = 'policy' | 'sci'

function scienceIcon(id: string) {
  if (id === 'geoai') return <RocketOutlined />
  if (id === 'human-earth') return <GlobalOutlined />
  if (id === 'remote-sensing') return <BulbOutlined />
  return <BookOutlined />
}

function policyIcon(category: string) {
  if (category.includes('标准') || category.includes('规范')) return <FileTextOutlined />
  if (category.includes('许可')) return <BookOutlined />
  return <FileProtectOutlined />
}

export default function PolicyPage() {
  const [tab, setTab] = useState<Tab>('policy')
  const navigate = useNavigate()

  return (
    <div>
      <div className="gs-policy-hero">
        <h1 className="gs-gradient-text">政策科普</h1>
        <p>地理空间数据政策文件解读 &amp; 地理空间智能科学知识宣传</p>
      </div>

      <div className="gs-policy-tabs">
        <button type="button" className={`gs-policy-tab${tab === 'policy' ? ' gs-policy-tab--active' : ''}`} onClick={() => setTab('policy')}>
          <FileProtectOutlined /> 政策文件
        </button>
        <button type="button" className={`gs-policy-tab${tab === 'sci' ? ' gs-policy-tab--active' : ''}`} onClick={() => setTab('sci')}>
          <BulbOutlined /> 科普知识
        </button>
      </div>

      {tab === 'policy' && (
        <div className="gs-policy-list">
          {POLICY_ARTICLES.map((a) => (
            <article
              key={a.id}
              className={`gs-policy-card${a.detailPath ? ' gs-policy-card--link' : ''}`}
              role={a.detailPath ? 'button' : undefined}
              tabIndex={a.detailPath ? 0 : undefined}
              onClick={() => { if (a.detailPath) navigate(a.detailPath) }}
              onKeyDown={(e) => { if (a.detailPath && e.key === 'Enter') navigate(a.detailPath) }}
            >
              <div className="gs-policy-card__icon">{policyIcon(a.category)}</div>
              <div className="gs-policy-card__body">
                <div className="gs-policy-card__meta">
                  <Tag color={a.categoryColor}>{a.category}</Tag>
                  <span className="gs-policy-card__date">{a.date}</span>
                  <span className="gs-policy-card__date">{a.issuer}</span>
                </div>
                <h3 className="gs-policy-card__title">{a.title}</h3>
                <p className="gs-policy-card__summary">{a.summary}</p>
              </div>
              {a.detailPath ? <ArrowRightOutlined className="gs-policy-card__arrow" /> : null}
            </article>
          ))}
        </div>
      )}

      {tab === 'sci' && (
        <div className="gs-sci-view">
          <section className="gs-sci-grid">
            {SCI_ARTICLES.map((a) => (
              <article
                key={a.id}
                className="gs-sci-card gs-sci-card--link"
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/policy/science/${a.id}`)}
                onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/policy/science/${a.id}`) }}
              >
                <img className="gs-sci-card__image" src={a.image} alt={a.title} />
                <div className="gs-sci-card__body-wrap">
                  <div className="gs-sci-card__meta">
                    <Tag className="gs-sci-card__tag">{a.tag}</Tag>
                  </div>
                  <h3 className="gs-sci-card__title">{a.title}</h3>
                  <p className="gs-sci-card__summary">{a.summary}</p>
                  <div className="gs-sci-card__points">
                    {a.points.map((point) => <span key={point}>{point}</span>)}
                  </div>
                  <div className="gs-sci-card__scene">
                    <div className="gs-sci-card__icon">{scienceIcon(a.id)}</div>
                    <p>查看完整图文介绍和视频内容</p>
                    <ArrowRightOutlined className="gs-sci-card__arrow" />
                  </div>
                </div>
              </article>
            ))}
          </section>
        </div>
      )}
    </div>
  )
}
