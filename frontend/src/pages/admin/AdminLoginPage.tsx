import { useState } from 'react'
import { Alert, Button, Form, Input } from 'antd'
import { LockOutlined, SafetyOutlined, UserOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { adminLogin } from '../../store/adminAuth'

interface LoginForm {
  username: string
  password: string
}

const CAPABILITIES = ['资源审核', '发布管理', '数据治理', '科研服务']
const FLOW_STATS = [
  { num: 'GeoAI', label: '领域方向' },
  { num: '1000+', label: '汇聚资源' },
  { num: '24h', label: '审核响应' },
]

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleLogin(values: LoginForm) {
    setLoading(true)
    setError(null)
    setTimeout(() => {
      if (adminLogin(values.username, values.password)) {
        navigate('/admin/review', { replace: true })
      } else {
        setError('用户名或密码错误')
      }
      setLoading(false)
    }, 300)
  }

  return (
    <div className="admin-login">
      <div className="admin-login__inner">
        <section className="admin-login__brand" aria-label="分中心介绍">
          <div className="admin-login__logo-row">
            <div className="admin-login__mark">GS</div>
            <div>
              <div className="admin-login__brand-name">江苏省地理空间智能与人地系统数据中心</div>
            </div>
          </div>

          <h1 className="admin-login__headline">
            统一分中心管理入口，<br />
            支撑资源审核、发布与服务
          </h1>
          <p className="admin-login__desc">
            面向地理空间智能与人地系统领域的数据资源建设，提供分中心资源审核、发布流转与后台治理能力。
          </p>

          <div className="admin-login__pills">
            {CAPABILITIES.map((capability) => (
              <span key={capability} className="admin-login__pill">{capability}</span>
            ))}
          </div>

          <div className="admin-login__flow-card">
            <div className="admin-login__flow-path">
              <span>主中心</span>
              <span className="admin-login__flow-arrow">→</span>
              <span>地理空间分中心</span>
              <span className="admin-login__flow-arrow">→</span>
              <span>数据资源</span>
              <span className="admin-login__flow-arrow">→</span>
              <span>科研用户</span>
            </div>
            <div className="admin-login__flow-stats">
              {FLOW_STATS.map((stat) => (
                <div key={stat.label} className="admin-login__flow-stat">
                  <div className="admin-login__flow-num">{stat.num}</div>
                  <div className="admin-login__flow-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="admin-login__form-wrap" aria-label="管理员登录">
          <div className="admin-login__card">
            <div className="admin-login__card-header">
              <div className="admin-login__card-icon">
                <SafetyOutlined />
              </div>
              <div>
                <h2 className="admin-login__card-title">管理员登录</h2>
                <p className="admin-login__card-subtitle">登录分中心后台，处理数据资源审核与发布任务</p>
              </div>
            </div>

            {error && (
              <Alert type="error" message={error} showIcon className="admin-login__alert" />
            )}

            <Form
              layout="vertical"
              onFinish={handleLogin}
              requiredMark={false}
              size="large"
              className="admin-login__form"
            >
              <Form.Item
                name="username"
                label="用户名"
                rules={[{ required: true, message: '请输入用户名' }]}
              >
                <Input
                  prefix={<UserOutlined className="admin-login__input-icon" />}
                  placeholder="sc_admin"
                  autoComplete="username"
                />
              </Form.Item>
              <Form.Item
                name="password"
                label="密码"
                rules={[{ required: true, message: '请输入密码' }]}
              >
                <Input.Password
                  prefix={<LockOutlined className="admin-login__input-icon" />}
                  placeholder="请输入登录密码"
                  autoComplete="current-password"
                />
              </Form.Item>
              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  loading={loading}
                  className="admin-login__submit"
                >
                  登录后台
                </Button>
              </Form.Item>
            </Form>

            <p className="admin-login__hint">演示账号：sc_admin / sc123</p>
          </div>
        </section>
      </div>
    </div>
  )
}
