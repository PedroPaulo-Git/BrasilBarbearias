"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    PORT: process.env.PORT || 5000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3000/api',
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    REQUEST_TIMEOUT: parseInt(process.env.REQUEST_TIMEOUT || '30000'),
    RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    CACHE_TTL: parseInt(process.env.CACHE_TTL || '3600'),
    ENABLE_METRICS: process.env.ENABLE_METRICS === 'true',
    METRICS_PORT: parseInt(process.env.METRICS_PORT || '9090')
};
//# sourceMappingURL=database.js.map