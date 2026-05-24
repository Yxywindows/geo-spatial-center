import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: Number(process.env.PORT || 3002),
  // 本地开发：postgres 统一使用 5432（与 docker-compose 一致）
  databaseUrl: process.env.DATABASE_URL || 'postgres://geo_spatial:geo_dev@localhost:5432/geo_spatial',
  mainCenterApiKey: process.env.MAIN_CENTER_API_KEY || 'geo-spatial-internal-key-2026',
  mainCenterCallbackUrl: process.env.MAIN_CENTER_CALLBACK_URL || 'http://localhost:3001/api/internal/subcenter-callback',
};
