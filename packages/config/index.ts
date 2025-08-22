// Shared Configuration Package
// Contains shared configuration for the monorepo

export const DATABASE_CONFIG = {
  // PostgreSQL configuration for Railway
  provider: 'postgresql',
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5432'),
  database: process.env.PGDATABASE || 'fixia',
  username: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || '',
};

export const API_CONFIG = {
  baseUrl: process.env.API_BASE_URL || 'http://localhost:3001',
  version: 'v1',
};

export const WEB_CONFIG = {
  port: parseInt(process.env.PORT || '3000'),
  env: process.env.NODE_ENV || 'development',
};