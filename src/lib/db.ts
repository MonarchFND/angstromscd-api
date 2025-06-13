import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Environment variables
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing required Supabase environment variables')
}

// Create Supabase client for public operations
export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: false, // Server-side, don't persist sessions
    },
  }
)

// Create admin client for service operations (if service role key is available)
export const supabaseAdmin = SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null

// Database connection health check
export async function checkDatabaseConnection(): Promise<{
  connected: boolean
  error?: string
  latency_ms?: number
}> {
  try {
    const startTime = Date.now()
    
    // Simple query to test connection - using a basic table that should exist
    const { error } = await supabase
      .from('threads')
      .select('id')
      .limit(1)
    
    const latency_ms = Date.now() - startTime
    
    if (error) {
      return {
        connected: false,
        error: error.message,
        latency_ms,
      }
    }
    
    return {
      connected: true,
      latency_ms,
    }
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown database error',
    }
  }
}

// Database utility functions
export class DatabaseService {
  private client: SupabaseClient
  
  constructor(useAdmin = false) {
    if (useAdmin && supabaseAdmin) {
      this.client = supabaseAdmin
    } else {
      this.client = supabase
    }
  }
  
  // Generic query builder
  from(table: string) {
    return this.client.from(table)
  }
  
  // Batch operations
  async batchInsert(table: string, records: Record<string, unknown>[]) {
    const { data, error } = await this.client
      .from(table)
      .insert(records)
      .select()
    
    if (error) {
      throw new Error(`Batch insert failed: ${error.message}`)
    }
    
    return data
  }
  
  // Pagination helper
  async paginate(
    table: string,
    options: {
      page: number
      pageSize: number
      orderBy?: string
      orderDirection?: 'asc' | 'desc'
      filters?: Record<string, unknown>
    }
  ) {
    const { page, pageSize, orderBy, orderDirection = 'desc', filters } = options
    const offset = (page - 1) * pageSize
    
    let query = this.client
      .from(table)
      .select('*', { count: 'exact' })
      .range(offset, offset + pageSize - 1)
    
    // Apply filters
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value)
        }
      })
    }
    
    // Apply ordering
    if (orderBy) {
      query = query.order(orderBy, { ascending: orderDirection === 'asc' })
    }
    
    const { data, error, count } = await query
    
    if (error) {
      throw new Error(`Pagination query failed: ${error.message}`)
    }
    
    return {
      data: data || [],
      total_count: count || 0,
      page,
      page_size: pageSize,
      has_more: (count || 0) > offset + pageSize,
    }
  }
  
  // Search functionality
  async search(
    table: string,
    searchColumn: string,
    searchTerm: string,
    options?: {
      limit?: number
      filters?: Record<string, unknown>
    }
  ) {
    const { limit = 50, filters } = options || {}
    
    let query = this.client
      .from(table)
      .select('*')
      .ilike(searchColumn, `%${searchTerm}%`)
      .limit(limit)
    
    // Apply additional filters
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value)
        }
      })
    }
    
    const { data, error } = await query
    
    if (error) {
      throw new Error(`Search query failed: ${error.message}`)
    }
    
    return data || []
  }
}

// Export default database service instance
export const db = new DatabaseService()
export const adminDb = new DatabaseService(true)

// Database schema type for TypeScript
export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: 'patient' | 'clinician' | 'researcher' | 'admin'
          organization_id: string | null
          preferences: Record<string, unknown> | null
          created_at: string
          updated_at: string
          last_login_at: string | null
        }
        Insert: {
          id?: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'patient' | 'clinician' | 'researcher' | 'admin'
          organization_id?: string | null
          preferences?: Record<string, unknown> | null
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'patient' | 'clinician' | 'researcher' | 'admin'
          organization_id?: string | null
          preferences?: Record<string, unknown> | null
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
        }
      }
      patients: {
        Row: {
          id: string
          user_id: string | null
          medical_record_number: string | null
          age: number
          gender: 'male' | 'female' | 'other'
          scd_genotype: 'HbSS' | 'HbSC' | 'HbS-beta-thal' | 'HbS-beta+-thal' | 'other'
          diagnosis_date: string
          organization_id: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          medical_record_number?: string | null
          age: number
          gender: 'male' | 'female' | 'other'
          scd_genotype: 'HbSS' | 'HbSC' | 'HbS-beta-thal' | 'HbS-beta+-thal' | 'other'
          diagnosis_date: string
          organization_id: string
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          medical_record_number?: string | null
          age?: number
          gender?: 'male' | 'female' | 'other'
          scd_genotype?: 'HbSS' | 'HbSC' | 'HbS-beta-thal' | 'HbS-beta+-thal' | 'other'
          diagnosis_date?: string
          organization_id?: string
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      threads: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          status: 'active' | 'archived' | 'deleted'
          metadata: Record<string, unknown> | null
          created_at: string
          updated_at: string
          last_message_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          status?: 'active' | 'archived' | 'deleted'
          metadata?: Record<string, unknown> | null
          created_at?: string
          updated_at?: string
          last_message_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          status?: 'active' | 'archived' | 'deleted'
          metadata?: Record<string, unknown> | null
          created_at?: string
          updated_at?: string
          last_message_at?: string | null
        }
      }
      messages: {
        Row: {
          id: string
          thread_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          content_type: 'text' | 'markdown' | 'code' | 'json'
          metadata: Record<string, unknown> | null
          parent_message_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          thread_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          content_type?: 'text' | 'markdown' | 'code' | 'json'
          metadata?: Record<string, unknown> | null
          parent_message_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          thread_id?: string
          role?: 'user' | 'assistant' | 'system'
          content?: string
          content_type?: 'text' | 'markdown' | 'code' | 'json'
          metadata?: Record<string, unknown> | null
          parent_message_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
