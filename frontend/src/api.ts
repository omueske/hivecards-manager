import { OpenAPI } from './api-client/core/OpenAPI'
import { DefaultService } from './api-client/services/DefaultService'
import { getToken } from './auth/token'

OpenAPI.BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:3000'
OpenAPI.TOKEN = () => getToken() || undefined
OpenAPI.WITH_CREDENTIALS = true

export { DefaultService }
