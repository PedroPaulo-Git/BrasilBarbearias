import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Configurações do Servidor
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Configurações da API Principal
  API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3000/api',
  
  // Configurações de Segurança
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  
  // Configurações de Log
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  
  // Configurações de Timeout
  REQUEST_TIMEOUT: parseInt(process.env.REQUEST_TIMEOUT || '30000'),
  
  // Configurações de Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  
  // Configurações de Cache
  CACHE_TTL: parseInt(process.env.CACHE_TTL || '3600'),
  
  // Configurações de Monitoramento
  ENABLE_METRICS: process.env.ENABLE_METRICS === 'true',
  METRICS_PORT: parseInt(process.env.METRICS_PORT || '9090')
}; 