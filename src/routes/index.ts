import { Hono } from 'hono'
import { checkDatabaseConnection } from '../lib/db.js'
import { codeExecutor } from '../services/code-executor.js'
import type { 
  HealthCheckResponse, 
  ServiceDiscoveryResponse,
  ApiResponse 
} from '../types/index.js'

const routes = new Hono()

// Health check endpoint
routes.get('/health', async (c) => {
  const startTime = Date.now()
  
  try {
    // Check database connection
    const dbHealth = await checkDatabaseConnection()
    
    // Check E2B service
    const e2bHealth = await codeExecutor.healthCheck()
    
    // TODO: Add BAML and Vector service health checks when implemented
    const bamlHealth = { status: 'disconnected' as const, message: 'Not implemented yet' }
    const vectorHealth = { status: 'disconnected' as const, message: 'Not implemented yet' }
    
    const uptime = process.uptime()
    
    const overallStatus = 
      dbHealth.connected && e2bHealth.status === 'connected' 
        ? 'healthy' 
        : dbHealth.connected || e2bHealth.status === 'connected'
        ? 'degraded'
        : 'unhealthy'
    
    const response: HealthCheckResponse = {
      status: overallStatus,
      version: '1.0.0', // TODO: Get from package.json
      timestamp: new Date().toISOString(),
      services: {
        database: dbHealth.connected ? 'connected' : 'error',
        baml_service: bamlHealth.status,
        vector_service: vectorHealth.status,
        e2b_service: e2bHealth.status,
      },
      uptime_seconds: Math.floor(uptime),
    }
    
    const statusCode = overallStatus === 'healthy' ? 200 : 503
    return c.json(response, statusCode)
    
  } catch (error) {
    const response: HealthCheckResponse = {
      status: 'unhealthy',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      services: {
        database: 'error',
        baml_service: 'error',
        vector_service: 'error',
        e2b_service: 'error',
      },
      uptime_seconds: Math.floor(process.uptime()),
    }
    
    return c.json(response, 503)
  }
})

// Service discovery endpoint
routes.get('/discovery', async (c) => {
  const response: ServiceDiscoveryResponse = {
    service_name: 'angstromscd-api',
    version: '1.0.0',
    endpoints: [
      {
        path: '/health',
        method: 'GET',
        description: 'Health check endpoint',
      },
      {
        path: '/discovery',
        method: 'GET',
        description: 'Service discovery endpoint',
      },
      {
        path: '/api/threads',
        method: 'GET',
        description: 'List conversation threads',
        parameters: { page: 'number', page_size: 'number' },
      },
      {
        path: '/api/threads',
        method: 'POST',
        description: 'Create a new conversation thread',
        parameters: { title: 'string', description: 'string' },
      },
      {
        path: '/api/threads/:id',
        method: 'GET',
        description: 'Get a specific thread',
      },
      {
        path: '/api/threads/:id/messages',
        method: 'GET',
        description: 'Get messages in a thread',
        parameters: { page: 'number', page_size: 'number' },
      },
      {
        path: '/api/threads/:id/messages',
        method: 'POST',
        description: 'Create a new message in a thread',
        parameters: { content: 'string', role: 'string' },
      },
      {
        path: '/api/integrations/baml',
        method: 'POST',
        description: 'Execute BAML prompt',
      },
      {
        path: '/api/integrations/vector/search',
        method: 'POST',
        description: 'Vector similarity search',
      },
      {
        path: '/api/integrations/e2b/execute',
        method: 'POST',
        description: 'Execute code in E2B environment',
      },
    ],
    dependencies: ['supabase', 'baml-service', 'vector-service', 'e2b'],
    health_check_url: '/health',
  }
  
  return c.json(response)
})

// API routes
const api = new Hono()

// Thread routes
api.get('/threads', async (c) => {
  try {
    // TODO: Implement thread listing with pagination
    const response: ApiResponse = {
      success: true,
      data: {
        threads: [],
        total_count: 0,
        page: 1,
        page_size: 20,
        has_more: false,
      },
      metadata: {
        timestamp: new Date().toISOString(),
        request_id: crypto.randomUUID(),
        processing_time_ms: 0,
      },
    }
    
    return c.json(response)
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      metadata: {
        timestamp: new Date().toISOString(),
        request_id: crypto.randomUUID(),
        processing_time_ms: 0,
      },
    }
    
    return c.json(response, 500)
  }
})

api.post('/threads', async (c) => {
  try {
    const body = await c.req.json()
    
    // TODO: Validate request body and create thread
    const response: ApiResponse = {
      success: true,
      data: {
        id: crypto.randomUUID(),
        title: body.title || 'New Thread',
        description: body.description,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      metadata: {
        timestamp: new Date().toISOString(),
        request_id: crypto.randomUUID(),
        processing_time_ms: 0,
      },
    }
    
    return c.json(response, 201)
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: error instanceof Error ? error.message : 'Invalid request',
      },
      metadata: {
        timestamp: new Date().toISOString(),
        request_id: crypto.randomUUID(),
        processing_time_ms: 0,
      },
    }
    
    return c.json(response, 400)
  }
})

api.get('/threads/:id', async (c) => {
  try {
    const threadId = c.req.param('id')
    
    // TODO: Fetch thread from database
    const response: ApiResponse = {
      success: true,
      data: {
        id: threadId,
        title: 'Sample Thread',
        description: 'A sample thread',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      metadata: {
        timestamp: new Date().toISOString(),
        request_id: crypto.randomUUID(),
        processing_time_ms: 0,
      },
    }
    
    return c.json(response)
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'RESOURCE_NOT_FOUND',
        message: 'Thread not found',
      },
      metadata: {
        timestamp: new Date().toISOString(),
        request_id: crypto.randomUUID(),
        processing_time_ms: 0,
      },
    }
    
    return c.json(response, 404)
  }
})

// Message routes
api.get('/threads/:id/messages', async (c) => {
  try {
    const threadId = c.req.param('id')
    
    // TODO: Fetch messages from database
    const response: ApiResponse = {
      success: true,
      data: {
        messages: [],
        total_count: 0,
        page: 1,
        page_size: 20,
        has_more: false,
      },
      metadata: {
        timestamp: new Date().toISOString(),
        request_id: crypto.randomUUID(),
        processing_time_ms: 0,
      },
    }
    
    return c.json(response)
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      metadata: {
        timestamp: new Date().toISOString(),
        request_id: crypto.randomUUID(),
        processing_time_ms: 0,
      },
    }
    
    return c.json(response, 500)
  }
})

api.post('/threads/:id/messages', async (c) => {
  try {
    const threadId = c.req.param('id')
    const body = await c.req.json()
    
    // TODO: Validate and create message
    const response: ApiResponse = {
      success: true,
      data: {
        id: crypto.randomUUID(),
        thread_id: threadId,
        role: body.role || 'user',
        content: body.content,
        content_type: 'text',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      metadata: {
        timestamp: new Date().toISOString(),
        request_id: crypto.randomUUID(),
        processing_time_ms: 0,
      },
    }
    
    return c.json(response, 201)
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: error instanceof Error ? error.message : 'Invalid request',
      },
      metadata: {
        timestamp: new Date().toISOString(),
        request_id: crypto.randomUUID(),
        processing_time_ms: 0,
      },
    }
    
    return c.json(response, 400)
  }
})

// Integration routes
const integrations = new Hono()

// BAML integration
integrations.post('/baml', async (c) => {
  try {
    const body = await c.req.json()
    
    // TODO: Implement BAML service call
    const response: ApiResponse = {
      success: true,
      data: {
        id: crypto.randomUUID(),
        template_name: body.template_name || 'default',
        content: 'Mock BAML response',
        model_used: 'gpt-4',
        metadata: {
          tokens_used: 100,
          processing_time_ms: 500,
        },
        created_at: new Date().toISOString(),
      },
      metadata: {
        timestamp: new Date().toISOString(),
        request_id: crypto.randomUUID(),
        processing_time_ms: 500,
      },
    }
    
    return c.json(response)
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'BAML_SERVICE_ERROR',
        message: error instanceof Error ? error.message : 'BAML service error',
      },
      metadata: {
        timestamp: new Date().toISOString(),
        request_id: crypto.randomUUID(),
        processing_time_ms: 0,
      },
    }
    
    return c.json(response, 500)
  }
})

// Vector search integration
integrations.post('/vector/search', async (c) => {
  try {
    const body = await c.req.json()
    
    // TODO: Implement vector service call
    const response: ApiResponse = {
      success: true,
      data: {
        query: body.query,
        collection_name: body.collection_name || 'default',
        results: [],
        total_results: 0,
        search_time_ms: 50,
      },
      metadata: {
        timestamp: new Date().toISOString(),
        request_id: crypto.randomUUID(),
        processing_time_ms: 50,
      },
    }
    
    return c.json(response)
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'VECTOR_SERVICE_ERROR',
        message: error instanceof Error ? error.message : 'Vector service error',
      },
      metadata: {
        timestamp: new Date().toISOString(),
        request_id: crypto.randomUUID(),
        processing_time_ms: 0,
      },
    }
    
    return c.json(response, 500)
  }
})

// E2B code execution integration
integrations.post('/e2b/execute', async (c) => {
  try {
    const body = await c.req.json()
    
    const result = await codeExecutor.executeCode(body)
    
    const response: ApiResponse = {
      success: true,
      data: result,
      metadata: {
        timestamp: new Date().toISOString(),
        request_id: crypto.randomUUID(),
        processing_time_ms: result.execution_time_ms || 0,
      },
    }
    
    return c.json(response)
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'E2B_SERVICE_ERROR',
        message: error instanceof Error ? error.message : 'E2B service error',
      },
      metadata: {
        timestamp: new Date().toISOString(),
        request_id: crypto.randomUUID(),
        processing_time_ms: 0,
      },
    }
    
    return c.json(response, 500)
  }
})

// Mount sub-routes
routes.route('/api', api)
routes.route('/api/integrations', integrations)

export default routes
