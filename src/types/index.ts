// Medical Types
export * from './medical.js'

// Chat Types  
export * from './chat.js'

// Integration Types
export * from './integrations.js'

// Database Types
export * from './database.js'

// Common utility types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
  metadata?: {
    timestamp: string
    request_id: string
    processing_time_ms: number
  }
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
  timestamp: string
  request_id?: string
}

export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy'
  version: string
  timestamp: string
  services: {
    database: 'connected' | 'disconnected' | 'error'
    baml_service: 'connected' | 'disconnected' | 'error'
    vector_service: 'connected' | 'disconnected' | 'error'
    e2b_service: 'connected' | 'disconnected' | 'error'
  }
  uptime_seconds: number
}

export interface ServiceDiscoveryResponse {
  service_name: string
  version: string
  endpoints: Array<{
    path: string
    method: string
    description: string
    parameters?: Record<string, unknown>
  }>
  dependencies: string[]
  health_check_url: string
}

// Environment configuration types
export interface EnvironmentConfig {
  NODE_ENV: 'development' | 'production' | 'test'
  PORT: number
  
  // Database
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
  SUPABASE_SERVICE_ROLE_KEY?: string
  DATABASE_URL?: string
  
  // Service URLs
  BAML_SERVICE_URL: string
  VECTOR_SERVICE_URL: string
  E2B_API_KEY?: string
  
  // API Keys
  OPENAI_API_KEY?: string
  ANTHROPIC_API_KEY?: string
  
  // Security
  JWT_SECRET?: string
  CORS_ORIGINS: string[]
  
  // Logging
  LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error'
  LOG_FORMAT: 'json' | 'text'
}

// Request/Response wrapper types
export interface RequestContext {
  user_id?: string
  organization_id?: string
  request_id: string
  timestamp: string
  ip_address?: string
  user_agent?: string
}

export interface PaginatedRequest {
  page?: number
  page_size?: number
  order_by?: string
  order_direction?: 'asc' | 'desc'
}

// Common validation schemas
export const UUIDSchema = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
export const EmailSchema = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const DateTimeSchema = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/

// HTTP Status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const

// Error codes
export const ERROR_CODES = {
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  
  // Authentication/Authorization errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  
  // Resource errors
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS: 'RESOURCE_ALREADY_EXISTS',
  RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',
  
  // Database errors
  DATABASE_ERROR: 'DATABASE_ERROR',
  DATABASE_CONNECTION_ERROR: 'DATABASE_CONNECTION_ERROR',
  CONSTRAINT_VIOLATION: 'CONSTRAINT_VIOLATION',
  
  // Service errors
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  SERVICE_TIMEOUT: 'SERVICE_TIMEOUT',
  SERVICE_ERROR: 'SERVICE_ERROR',
  
  // Medical/Clinical errors
  INVALID_MEDICAL_DATA: 'INVALID_MEDICAL_DATA',
  CLINICAL_VALIDATION_ERROR: 'CLINICAL_VALIDATION_ERROR',
  PATIENT_NOT_FOUND: 'PATIENT_NOT_FOUND',
  
  // Integration errors
  BAML_SERVICE_ERROR: 'BAML_SERVICE_ERROR',
  VECTOR_SERVICE_ERROR: 'VECTOR_SERVICE_ERROR',
  E2B_SERVICE_ERROR: 'E2B_SERVICE_ERROR',
  
  // General errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES]
export type HttpStatus = typeof HTTP_STATUS[keyof typeof HTTP_STATUS]
