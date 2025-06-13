import { z } from 'zod'
import type { Citation, MedicalContext } from './medical.js'
import type { ToolExecution } from './chat.js'

// BAML Service Types
export const BAMLPromptSchema = z.object({
  template_name: z.string(),
  variables: z.record(z.unknown()),
  model_config: z.object({
    model: z.string(),
    temperature: z.number().min(0).max(2).optional(),
    max_tokens: z.number().min(1).optional(),
    top_p: z.number().min(0).max(1).optional(),
    frequency_penalty: z.number().min(-2).max(2).optional(),
    presence_penalty: z.number().min(-2).max(2).optional(),
  }).optional(),
})

export const BAMLResponseSchema = z.object({
  id: z.string().uuid(),
  template_name: z.string(),
  model_used: z.string(),
  content: z.string(),
  metadata: z.object({
    tokens_used: z.number(),
    processing_time_ms: z.number(),
    confidence_score: z.number().min(0).max(1).optional(),
    reasoning_steps: z.array(z.string()).optional(),
    tool_calls: z.array(z.object({
      tool_name: z.string(),
      parameters: z.record(z.unknown()),
      result: z.unknown().optional(),
    })).optional(),
  }),
  created_at: z.string().datetime(),
})

export const BAMLMedicalAnalysisSchema = z.object({
  analysis_type: z.enum(['risk_assessment', 'treatment_recommendation', 'lab_interpretation', 'literature_synthesis']),
  patient_context: z.record(z.unknown()).optional(),
  findings: z.array(z.object({
    category: z.string(),
    finding: z.string(),
    confidence: z.number().min(0).max(1),
    evidence: z.array(z.string()).optional(),
  })),
  recommendations: z.array(z.object({
    action: z.string(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']),
    rationale: z.string(),
    contraindications: z.array(z.string()).optional(),
  })),
  citations_needed: z.array(z.string()).optional(),
  follow_up_questions: z.array(z.string()).optional(),
})

// E2B Code Execution Types
export const E2BExecutionRequestSchema = z.object({
  code: z.string(),
  language: z.enum(['python', 'javascript', 'r', 'sql']).default('python'),
  environment: z.object({
    packages: z.array(z.string()).optional(),
    environment_variables: z.record(z.string()).optional(),
    working_directory: z.string().optional(),
  }).optional(),
  timeout_seconds: z.number().min(1).max(300).default(60),
  memory_limit_mb: z.number().min(128).max(8192).default(1024),
})

export const E2BExecutionResultSchema = z.object({
  execution_id: z.string().uuid(),
  status: z.enum(['pending', 'running', 'completed', 'failed', 'timeout']),
  stdout: z.string().optional(),
  stderr: z.string().optional(),
  return_value: z.unknown().optional(),
  files_created: z.array(z.object({
    filename: z.string(),
    path: z.string(),
    size_bytes: z.number(),
    mime_type: z.string().optional(),
  })).optional(),
  execution_time_ms: z.number().optional(),
  memory_used_mb: z.number().optional(),
  error_details: z.object({
    error_type: z.string(),
    error_message: z.string(),
    line_number: z.number().optional(),
    stack_trace: z.string().optional(),
  }).optional(),
  started_at: z.string().datetime(),
  completed_at: z.string().datetime().optional(),
})

export const E2BMedicalAnalysisToolSchema = z.object({
  tool_name: z.string(),
  description: z.string(),
  parameters: z.object({
    patient_data: z.record(z.unknown()).optional(),
    analysis_type: z.string(),
    output_format: z.enum(['json', 'plot', 'table', 'report']).default('json'),
  }),
  code_template: z.string(),
  required_packages: z.array(z.string()),
  expected_outputs: z.array(z.string()),
})

// Vector Service Types
export const VectorSearchRequestSchema = z.object({
  query: z.string(),
  collection_name: z.string(),
  filters: z.record(z.unknown()).optional(),
  limit: z.number().min(1).max(100).default(10),
  similarity_threshold: z.number().min(0).max(1).default(0.7),
  include_metadata: z.boolean().default(true),
  include_embeddings: z.boolean().default(false),
})

export const VectorSearchResultSchema = z.object({
  id: z.string(),
  content: z.string(),
  metadata: z.record(z.unknown()).optional(),
  similarity_score: z.number().min(0).max(1),
  embedding: z.array(z.number()).optional(),
})

export const VectorSearchResponseSchema = z.object({
  query: z.string(),
  collection_name: z.string(),
  results: z.array(VectorSearchResultSchema),
  total_results: z.number(),
  search_time_ms: z.number(),
  filters_applied: z.record(z.unknown()).optional(),
})

export const VectorDocumentSchema = z.object({
  id: z.string().uuid(),
  content: z.string(),
  metadata: z.object({
    title: z.string().optional(),
    author: z.string().optional(),
    source: z.string().optional(),
    document_type: z.enum(['research_paper', 'clinical_guideline', 'patient_note', 'lab_report', 'medication_info']).optional(),
    publication_date: z.string().datetime().optional(),
    keywords: z.array(z.string()).optional(),
    medical_specialty: z.string().optional(),
  }).optional(),
  embedding: z.array(z.number()).optional(),
  collection_name: z.string(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

// Service Integration Orchestration Types
export const ServiceRequestSchema = z.object({
  request_id: z.string().uuid(),
  service_name: z.enum(['baml', 'vector', 'e2b']),
  operation: z.string(),
  parameters: z.record(z.unknown()),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  timeout_seconds: z.number().min(1).max(300).default(30),
  retry_config: z.object({
    max_retries: z.number().min(0).max(5).default(3),
    retry_delay_ms: z.number().min(100).max(10000).default(1000),
    exponential_backoff: z.boolean().default(true),
  }).optional(),
})

export const ServiceResponseSchema = z.object({
  request_id: z.string().uuid(),
  service_name: z.string(),
  operation: z.string(),
  status: z.enum(['success', 'error', 'timeout', 'retry']),
  data: z.unknown().optional(),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.unknown()).optional(),
  }).optional(),
  metadata: z.object({
    processing_time_ms: z.number(),
    retry_count: z.number().default(0),
    service_version: z.string().optional(),
  }),
  timestamp: z.string().datetime(),
})

// Multi-Service Workflow Types
export const WorkflowStepSchema = z.object({
  step_id: z.string(),
  service_name: z.enum(['baml', 'vector', 'e2b']),
  operation: z.string(),
  parameters: z.record(z.unknown()),
  depends_on: z.array(z.string()).optional(), // Step IDs this step depends on
  condition: z.string().optional(), // Conditional execution logic
  timeout_seconds: z.number().default(30),
})

export const WorkflowSchema = z.object({
  workflow_id: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  steps: z.array(WorkflowStepSchema),
  context: z.record(z.unknown()).optional(),
  status: z.enum(['pending', 'running', 'completed', 'failed', 'cancelled']),
  created_at: z.string().datetime(),
  started_at: z.string().datetime().optional(),
  completed_at: z.string().datetime().optional(),
})

export const WorkflowExecutionSchema = z.object({
  execution_id: z.string().uuid(),
  workflow_id: z.string().uuid(),
  step_results: z.array(z.object({
    step_id: z.string(),
    status: z.enum(['pending', 'running', 'completed', 'failed', 'skipped']),
    result: z.unknown().optional(),
    error: z.string().optional(),
    started_at: z.string().datetime().optional(),
    completed_at: z.string().datetime().optional(),
  })),
  overall_status: z.enum(['pending', 'running', 'completed', 'failed', 'cancelled']),
  context: z.record(z.unknown()).optional(),
  started_at: z.string().datetime(),
  completed_at: z.string().datetime().optional(),
})

// Export TypeScript types
export type BAMLPrompt = z.infer<typeof BAMLPromptSchema>
export type BAMLResponse = z.infer<typeof BAMLResponseSchema>
export type BAMLMedicalAnalysis = z.infer<typeof BAMLMedicalAnalysisSchema>
export type E2BExecutionRequest = z.infer<typeof E2BExecutionRequestSchema>
export type E2BExecutionResult = z.infer<typeof E2BExecutionResultSchema>
export type E2BMedicalAnalysisTool = z.infer<typeof E2BMedicalAnalysisToolSchema>
export type VectorSearchRequest = z.infer<typeof VectorSearchRequestSchema>
export type VectorSearchResult = z.infer<typeof VectorSearchResultSchema>
export type VectorSearchResponse = z.infer<typeof VectorSearchResponseSchema>
export type VectorDocument = z.infer<typeof VectorDocumentSchema>
export type ServiceRequest = z.infer<typeof ServiceRequestSchema>
export type ServiceResponse = z.infer<typeof ServiceResponseSchema>
export type WorkflowStep = z.infer<typeof WorkflowStepSchema>
export type Workflow = z.infer<typeof WorkflowSchema>
export type WorkflowExecution = z.infer<typeof WorkflowExecutionSchema>

// Service Integration Interfaces
export interface BAMLServiceClient {
  generateResponse(prompt: BAMLPrompt): Promise<BAMLResponse>
  analyzeMedicalData(context: MedicalContext, analysisType: string): Promise<BAMLMedicalAnalysis>
  generateLiteratureQuery(query: string, context?: MedicalContext): Promise<string>
  synthesizeFindings(citations: Citation[], context?: MedicalContext): Promise<string>
}

export interface E2BServiceClient {
  executeCode(request: E2BExecutionRequest): Promise<E2BExecutionResult>
  executeMedicalAnalysis(tool: E2BMedicalAnalysisTool, data: unknown): Promise<E2BExecutionResult>
  createSession(): Promise<string>
  destroySession(sessionId: string): Promise<void>
  uploadFile(sessionId: string, filename: string, content: Buffer): Promise<string>
  downloadFile(sessionId: string, filepath: string): Promise<Buffer>
}

export interface VectorServiceClient {
  search(request: VectorSearchRequest): Promise<VectorSearchResponse>
  addDocument(document: VectorDocument): Promise<string>
  updateDocument(id: string, document: Partial<VectorDocument>): Promise<void>
  deleteDocument(id: string): Promise<void>
  createCollection(name: string, metadata?: Record<string, unknown>): Promise<void>
  listCollections(): Promise<string[]>
}

export interface ServiceOrchestrator {
  executeWorkflow(workflow: Workflow): Promise<WorkflowExecution>
  executeStep(step: WorkflowStep, context?: Record<string, unknown>): Promise<ServiceResponse>
  getServiceClient(serviceName: 'baml' | 'vector' | 'e2b'): BAMLServiceClient | VectorServiceClient | E2BServiceClient
}

// Medical Research Assistant Demo Types
export interface DemoSession {
  session_id: string
  baml_client: BAMLServiceClient
  e2b_session_id: string
  vector_client: VectorServiceClient
  medical_context?: MedicalContext
  active_tools: string[]
  conversation_history: Array<{
    role: 'user' | 'assistant'
    content: string
    timestamp: string
    tool_executions?: ToolExecution[]
  }>
}

export interface DemoAnalysisResult {
  analysis_type: string
  code_executed: string
  results: {
    statistical_summary?: Record<string, unknown>
    visualizations?: Array<{
      type: string
      filename: string
      description: string
    }>
    insights?: string[]
    recommendations?: string[]
  }
  citations?: Citation[]
  execution_time_ms: number
  confidence_score: number
}

// Constants
export const BAML_ANALYSIS_TYPES = ['risk_assessment', 'treatment_recommendation', 'lab_interpretation', 'literature_synthesis'] as const
export const E2B_LANGUAGES = ['python', 'javascript', 'r', 'sql'] as const
export const E2B_OUTPUT_FORMATS = ['json', 'plot', 'table', 'report'] as const
export const VECTOR_DOCUMENT_TYPES = ['research_paper', 'clinical_guideline', 'patient_note', 'lab_report', 'medication_info'] as const
export const SERVICE_NAMES = ['baml', 'vector', 'e2b'] as const
export const WORKFLOW_STATUSES = ['pending', 'running', 'completed', 'failed', 'cancelled'] as const
export const EXECUTION_STATUSES = ['pending', 'running', 'completed', 'failed', 'skipped'] as const 