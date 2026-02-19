import { OpenAPI } from './api-client/core/OpenAPI'
import { DefaultService } from './api-client/services/DefaultService'

OpenAPI.BASE = process.env.VITE_API_BASE || 'http://localhost:3000'
OpenAPI.TOKEN = () => localStorage.getItem('hc_token') || undefined

export { DefaultService }
