import { Empty, Tag } from 'antd'
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  FilePdfOutlined,
  LinkOutlined,
} from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import { POLICY_DETAILS } from '../data/policies'

export default function PolicyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const policy = POLICY_DETAILS.find((item) => item.id === id)

  if (!policy) {
    return (
      <div style={{ padding: '40px 0' }}>
        <Empty description="政策文件详情暂未收录" />
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button type="button" className="gs-detail-back" onClick={() => navigate('/policy')}>
            <ArrowLeftOutlined /> 返回政策列表
          </button>
        </div>
      </div>
    )
  }

  return (
    <article className="gs-policy-detail">
      <button type="button" className="gs-detail-back" onClick={() => navigate('/policy')}>
        <ArrowLeftOutlined /> 返回政策列表
      </button>

      <section className="gs-policy-detail-hero">
        <div className="gs-policy-detail-hero__copy">
          <div className="gs-policy-detail-hero__meta">
            <Tag color={policy.categoryColor}>{policy.category}</Tag>
            <span>{policy.date}</span>
            <span>{policy.issuer}</span>
          </div>
          <h1>{policy.title}</h1>
          <p>{policy.overview}</p>
          {policy.sourceUrl ? (
            <a href={policy.sourceUrl} target="_blank" rel="noreferrer">
              <LinkOutlined /> 查看原文
            </a>
          ) : null}
        </div>
        <div className="gs-policy-detail-hero__image">
          <img src={policy.imageUrl} alt={`${policy.title} 图解`} />
        </div>
      </section>

      <section className="gs-policy-facts" aria-label="政策信息">
        {policy.facts.map((fact) => (
          <div key={fact.label} className="gs-policy-fact">
            <span>{fact.label}</span>
            <strong>{fact.value}</strong>
          </div>
        ))}
      </section>

      <div className="gs-policy-detail-layout">
        <main className="gs-policy-detail-main">
          <section className="gs-policy-article">
            <div className="gs-policy-article__head">
              <h2>政策解读</h2>
              <p>{policy.sourceLabel}</p>
            </div>

            <div className="gs-policy-article__body">
              {policy.paragraphs.map((section) => (
                <section key={section.title}>
                  <h3>{section.title}</h3>
                  <p>{section.body}</p>
                </section>
              ))}
            </div>
          </section>

          <section className="gs-policy-pdf">
            <div className="gs-policy-pdf__head">
              <div>
                <h2><FilePdfOutlined /> 政策原文</h2>
                <p>下方为政策文件 PDF，可直接在页面中滚动阅读。</p>
              </div>
              <a href={policy.pdfUrl} target="_blank" rel="noreferrer">新窗口打开</a>
            </div>
            <object data={policy.pdfUrl} type="application/pdf" title={policy.title}>
              <iframe src={policy.pdfUrl} title={policy.title} />
            </object>
          </section>
        </main>

        <aside className="gs-policy-detail-aside">
          <section className="gs-policy-side-card">
            <h2>管理重点</h2>
            <div className="gs-policy-highlight-list">
              {policy.highlights.map((item, index) => (
                <div key={item.title} className="gs-policy-highlight">
                  <span>{index + 1}</span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="gs-policy-side-card">
            <h2><CheckCircleOutlined /> 阅读提示</h2>
            <p>
              这类文件的重点不只是条文内容，更在于把数据采集、汇交、保存、共享、交换和安全管理落实到具体流程。
              阅读时可以重点关注责任主体、适用范围、数据流转方式和安全边界。
            </p>
          </section>
        </aside>
      </div>
    </article>
  )
}
