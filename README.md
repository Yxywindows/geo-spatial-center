# 地理空间智能与人地系统科学数据分中心

独立运行的分中心网站，前端 React+Vite（:5174），后端 Express（:3002），数据库 PostgreSQL（Docker :5533）。

数据来源：`kxsj_live_resources.json`，199 条真实资源记录（数据集/论文/软件）。

## 快速启动

### 首次启动（重建数据库）

```bash
# 删除旧卷（如果存在）
docker volume rm 江苏省科学数据中心_geo_spatial_data 2>/dev/null; true

# 启动数据库 + 后端
docker compose up geo-spatial-postgres geo-spatial-backend -d
```

首次启动时 PostgreSQL 会自动执行 `backend/db/init/` 中的 SQL：
- `001_schema.sql` — 创建 `resources` 表和索引
- `002_seed.sql` — 导入 199 条资源记录

### 启动前端

```bash
cd geo-spatial-center/frontend
npm install
npm run dev
```

浏览器访问 http://localhost:5174

## 端口说明

| 服务 | 地址 |
|------|------|
| 前端开发服务器 | http://localhost:5174 |
| 后端 API | http://localhost:3002 |
| PostgreSQL | localhost:5533 |

## API 路由

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/resources | 资源列表（支持 q/subject/keyword/type/privacy/limit/offset/sort） |
| GET | /api/resources/stats | 统计（total/open_count/subject_count/dataset_count/paper_count/software_count） |
| GET | /api/resources/subjects | 学科方向列表 |
| GET | /api/resources/types | 资源类型列表 |
| GET | /api/resources/:sourceId | 资源详情 |

## 数据库

- 容器名：`geo-spatial-postgres`
- 数据库：`geo_spatial` / 用户：`geo_spatial` / 密码：`geo_dev`
- 主表：`resources`（38 个字段，含 JSONB 和 TEXT[] 数组类型）

## 数据库字段

`resources` 表核心字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| source_id | TEXT UNIQUE | 资源唯一 ID（URL 标识符） |
| name | TEXT | 资源名称 |
| name_en | TEXT | 英文名称 |
| description | TEXT | 摘要 |
| resource_type_name | TEXT | 类型（数据集/论文/软件） |
| subjects | TEXT[] | 学科方向（数组） |
| keywords | TEXT[] | 关键词（数组） |
| authors | JSONB | 作者列表 |
| organization_name | TEXT | 机构名称 |
| privacy_type | TEXT | 开放状态（open/condition） |
| storage_num | BIGINT | 存储大小（字节） |
| file_formats | JSONB | 文件格式列表 |
| approve_time | DATE | 发布日期 |

## 重新生成 Seed SQL

```bash
cd geo-spatial-center/backend
node scripts/generate_seed.js
```

## 与主中心的关系

主中心门户（:5173）中，地理空间分中心卡片的"进入站点"按钮已更新为在新标签页打开 `http://localhost:5174`。
