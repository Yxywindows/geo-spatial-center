import { Empty, Tag } from 'antd'
import {
  ArrowLeftOutlined,
  PlayCircleOutlined,
  ReadOutlined,
  TagsOutlined,
} from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import { SCI_ARTICLES, SCI_VIDEOS } from '../data/science'

export default function ScienceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const article = SCI_ARTICLES.find((item) => item.id === id)

  if (!article) {
    return (
      <div style={{ padding: '40px 0' }}>
        <Empty description="科普内容不存在或暂时无法访问" />
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button type="button" className="gs-detail-back" onClick={() => navigate('/policy')}>
            <ArrowLeftOutlined /> 返回科普列表
          </button>
        </div>
      </div>
    )
  }

  const video = SCI_VIDEOS.find((item) => item.articleId === article.id) ?? SCI_VIDEOS[0]
  const related = SCI_ARTICLES.filter((item) => item.id !== article.id).slice(0, 3)

  return (
    <article className="gs-science-detail">
      <button type="button" className="gs-detail-back" onClick={() => navigate('/policy')}>
        <ArrowLeftOutlined /> 返回科普列表
      </button>

      <section className="gs-science-hero">
        <img src={article.image} alt={article.title} />
          <div className="gs-science-hero__content">
            <div className="gs-science-hero__meta">
              <Tag>{article.tag}</Tag>
            </div>
            <h1>{article.title}</h1>
            <p>{article.body}</p>
        </div>
      </section>

      <div className="gs-science-layout">
        <main className="gs-science-main">
          <section className="gs-science-video">
            {video.videoUrl ? (
              <div className="gs-science-video__player">
                <video
                  src={video.videoUrl}
                  controls
                  preload="metadata"
                />
              </div>
            ) : (
              <div className="gs-science-video__cover">
                <img src={video.cover} alt={video.title} />
                <div className="gs-science-video__placeholder">
                  <PlayCircleOutlined />
                  <strong>视频占位</strong>
                  <span>{video.duration} · 后续可替换为 HyperFrames 成片</span>
                </div>
              </div>
            )}
          </section>

          {article.sections.map((section) => (
            <section key={section.title} className="gs-science-section">
              <h2><ReadOutlined /> {section.title}</h2>
              <p>{section.body}</p>
            </section>
          ))}
        </main>

        <aside className="gs-science-aside">
          <section className="gs-science-side-card">
            <h2><TagsOutlined /> 关键概念</h2>
            <div className="gs-science-keywords">
              {article.points.map((point) => <span key={point}>{point}</span>)}
            </div>
          </section>

          <section className="gs-science-side-card">
            <h2>应用场景</h2>
            <p>{article.scene}</p>
          </section>

          <section className="gs-science-side-card">
            <h2>继续阅读</h2>
            <div className="gs-science-related">
              {related.map((item) => (
                <button key={item.id} type="button" onClick={() => navigate(`/policy/science/${item.id}`)}>
                  <img src={item.image} alt="" />
                  <span>{item.title}</span>
                </button>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </article>
  )
}
