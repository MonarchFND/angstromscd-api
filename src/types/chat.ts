import { z } from 'zod'
import type { Citation } from './medical.js'

// Core Chat Types
export const ThreadSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  status: z.enum(['active', 'archived', 'deleted']).default('active'),
  metadata: z.record(z.unknown()).optional(), // Flexible metadata storage
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  last_message_at: z.string().datetime().optional(),
})

export const MessageSchema = z.object({
  id: z.string().uuid(),
  thread_id: z.string().uuid(),
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
  content_type: z.enum(['text', 'markdown', 'code', 'json']).default('text'),
  metadata: z.object({
    model_used: z.string().optional(),
    tokens_used: z.number().optional(),
    processing_time_ms: z.number().optional(),
    confidence_score: z.number().min(0).max(1).optional(),
    citations: z.array(z.string().uuid()).optional(), // Citation IDs
    tools_used: z.array(z.string()).optional(),
    error_details: z.string().optional(),
  }).optional(),
  parent_message_id: z.string().uuid().optional(), // For conversation threading
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export const MessageCitationSchema = z.object({
  id: z.string().uuid(),
  message_id: z.string().uuid(),
  citation_id: z.string().uuid(),
  relevance_score: z.number().min(0).max(1).optional(),
  context_snippet: z.string().optional(), // Relevant excerpt from the citation
  position_in_content: z.number().optional(), // Character position in message content
  created_at: z.string().datetime(),
})

// Chat Session Management
export const ChatSessionSchema = z.object({
  id: z.string().uuid(),
  thread_id: z.string().uuid(),
  user_id: z.string().uuid(),
  session_type: z.enum(['medical_analysis', 'literature_search', 'general_chat', 'code_execution']),
  context: z.object({
    patient_id: z.string().uuid().optional(),
    medical_context: z.record(z.unknown()).optional(),
    active_tools: z.array(z.string()).optional(),
    session_variables: z.record(z.unknown()).optional(),
  }).optional(),
  status: z.enum(['active', 'paused', 'completed', 'error']).default('active'),
  started_at: z.string().datetime(),
  ended_at: z.string().datetime().optional(),
  last_activity_at: z.string().datetime(),
})

// Message Processing and Analysis
export const MessageAnalysisSchema = z.object({
  message_id: z.string().uuid(),
  intent: z.enum([
    'medical_query',
    'data_analysis_request',
    'literature_search',
    'code_execution',
    'general_question',
    'follow_up',
    'clarification'
  ]),
  entities: z.array(z.object({
    type: z.enum(['patient', 'medication', 'condition', 'lab_value', 'date', 'location']),
    value: z.string(),
    confidence: z.number().min(0).max(1),
    start_position: z.number(),
    end_position: z.number(),
  })),
  sentiment: z.enum(['positive', 'neutral', 'negative', 'urgent']).optional(),
  complexity_score: z.number().min(0).max(1), // 0 = simple, 1 = complex
  requires_tools: z.array(z.string()).optional(),
  medical_urgency: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  analyzed_at: z.string().datetime(),
})

// Tool Execution Results
export const ToolExecutionSchema = z.object({
  id: z.string().uuid(),
  message_id: z.string().uuid(),
  tool_name: z.string(),
  tool_version: z.string().optional(),
  input_parameters: z.record(z.unknown()),
  output_data: z.record(z.unknown()),
  execution_status: z.enum(['pending', 'running', 'completed', 'failed', 'timeout']),
  execution_time_ms: z.number().optional(),
  error_message: z.string().optional(),
  started_at: z.string().datetime(),
  completed_at: z.string().datetime().optional(),
})

// Conversation Context and Memory
export const ConversationContextSchema = z.object({
  thread_id: z.string().uuid(),
  context_window: z.array(z.string().uuid()), // Message IDs in current context
  summary: z.string().optional(), // AI-generated conversation summary
  key_topics: z.array(z.string()).optional(),
  mentioned_entities: z.array(z.object({
    type: z.string(),
    value: z.string(),
    first_mentioned_at: z.string().datetime(),
    last_mentioned_at: z.string().datetime(),
    mention_count: z.number(),
  })).optional(),
  active_patient_context: z.string().uuid().optional(), // Current patient being discussed
  last_updated: z.string().datetime(),
})

// Export TypeScript types
export type Thread = z.infer<typeof ThreadSchema>
export type Message = z.infer<typeof MessageSchema>
export type MessageCitation = z.infer<typeof MessageCitationSchema>
export type ChatSession = z.infer<typeof ChatSessionSchema>
export type MessageAnalysis = z.infer<typeof MessageAnalysisSchema>
export type ToolExecution = z.infer<typeof ToolExecutionSchema>
export type ConversationContext = z.infer<typeof ConversationContextSchema>

// Chat API Request/Response Types
export interface CreateThreadRequest {
  title: string
  description?: string
  initial_message?: string
  patient_id?: string
}

export interface CreateMessageRequest {
  thread_id: string
  content: string
  content_type?: 'text' | 'markdown' | 'code' | 'json'
  parent_message_id?: string
}

export interface ThreadListResponse {
  threads: Thread[]
  total_count: number
  page: number
  page_size: number
  has_more: boolean
}

export interface MessageListResponse {
  messages: Message[]
  total_count: number
  page: number
  page_size: number
  has_more: boolean
  context?: ConversationContext
}

export interface ChatCompletionRequest {
  thread_id: string
  message: string
  stream?: boolean
  tools?: string[]
  medical_context?: {
    patient_id?: string
    include_recent_data?: boolean
  }
}

export interface ChatCompletionResponse {
  message: Message
  citations?: Citation[]
  tool_executions?: ToolExecution[]
  analysis?: MessageAnalysis
  processing_metadata: {
    model_used: string
    tokens_used: number
    processing_time_ms: number
    tools_executed: string[]
  }
}

// Streaming response types
export interface ChatStreamChunk {
  type: 'content' | 'citation' | 'tool_start' | 'tool_result' | 'complete' | 'error'
  data: unknown
  timestamp: string
}

// Chat configuration and settings
export interface ChatSettings {
  model_preferences: {
    primary_model: string
    fallback_model?: string
    temperature: number
    max_tokens: number
  }
  tool_settings: {
    enabled_tools: string[]
    auto_execute_safe_tools: boolean
    require_confirmation_for: string[]
  }
  medical_settings: {
    include_patient_context: boolean
    auto_cite_medical_sources: boolean
    medical_urgency_detection: boolean
  }
  ui_preferences: {
    show_citations_inline: boolean
    show_tool_execution_details: boolean
    enable_markdown_rendering: boolean
  }
}

// Constants
export const MESSAGE_ROLES = ['user', 'assistant', 'system'] as const
export const CONTENT_TYPES = ['text', 'markdown', 'code', 'json'] as const
export const THREAD_STATUSES = ['active', 'archived', 'deleted'] as const
export const SESSION_TYPES = ['medical_analysis', 'literature_search', 'general_chat', 'code_execution'] as const
export const INTENT_TYPES = [
  'medical_query',
  'data_analysis_request', 
  'literature_search',
  'code_execution',
  'general_question',
  'follow_up',
  'clarification'
] as const
export const EXECUTION_STATUSES = ['pending', 'running', 'completed', 'failed', 'timeout'] as const 