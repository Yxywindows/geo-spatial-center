export interface PolicyArticle {
  id: string
  category: string
  categoryColor: string
  title: string
  summary: string
  date: string
  issuer: string
  detailPath?: string
}

export interface PolicyDetail extends PolicyArticle {
  imageUrl: string
  pdfUrl: string
  sourceUrl?: string
  sourceLabel: string
  overview: string
  facts: Array<{ label: string; value: string }>
  highlights: Array<{ title: string; body: string }>
  paragraphs: Array<{ title: string; body: string }>
}

const p1Pdf = '/policyfile/p1/policy.pdf'
const p2Pdf = '/policyfile/p2/policy.pdf'
const p3Pdf = '/policyfile/p3/policy.pdf'
const p4Pdf = '/policyfile/p4/policy.pdf'

export const POLICY_ARTICLES: PolicyArticle[] = [
  {
    id: 'science-data-management',
    category: '国家政策',
    categoryColor: 'red',
    date: '2018-03-17',
    issuer: '国务院办公厅',
    title: '《科学数据管理办法》（国办发〔2018〕17号）',
    summary: '明确科学数据采集、汇交、保存、共享利用和安全管理要求，推动财政资金支持形成的科学数据规范管理、开放共享和长期保存。',
    detailPath: '/policy/file/science-data-management',
  },
  {
    id: 'geo-spatial-data-exchange',
    category: '国家标准',
    categoryColor: 'orange',
    date: '2021-10-11',
    issuer: '国家市场监督管理总局、国家标准化管理委员会',
    title: 'GB/T 40767-2021《地理空间数据交换基本要求》',
    summary: '规定地理空间数据交换的组织、流程、数据内容、交换方式、系统能力、周期和安全要求，为跨部门、跨平台数据流通提供统一规则。',
    detailPath: '/policy/file/geo-spatial-data-exchange',
  },
  {
    id: 'jiangsu-science-data',
    category: '省级政策',
    categoryColor: 'blue',
    date: '2020-09-01',
    issuer: '江苏省',
    title: '江苏省科学数据管理与共享实施细则',
    summary: '结合国家科学数据管理要求，细化省内科学数据汇交、保存、共享利用、安全保护和服务能力建设等实施机制。',
    detailPath: '/policy/file/jiangsu-science-data',
  },
  {
    id: 'city-spatiotemporal-big-data',
    category: '行业标准',
    categoryColor: 'green',
    date: '2023-03-05',
    issuer: '自然资源部',
    title: 'TD/T 1073-2023《国土空间规划城市时空大数据应用基本规定》',
    summary: '面向国土空间规划中的城市时空大数据应用，明确数据采集处理、融合分析、应用场景和成果表达要求，支撑规划编制、实施监督与城市治理。',
    detailPath: '/policy/file/city-spatiotemporal-big-data',
  },
]

export const POLICY_DETAILS: PolicyDetail[] = [
  {
    ...POLICY_ARTICLES[0],
    imageUrl: 'https://www.gov.cn/xinwen/2018-04/02/W020220411610172142340.jpg',
    pdfUrl: p1Pdf,
    sourceUrl: 'https://www.gov.cn/zhengce/content/2018-04/02/content_5279272.htm',
    sourceLabel: '国务院办公厅关于印发科学数据管理办法的通知',
    overview: '《科学数据管理办法》是我国面向科学数据全生命周期管理的重要制度文件。文件把科学数据定位为国家科技创新、经济社会发展和国家安全的重要基础性战略资源，要求建立职责明确、汇交规范、保存可靠、共享有序、安全可控的管理体系。',
    facts: [
      { label: '发文机关', value: '国务院办公厅' },
      { label: '文号', value: '国办发〔2018〕17号' },
      { label: '发布日期', value: '2018-03-17' },
      { label: '关键词', value: '科学数据、汇交保存、开放共享、安全管理' },
    ],
    highlights: [
      { title: '明确责任分工', body: '主管部门、法人单位和科学数据中心分别承担管理、组织、保存和服务职责，形成清晰责任链条。' },
      { title: '规范汇交保存', body: '财政资金支持形成的科学数据，应按要求汇交到相关科学数据中心，进行规范管理和长期保存。' },
      { title: '促进共享利用', body: '在保障安全和权益的前提下，鼓励科学数据开放共享，支撑科研复现、交叉研究和公共服务。' },
      { title: '强调安全可控', body: '对涉及国家秘密、国家安全、商业秘密和个人隐私的数据，实行分类分级管理，明确开放条件和使用边界。' },
      { title: '加强能力建设', body: '在岗位设置、绩效收入、职称评定等方面建立激励机制，提升科学数据管理和服务能力。' },
    ],
    paragraphs: [
      {
        title: '为什么出台这项办法？',
        body: '科研活动正在产生大量观测、实验、调查、监测和计算模拟数据。如果缺少统一管理，数据容易出现重复采集、质量不一、难以复用和长期保存不足等问题。办法通过制度化要求，把科学数据从项目成果的一部分，提升为需要持续治理和共享利用的战略资源。',
      },
      {
        title: '对数据中心意味着什么？',
        body: '科学数据中心需要承担数据接收、整理、编目、保存、开放服务和安全管理等工作。对地理空间类数据而言，这意味着不仅要保存文件本身，还要维护元数据、空间参考、质量说明、访问权限和使用记录，保证数据找得到、看得懂、用得上、可追溯。',
      },
      {
        title: '对科研用户有什么影响？',
        body: '科研人员在使用财政资金形成科学数据时，需要更加重视数据整理、汇交和共享。规范的数据管理有助于成果复现、跨团队合作和长期序列积累，也能提高数据被引用、复用和转化的机会。',
      },
    ],
  },
  {
    ...POLICY_ARTICLES[1],
    imageUrl: '/policyfile/p2/overview.png',
    pdfUrl: p2Pdf,
    sourceUrl: 'https://openstd.samr.gov.cn/bzgk/std/newGbInfo?hcno=E8811DAD9A60924E0290AF98C3220744',
    sourceLabel: 'GB/T 40767-2021《地理空间数据交换基本要求》',
    overview: '该国家标准面向地理空间数据交换活动，规定交换参与方、交换流程、交换数据内容、交换方式、交换系统、交换周期和安全要求。它的核心目标是让不同机构、平台和系统之间的数据交换更加规范、完整、安全和可追溯。',
    facts: [
      { label: '标准号', value: 'GB/T 40767-2021' },
      { label: '发布日期', value: '2021-10-11' },
      { label: '实施日期', value: '2021-10-11' },
      { label: '主管部门', value: '自然资源部（测绘地理）' },
    ],
    highlights: [
      { title: '明确交换角色', body: '围绕管理者、提供者和使用者划分职责，避免交换过程中权责不清。' },
      { title: '规范交换流程', body: '强调目录发布、申请使用、授权、数据交付等环节，形成可管理的交换链路。' },
      { title: '统一交换数据', body: '要求数据包包含地理空间数据、描述文件和必要安全信息，便于识别、使用和追溯。' },
      { title: '强调系统能力', body: '交换系统应具备目录管理、申请处理、授权、传输和记录等能力。' },
      { title: '保障交换安全', body: '对身份信息、数据审核、交换记录和安全控制提出要求，降低数据流通过程风险。' },
    ],
    paragraphs: [
      {
        title: '标准解决什么问题？',
        body: '地理空间数据往往来源多、格式多、坐标基准和质量说明各不相同。如果交换规则不统一，数据在跨部门、跨平台使用时容易出现理解偏差、交付不完整或责任不清。该标准通过统一基本要求，为数据交换建立共同语言。',
      },
      {
        title: '对平台建设有什么作用？',
        body: '数据交换平台需要把目录发布、使用申请、授权审批、数据传输和日志记录串联起来。按照该标准建设，可以让数据交换从临时文件传递转向可审核、可追踪、可持续的业务流程。',
      },
      {
        title: '对数据服务的价值',
        body: '标准强调数据包、描述文件和安全信息，有助于保证数据不仅能传过去，还能被正确理解和使用。对科学数据中心而言，这类要求可以提升数据共享服务的规范性和可信度。',
      },
    ],
  },
  {
    ...POLICY_ARTICLES[2],
    imageUrl: '/policyfile/p3/overview.png',
    pdfUrl: p3Pdf,
    sourceLabel: '江苏省科学数据管理与共享相关文件',
    overview: '该实施细则面向省级科学数据治理场景，承接国家科学数据管理制度要求，强调数据汇交、保存、共享利用、安全保护和服务能力建设。它更关注政策在地方科研管理、数据中心建设和数据开放服务中的落地方式。',
    facts: [
      { label: '政策层级', value: '省级政策' },
      { label: '适用方向', value: '科学数据管理与共享' },
      { label: '重点对象', value: '科研项目、法人单位、科学数据平台' },
      { label: '关键词', value: '汇交、共享、保存、安全、服务' },
    ],
    highlights: [
      { title: '承接国家要求', body: '围绕国家科学数据管理制度，细化省内数据管理和共享工作的实施路径。' },
      { title: '强化项目汇交', body: '推动科研项目形成的数据按要求整理、汇交和保存，提升数据资源沉淀能力。' },
      { title: '服务开放共享', body: '鼓励在安全合规前提下开展数据共享服务，提高科研数据复用效率。' },
      { title: '注重安全保护', body: '强调数据安全、隐私保护和访问控制，处理开放共享与风险防控的关系。' },
      { title: '支撑平台建设', body: '对数据平台、数据中心和服务机制建设提出支撑要求，推动长期运行。' },
    ],
    paragraphs: [
      {
        title: '地方细则为什么重要？',
        body: '国家层面的制度确定了科学数据治理的总体方向，地方实施细则则负责把要求落到具体管理场景中。它能够明确省内科研项目、管理部门和数据平台之间的协同方式，让科学数据管理从原则走向可执行流程。',
      },
      {
        title: '对省级数据中心的意义',
        body: '省级数据中心通常承担区域科研数据汇聚、服务和开放共享职责。细则有助于明确数据接收、质量整理、目录发布、权限管理和长期保存等工作边界，提升平台服务能力。',
      },
      {
        title: '对科研单位的影响',
        body: '科研单位需要在项目实施过程中同步考虑数据管理计划、数据整理、汇交和共享条件。规范化管理可以减少项目结束后数据难以归档、难以复用的问题，也有助于形成可持续的数据资源。',
      },
    ],
  },
  {
    ...POLICY_ARTICLES[3],
    imageUrl: '/policyfile/p4/overview.png',
    pdfUrl: p4Pdf,
    sourceLabel: '自然资源部关于发布《国土空间规划城市时空大数据应用基本规定》行业标准的公告',
    overview: '《国土空间规划城市时空大数据应用基本规定》是自然资源部发布的行业标准，面向城市国土空间规划中的时空大数据应用。文件强调把多源、多尺度、动态更新的数据转化为规划分析和决策支撑能力，服务城市体检、规划编制、实施监督和精细化治理。',
    facts: [
      { label: '发布机构', value: '自然资源部' },
      { label: '标准编号', value: 'TD/T 1073-2023' },
      { label: '发布日期', value: '2023-03-05' },
      { label: '关键词', value: '国土空间规划、城市时空大数据、应用标准' },
    ],
    highlights: [
      { title: '面向规划应用', body: '聚焦国土空间规划业务，把时空大数据用于现状评估、趋势判断、方案比选和实施监督。' },
      { title: '强调多源融合', body: '鼓励整合遥感、测绘、位置、交通、人口、设施和公共服务等数据，形成综合分析基础。' },
      { title: '规范数据处理', body: '关注数据采集、清洗、转换、关联和质量控制，减少不同来源数据之间的偏差。' },
      { title: '支撑动态监测', body: '通过时序数据和空间分析能力，帮助识别城市运行变化、空间结构演化和资源利用问题。' },
      { title: '服务成果表达', body: '要求应用成果能够清晰表达空间位置、时间变化和指标含义，便于规划管理人员理解和使用。' },
    ],
    paragraphs: [
      {
        title: '这项标准关注什么？',
        body: '城市规划正在从静态蓝图走向动态治理。人口流动、交通出行、设施服务、建设活动和生态环境变化都会留下时空数据。该标准关注如何把这些数据规范接入规划业务，让城市空间分析更及时、更细致，也更便于比较和复核。',
      },
      {
        title: '对数据平台的要求',
        body: '平台需要具备多源数据汇聚、空间匹配、时间序列管理、指标计算和可视化表达能力。尤其是城市时空大数据来源复杂，必须重视数据质量、更新频率、空间精度和隐私安全，避免分析结果失真或误用。',
      },
      {
        title: '对规划决策的价值',
        body: '标准化的数据应用可以支撑城市体检评估、用地结构优化、公共服务配置、交通与生态格局分析等工作。它让规划不只依赖单次调查和经验判断，而是能够持续吸收动态数据，形成更有依据的决策支持。',
      },
    ],
  },
]
