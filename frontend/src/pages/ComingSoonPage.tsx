import { ToolOutlined } from '@ant-design/icons'

interface ComingSoonPageProps {
  title: string
}

export default function ComingSoonPage({ title }: ComingSoonPageProps) {
  return (
    <section className="gs-page gs-coming">
      <div className="gs-coming__panel">
        <ToolOutlined className="gs-coming__icon" />
        <h1>{title}</h1>
        <p>待开发</p>
      </div>
    </section>
  )
}
