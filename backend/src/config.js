import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: Number(process.env.PORT || 3002),
  databaseUrl: process.env.DATABASE_URL || 'postgres://geo_spatial:geo_dev@localhost:5533/geo_spatial',
};
