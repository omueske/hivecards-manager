import { OpenAPI } from './api-client/core/OpenAPI'
import { DefaultService } from './api-client/services/DefaultService'
import { getToken } from './auth/token'

// In dev: falls back to localhost:3000. In production: VITE_API_BASE='' (same origin via .env.production)
const _apiBase = (import.meta as any).env?.VITE_API_BASE;
OpenAPI.BASE = _apiBase !== undefined && _apiBase !== null ? _apiBase : 'http://localhost:3000'
OpenAPI.TOKEN = () => getToken() || undefined
OpenAPI.WITH_CREDENTIALS = true

export { DefaultService }
