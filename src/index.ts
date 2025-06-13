import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serve } from '@hono/node-server'
import routes from './routes/index.js'

const app = new Hono()

// CORS middleware
app.use('/*', cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // Add your frontend URLs
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

// Request logging middleware
app.use('*', async (c, next) => {
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  console.log(`${c.req.method} ${c.req.url} - ${c.res.status} (${ms}ms)`)
})

// Root endpoint
app.get('/', (c) => {
  return c.json({ 
    message: 'AngstromSCD API',
    version: '1.0.0',
    documentation: '/discovery',
    health: '/health'
  })
})

// Mount all routes
app.route('/', routes)

// Global error handler
app.onError((err, c) => {
  console.error('Unhandled error:', err)
  
  return c.json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
    metadata: {
      timestamp: new Date().toISOString(),
      request_id: crypto.randomUUID(),
      processing_time_ms: 0,
    },
  }, 500)
})

// 404 handler
app.notFound((c) => {
  return c.json({
    success: false,
    error: {
      code: 'RESOURCE_NOT_FOUND',
      message: 'Endpoint not found',
    },
    metadata: {
      timestamp: new Date().toISOString(),
      request_id: crypto.randomUUID(),
      processing_time_ms: 0,
    },
  }, 404)
})

const port = Number(process.env.PORT) || 3001
console.log(`🚀 AngstromSCD API starting on port ${port}`)

serve({
  fetch: app.fetch,
  port,
})
