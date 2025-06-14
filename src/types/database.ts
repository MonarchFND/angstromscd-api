import { z } from 'zod'

// Supabase Database Schema Types
// These types should align with your actual Supabase database schema

// Users and Authentication
export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  full_name: z.string().optional(),
  avatar_url: z.string().url().optional(),
  role: z.enum(['patient', 'clinician', 'researcher', 'admin']).default('patient'),
  organization_id: z.string().uuid().optional(),
  preferences: z.object({
    theme: z.enum(['light', 'dark', 'system']).default('system'),
    notifications: z.object({
      email: z.boolean().default(true),
      push: z.boolean().default(true),
      sms: z.boolean().default(false),
    }).default({}),
    medical_settings: z.object({
      default_units: z.enum(['metric', 'imperial']).default('metric'),
      show_reference_ranges: z.boolean().default(true),
      auto_generate_insights: z.boolean().default(true),
    }).default({}),
  }).optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  last_login_at: z.string().datetime().optional(),
})

export const OrganizationSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  type: z.enum(['hospital', 'clinic', 'research_institution', 'pharmaceutical']),
  settings: z.object({
    data_retention_days: z.number().default(2555), // ~7 years
    require_2fa: z.boolean().default(false),
    allowed_domains: z.array(z.string()).optional(),
  }).optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

// Patient Data Tables
export const PatientsTableSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid().optional(), // If patient has user account
  medical_record_number: z.string().optional(),
  age: z.number().min(0).max(120),
  gender: z.enum(['male', 'female', 'other']),
  scd_genotype: z.enum(['HbSS', 'HbSC', 'HbS-beta-thal', 'HbS-beta+-thal', 'other']),
  diagnosis_date: z.string().datetime(),
  organization_id: z.string().uuid(),
  created_by: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export const LabResultsTableSchema = z.object({
  id: z.string().uuid(),
  patient_id: z.string().uuid(),
  test_date: z.string().datetime(),
  hemoglobin: z.number().min(0).max(20).optional(),
  hematocrit: z.number().min(0).max(100).optional(),
  hbf_level: z.number().min(0).max(100).optional(),
  reticulocyte_count: z.number().min(0).max(50).optional(),
  white_blood_cell_count: z.number().min(0).optional(),
  platelet_count: z.number().min(0).optional(),
  lactate_dehydrogenase: z.number().min(0).optional(),
  bilirubin_total: z.number().min(0).optional(),
  notes: z.string().optional(),
  created_by: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export const VoeEpisodesTableSchema = z.object({
  id: z.string().uuid(),
  patient_id: z.string().uuid(),
  episode_date: z.string().datetime(),
  severity: z.enum(['mild', 'moderate', 'severe']),
  location: z.array(z.enum(['chest', 'back', 'arms', 'legs', 'abdomen', 'other'])),
  duration_hours: z.number().min(0).optional(),
  hospitalization_required: z.boolean(),
  pain_score: z.number().min(0).max(10).optional(),
  treatment_given: z.array(z.string()).optional(),
  notes: z.string().optional(),
  created_by: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export const MedicationsTableSchema = z.object({
  id: z.string().uuid(),
  patient_id: z.string().uuid(),
  medication_name: z.string(),
  dosage: z.string(),
  frequency: z.string(),
  start_date: z.string().datetime(),
  end_date: z.string().datetime().optional(),
  indication: z.string().optional(),
  prescriber: z.string().optional(),
  active: z.boolean().default(true),
  created_by: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

// Chat and Conversation Tables
export const ThreadsTableSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  status: z.enum(['active', 'archived', 'deleted']).default('active'),
  metadata: z.record(z.unknown()).optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  last_message_at: z.string().datetime().optional(),
})

export const MessagesTableSchema = z.object({
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
    citations: z.array(z.string().uuid()).optional(),
    tools_used: z.array(z.string()).optional(),
    error_details: z.string().optional(),
  }).optional(),
  parent_message_id: z.string().uuid().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

// Medical Analysis and Insights Tables
export const ClinicalInsightsTableSchema = z.object({
  id: z.string().uuid(),
  patient_id: z.string().uuid(),
  insight_type: z.enum(['risk_assessment', 'treatment_recommendation', 'lab_trend', 'medication_review']),
  title: z.string(),
  description: z.string(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  actionable: z.boolean(),
  evidence: z.array(z.object({
    source: z.string(),
    data_point: z.string(),
    value: z.union([z.string(), z.number()]),
  })),
  generated_by: z.enum(['ai_analysis', 'clinical_rule', 'manual_review']),
  reviewed_by: z.string().uuid().optional(),
  reviewed_at: z.string().datetime().optional(),
  status: z.enum(['pending', 'reviewed', 'dismissed', 'acted_upon']).default('pending'),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export const RiskAssessmentsTableSchema = z.object({
  id: z.string().uuid(),
  patient_id: z.string().uuid(),
  assessment_date: z.string().datetime(),
  voe_risk_score: z.number().min(0).max(100),
  risk_factors: z.array(z.object({
    factor: z.string(),
    weight: z.number(),
    value: z.union([z.string(), z.number(), z.boolean()]),
  })),
  recommendations: z.array(z.string()),
  confidence_level: z.number().min(0).max(1),
  model_version: z.string().optional(),
  created_by: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

// Literature and Citations Tables
export const CitationsTableSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  authors: z.array(z.string()),
  journal: z.string(),
  publication_date: z.string().datetime(),
  doi: z.string().optional(),
  pmid: z.string().optional(),
  abstract: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  citation_count: z.number().min(0).optional(),
  indexed_at: z.string().datetime(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export const MessageCitationsTableSchema = z.object({
  id: z.string().uuid(),
  message_id: z.string().uuid(),
  citation_id: z.string().uuid(),
  relevance_score: z.number().min(0).max(1).optional(),
  context_snippet: z.string().optional(),
  position_in_content: z.number().optional(),
  created_at: z.string().datetime(),
})

// Tool Execution and Service Integration Tables
export const ToolExecutionsTableSchema = z.object({
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

export const ServiceRequestsTableSchema = z.object({
  id: z.string().uuid(),
  request_id: z.string().uuid(),
  service_name: z.enum(['baml', 'vector', 'e2b']),
  operation: z.string(),
  parameters: z.record(z.unknown()),
  response_data: z.record(z.unknown()).optional(),
  status: z.enum(['pending', 'completed', 'failed', 'timeout']),
  processing_time_ms: z.number().optional(),
  error_details: z.string().optional(),
  retry_count: z.number().default(0),
  created_at: z.string().datetime(),
  completed_at: z.string().datetime().optional(),
})

// Audit and Logging Tables
export const AuditLogsTableSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid().optional(),
  action: z.string(),
  resource_type: z.string(),
  resource_id: z.string().uuid().optional(),
  old_values: z.record(z.unknown()).optional(),
  new_values: z.record(z.unknown()).optional(),
  ip_address: z.string().optional(),
  user_agent: z.string().optional(),
  created_at: z.string().datetime(),
})

// Export TypeScript types
export type UserProfile = z.infer<typeof UserProfileSchema>
export type Organization = z.infer<typeof OrganizationSchema>
export type PatientsTable = z.infer<typeof PatientsTableSchema>
export type LabResultsTable = z.infer<typeof LabResultsTableSchema>
export type VoeEpisodesTable = z.infer<typeof VoeEpisodesTableSchema>
export type MedicationsTable = z.infer<typeof MedicationsTableSchema>
export type ThreadsTable = z.infer<typeof ThreadsTableSchema>
export type MessagesTable = z.infer<typeof MessagesTableSchema>
export type ClinicalInsightsTable = z.infer<typeof ClinicalInsightsTableSchema>
export type RiskAssessmentsTable = z.infer<typeof RiskAssessmentsTableSchema>
export type CitationsTable = z.infer<typeof CitationsTableSchema>
export type MessageCitationsTable = z.infer<typeof MessageCitationsTableSchema>
export type ToolExecutionsTable = z.infer<typeof ToolExecutionsTableSchema>
export type ServiceRequestsTable = z.infer<typeof ServiceRequestsTableSchema>
export type AuditLogsTable = z.infer<typeof AuditLogsTableSchema>

// Database Query Types
export interface DatabaseFilters {
  patient_id?: string
  user_id?: string
  organization_id?: string
  date_from?: string
  date_to?: string
  status?: string
  limit?: number
  offset?: number
  order_by?: string
  order_direction?: 'asc' | 'desc'
}

export interface PaginationParams {
  page: number
  page_size: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total_count: number
  page: number
  page_size: number
  has_more: boolean
}

// Database Operation Types
export interface CreatePatientRequest {
  medical_record_number?: string
  age: number
  gender: 'male' | 'female' | 'other'
  scd_genotype: 'HbSS' | 'HbSC' | 'HbS-beta-thal' | 'HbS-beta+-thal' | 'other'
  diagnosis_date: string
  organization_id: string
}

export interface UpdatePatientRequest {
  age?: number
  gender?: 'male' | 'female' | 'other'
  scd_genotype?: 'HbSS' | 'HbSC' | 'HbS-beta-thal' | 'HbS-beta+-thal' | 'other'
  diagnosis_date?: string
}

export interface CreateLabResultRequest {
  patient_id: string
  test_date: string
  hemoglobin?: number
  hematocrit?: number
  hbf_level?: number
  reticulocyte_count?: number
  white_blood_cell_count?: number
  platelet_count?: number
  lactate_dehydrogenase?: number
  bilirubin_total?: number
  notes?: string
}

export interface CreateVoeEpisodeRequest {
  patient_id: string
  episode_date: string
  severity: 'mild' | 'moderate' | 'severe'
  location: Array<'chest' | 'back' | 'arms' | 'legs' | 'abdomen' | 'other'>
  duration_hours?: number
  hospitalization_required: boolean
  pain_score?: number
  treatment_given?: string[]
  notes?: string
}

// Supabase-specific types
export interface SupabaseConfig {
  url: string
  anonKey: string
  serviceRoleKey?: string
}

export interface DatabaseConnection {
  supabase: any // Will be typed with actual Supabase client
  isConnected: boolean
  lastError?: string
}

// RLS (Row Level Security) Policy Types
export interface RLSPolicy {
  table_name: string
  policy_name: string
  command: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE'
  roles: string[]
  using_expression: string
  check_expression?: string
}

// Database Migration Types
export interface Migration {
  id: string
  name: string
  sql: string
  applied_at?: string
  checksum: string
}

export interface MigrationStatus {
  current_version: string
  pending_migrations: Migration[]
  applied_migrations: Migration[]
}

// Constants
export const USER_ROLES = ['patient', 'clinician', 'researcher', 'admin'] as const
export const ORGANIZATION_TYPES = ['hospital', 'clinic', 'research_institution', 'pharmaceutical'] as const
export const INSIGHT_STATUSES = ['pending', 'reviewed', 'dismissed', 'acted_upon'] as const
export const DB_EXECUTION_STATUSES = ['pending', 'running', 'completed', 'failed', 'timeout'] as const
export const DB_SERVICE_NAMES = ['baml', 'vector', 'e2b'] as const

// Table names for reference
export const TABLE_NAMES = {
  USER_PROFILES: 'user_profiles',
  ORGANIZATIONS: 'organizations',
  PATIENTS: 'patients',
  LAB_RESULTS: 'lab_results',
  VOE_EPISODES: 'voe_episodes',
  MEDICATIONS: 'medications',
  THREADS: 'threads',
  MESSAGES: 'messages',
  CLINICAL_INSIGHTS: 'clinical_insights',
  RISK_ASSESSMENTS: 'risk_assessments',
  CITATIONS: 'citations',
  MESSAGE_CITATIONS: 'message_citations',
  TOOL_EXECUTIONS: 'tool_executions',
  SERVICE_REQUESTS: 'service_requests',
  AUDIT_LOGS: 'audit_logs',
} as const 