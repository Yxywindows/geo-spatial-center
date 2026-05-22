import { useState } from 'react'
import { Tag } from 'antd'
import {
  BookOutlined,
  BulbOutlined,
  FileProtectOutlined,
  FileTextOutlined,
  GlobalOutlined,
  RocketOutlined,
} from '@ant-design/icons'

interface PolicyArticle {
  id: string; category: string; categoryColor: string
  title: string; summary: string; date: string; icon: React.ReactNode
}

const POLICY_ARTICLES: PolicyArticle[] = [
  { id: 'p1', category: '国家政策', categoryColor: 'red', icon: <FileProtectOutlined />, date: '2018-03-17',
    title: '《科学数据管理办法》（国办发〔2018〕17号）',
    summary: '国务院办公厅印发，明确科学数据采集、汇交、保存、共享和利用等各环节的管理规范，要求利用财政资金资助的科研项目所形成的科学数据要向国家汇交。' },
  { id: 'p2', category: '行业规范', categoryColor: 'orange', icon: <FileTextOutlined />, date: '2022-06-01',
    title: '地理空间数据共享开放技术规范（GB/T XXXXX）',
    summary: '规定地理空间数据共享与开放的技术要求，包括数据格式标准、坐标参考系统、元数据规范及数据质量检验等，保障地理数据互操作性。' },
  { id: 'p3', category: '省级政策', categoryColor: 'blue', icon: <FileProtectOutlined />, date: '2020-09-01',
    title: '江苏省科学数据管理与共享实施细则',
    summary: '江苏省依据国家《科学数据管理办法》制定，明确省内科学数据汇交义务、共享激励机制及隐私保护要求，推动省内科研数据有序共享利用。' },
  { id: 'p4', category: '数据许可', categoryColor: 'purple', icon: <BookOutlined />, date: '2023-01-10',
    title: 'CC BY 系列许可证在科学数据集中的应用指南',
    summary: '介绍知识共享（Creative Commons）许可协议体系，重点说明 CC BY 4.0、CC BY-ND 4.0 等协议在地理空间数据开放共享中的适用场景与版权保护边界。' },
]

interface SciArticle {
  id: string; tag: string; title: string; body: string; icon: React.ReactNode
}

const SCI_ARTICLES: SciArticle[] = [
  { id: 's1', tag: 'GeoAI 基础', icon: <RocketOutlined />,
    title: '什么是地理空间智能（GeoAI）？',
    body: 'GeoAI 是人工智能与地理信息科学深度融合形成的交叉领域，利用深度学习、机器学习等方法处理海量时空数据，实现自动化的地理目标识别、时空格局挖掘与区域演化模拟。核心技术包括空间卷积神经网络、图神经网络（GNN）时空图及自监督遥感预训练模型等。' },
  { id: 's2', tag: '人地系统', icon: <GlobalOutlined />,
    title: '人地系统科学：理解人类与地球的互动',
    body: '人地系统研究人类社会与自然环境之间的相互作用机制，涵盖土地利用变化、城镇化进程、生态系统服务、气候变化影响与区域可持续发展等核心议题。时空大数据为人地关系的定量模拟提供了前所未有的观测精度与时间分辨率。' },
  { id: 's3', tag: '遥感技术', icon: <BulbOutlined />,
    title: '多源遥感数据融合：从像素到知识',
    body: '多源遥感融合整合光学、SAR、夜间灯光、高分辨率商业卫星等不同传感器数据，克服单一源数据在云覆盖、时间分辨率或空间分辨率上的局限，产出更高精度的地表分类、变化检测与参数反演产品，支撑城市监测、农业估产与灾害评估等应用。' },
  { id: 's4', tag: '数据开放', icon: <BookOutlined />,
    title: '开放地理数据：价值与挑战',
    body: '开放地理数据打破数据孤岛，使政府、企业与科研机构能够叠加分析多来源空间信息，驱动城市规划、应急响应与公共健康等领域的数据驱动决策。主要挑战包括数据版权归属、坐标系与格式异构、隐私脱敏以及持续更新机制的建立。' },
]

type Tab = 'policy' | 'sci'

export default function PolicyPage() {
  const [tab, setTab] = useState<Tab>('policy')

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
            <article key={a.id} className="gs-policy-card">
              <div className="gs-policy-card__icon">{a.icon}</div>
              <div className="gs-policy-card__body">
                <div className="gs-policy-card__meta">
                  <Tag color={a.categoryColor}>{a.category}</Tag>
                  <span className="gs-policy-card__date">{a.date}</span>
                </div>
                <h3 className="gs-policy-card__title">{a.title}</h3>
                <p className="gs-policy-card__summary">{a.summary}</p>
              </div>
            </article>
          ))}
        </div>
      )}

      {tab === 'sci' && (
        <div className="gs-sci-grid">
          {SCI_ARTICLES.map((a) => (
            <article key={a.id} className="gs-sci-card">
              <div className="gs-sci-card__icon">{a.icon}</div>
              <div>
                <Tag className="gs-sci-card__tag" color="purple">{a.tag}</Tag>
                <h3 className="gs-sci-card__title" style={{ marginTop: 8 }}>{a.title}</h3>
                <p className="gs-sci-card__body" style={{ marginTop: 10 }}>{a.body}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
