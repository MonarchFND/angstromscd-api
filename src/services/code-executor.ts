import type { 
  E2BExecutionRequest, 
  E2BExecutionResult, 
  E2BMedicalAnalysisTool 
} from '../types/integrations.js'

export class CodeExecutorService {
  private apiKey: string
  private activeSessions: Map<string, any> = new Map()

  constructor() {
    this.apiKey = process.env.E2B_API_KEY || ''
    if (!this.apiKey) {
      console.warn('E2B_API_KEY not found. Code execution will be disabled.')
    }
  }

  // Create a new E2B session
  async createSession(): Promise<string> {
    if (!this.apiKey) {
      throw new Error('E2B API key not configured')
    }

    try {
      // TODO: Replace with actual E2B session creation
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      this.activeSessions.set(sessionId, { id: sessionId, created: new Date() })
      
      return sessionId
    } catch (error) {
      throw new Error(`Failed to create E2B session: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Get an existing session
  private getSession(sessionId: string): any {
    const session = this.activeSessions.get(sessionId)
    if (!session) {
      throw new Error(`Session ${sessionId} not found`)
    }
    return session
  }

  // Execute code in a session
  async executeCode(request: E2BExecutionRequest, sessionId?: string): Promise<E2BExecutionResult> {
    const startTime = Date.now()
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    try {
      // Create session if not provided
      const currentSessionId = sessionId || await this.createSession()
      this.getSession(currentSessionId) // Validate session exists

      // TODO: Replace with actual E2B code execution
      // For now, return a mock successful result
      const executionTime = Date.now() - startTime

      const executionResult: E2BExecutionResult = {
        execution_id: executionId,
        status: 'completed',
        stdout: 'Mock execution completed successfully',
        stderr: undefined,
        return_value: { message: 'Mock result' },
        execution_time_ms: executionTime,
        started_at: new Date(startTime).toISOString(),
        completed_at: new Date().toISOString(),
      }

      return executionResult
    } catch (error) {
      const executionTime = Date.now() - startTime
      
      return {
        execution_id: executionId,
        status: 'failed',
        execution_time_ms: executionTime,
        error_details: {
          error_type: 'SystemError',
          error_message: error instanceof Error ? error.message : 'Unknown error',
        },
        started_at: new Date(startTime).toISOString(),
        completed_at: new Date().toISOString(),
      }
    }
  }

  // Execute medical analysis tool
  async executeMedicalAnalysis(
    tool: E2BMedicalAnalysisTool, 
    data: unknown, 
    sessionId?: string
  ): Promise<E2BExecutionResult> {
    const request: E2BExecutionRequest = {
      code: tool.code_template,
      language: 'python',
      environment: {
        packages: tool.required_packages,
      },
      timeout_seconds: 120,
      memory_limit_mb: 1024,
    }

    return this.executeCode(request, sessionId)
  }

  // Upload file to session
  async uploadFile(sessionId: string, filename: string, content: Buffer): Promise<string> {
    this.getSession(sessionId) // Validate session exists
    
    try {
      // TODO: Replace with actual E2B file upload
      return filename
    } catch (error) {
      throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Download file from session
  async downloadFile(sessionId: string, filepath: string): Promise<Buffer> {
    this.getSession(sessionId) // Validate session exists
    
    try {
      // TODO: Replace with actual E2B file download
      return Buffer.from('Mock file content')
    } catch (error) {
      throw new Error(`Failed to download file: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Destroy a session
  async destroySession(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId)
    if (session) {
      try {
        // TODO: Replace with actual E2B session cleanup
        this.activeSessions.delete(sessionId)
      } catch (error) {
        console.warn(`Error closing session ${sessionId}:`, error)
      }
    }
  }

  // Clean up all sessions
  async cleanup(): Promise<void> {
    const sessionIds = Array.from(this.activeSessions.keys())
    await Promise.all(sessionIds.map(id => this.destroySession(id)))
  }

  // Get session status
  getSessionStatus(sessionId: string): { exists: boolean; active: boolean } {
    const session = this.activeSessions.get(sessionId)
    return {
      exists: !!session,
      active: !!session,
    }
  }

  // List active sessions
  listActiveSessions(): string[] {
    return Array.from(this.activeSessions.keys())
  }

  // Helper method to determine MIME type
  private getMimeType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase()
    const mimeTypes: Record<string, string> = {
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'gif': 'image/gif',
      'pdf': 'application/pdf',
      'csv': 'text/csv',
      'json': 'application/json',
      'txt': 'text/plain',
      'html': 'text/html',
      'py': 'text/x-python',
    }
    return mimeTypes[ext || ''] || 'application/octet-stream'
  }

  // Health check
  async healthCheck(): Promise<{ status: 'connected' | 'disconnected' | 'error'; message?: string }> {
    if (!this.apiKey) {
      return { status: 'disconnected', message: 'E2B API key not configured' }
    }

    try {
      // For mock implementation, always return connected if API key exists
      return { status: 'connected' }
    } catch (error) {
      return { 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }
}

// Export singleton instance
export const codeExecutor = new CodeExecutorService()

// Medical analysis tools templates
export const MEDICAL_ANALYSIS_TOOLS: Record<string, E2BMedicalAnalysisTool> = {
  voe_risk_analysis: {
    tool_name: 'VOE Risk Analysis',
    description: 'Analyze vaso-occlusive episode risk factors for SCD patients',
    parameters: {
      analysis_type: 'voe_risk_assessment',
      output_format: 'json',
    },
    code_template: `
# VOE Risk Analysis
def analyze_voe_risk(patient_data):
    """Analyze vaso-occlusive episode risk factors"""
    
    # Convert to DataFrame if needed
    if isinstance(patient_data, dict):
        df = pd.DataFrame([patient_data])
    else:
        df = pd.DataFrame(patient_data)
    
    # Risk factor analysis
    risk_factors = []
    risk_score = 0
    
    # Age factor
    if 'age' in df.columns:
        age = df['age'].iloc[0] if len(df) > 0 else 0
        if age < 5:
            risk_factors.append({'factor': 'young_age', 'weight': 0.3, 'value': age})
            risk_score += 30
        elif age > 50:
            risk_factors.append({'factor': 'advanced_age', 'weight': 0.2, 'value': age})
            risk_score += 20
    
    # HbF level factor
    if 'hbf_level' in df.columns:
        hbf = df['hbf_level'].iloc[0] if len(df) > 0 else 0
        if hbf < 5:
            risk_factors.append({'factor': 'low_hbf', 'weight': 0.4, 'value': hbf})
            risk_score += 40
        elif hbf > 15:
            risk_factors.append({'factor': 'high_hbf_protective', 'weight': -0.3, 'value': hbf})
            risk_score -= 30
    
    # Hemoglobin level
    if 'hemoglobin' in df.columns:
        hb = df['hemoglobin'].iloc[0] if len(df) > 0 else 0
        if hb < 7:
            risk_factors.append({'factor': 'severe_anemia', 'weight': 0.3, 'value': hb})
            risk_score += 30
    
    # Normalize risk score to 0-100
    risk_score = max(0, min(100, risk_score))
    
    # Generate recommendations
    recommendations = []
    if risk_score > 70:
        recommendations.append("Consider prophylactic hydroxyurea therapy")
        recommendations.append("Increase monitoring frequency")
    elif risk_score > 40:
        recommendations.append("Regular follow-up recommended")
        recommendations.append("Monitor for early signs of VOE")
    else:
        recommendations.append("Continue current management")
    
    return {
        'risk_score': risk_score,
        'risk_factors': risk_factors,
        'recommendations': recommendations,
        'confidence': 0.8,
        'analysis_date': datetime.now().isoformat()
    }

# Execute analysis
result = analyze_voe_risk(patient_data)
print(json.dumps(result, indent=2))
`,
    required_packages: ['pandas', 'numpy', 'matplotlib', 'seaborn'],
    expected_outputs: ['risk_score', 'risk_factors', 'recommendations'],
  },

  lab_trend_analysis: {
    tool_name: 'Lab Trend Analysis',
    description: 'Analyze laboratory value trends over time',
    parameters: {
      analysis_type: 'lab_trend',
      output_format: 'plot',
    },
    code_template: `
# Lab Trend Analysis
def analyze_lab_trends(lab_data):
    """Analyze trends in laboratory values"""
    
    df = pd.DataFrame(lab_data)
    
    if 'test_date' in df.columns:
        df['test_date'] = pd.to_datetime(df['test_date'])
        df = df.sort_values('test_date')
    
    # Create trend plots
    fig, axes = plt.subplots(2, 2, figsize=(15, 10))
    fig.suptitle('Laboratory Value Trends', fontsize=16)
    
    # Hemoglobin trend
    if 'hemoglobin' in df.columns:
        axes[0, 0].plot(df['test_date'], df['hemoglobin'], marker='o')
        axes[0, 0].set_title('Hemoglobin Trend')
        axes[0, 0].set_ylabel('Hemoglobin (g/dL)')
        axes[0, 0].axhline(y=7, color='r', linestyle='--', alpha=0.7, label='Critical Low')
        axes[0, 0].legend()
    
    # HbF level trend
    if 'hbf_level' in df.columns:
        axes[0, 1].plot(df['test_date'], df['hbf_level'], marker='o', color='green')
        axes[0, 1].set_title('HbF Level Trend')
        axes[0, 1].set_ylabel('HbF (%)')
    
    # Reticulocyte count
    if 'reticulocyte_count' in df.columns:
        axes[1, 0].plot(df['test_date'], df['reticulocyte_count'], marker='o', color='orange')
        axes[1, 0].set_title('Reticulocyte Count Trend')
        axes[1, 0].set_ylabel('Reticulocytes (%)')
    
    # LDH trend
    if 'lactate_dehydrogenase' in df.columns:
        axes[1, 1].plot(df['test_date'], df['lactate_dehydrogenase'], marker='o', color='red')
        axes[1, 1].set_title('LDH Trend')
        axes[1, 1].set_ylabel('LDH (U/L)')
        axes[1, 1].axhline(y=280, color='r', linestyle='--', alpha=0.7, label='Upper Normal')
        axes[1, 1].legend()
    
    plt.tight_layout()
    plt.savefig('lab_trends.png', dpi=300, bbox_inches='tight')
    plt.show()
    
    # Calculate trend statistics
    trends = {}
    for col in ['hemoglobin', 'hbf_level', 'reticulocyte_count', 'lactate_dehydrogenase']:
        if col in df.columns and len(df) > 1:
            # Simple linear trend
            x = range(len(df))
            y = df[col].values
            slope = np.polyfit(x, y, 1)[0]
            trends[col] = {
                'slope': slope,
                'direction': 'increasing' if slope > 0 else 'decreasing' if slope < 0 else 'stable',
                'latest_value': y[-1] if len(y) > 0 else None,
                'change_from_first': y[-1] - y[0] if len(y) > 1 else 0
            }
    
    return trends

# Execute analysis
trends = analyze_lab_trends(patient_data)
print(json.dumps(trends, indent=2))
`,
    required_packages: ['pandas', 'numpy', 'matplotlib', 'seaborn'],
    expected_outputs: ['lab_trends.png', 'trend_statistics'],
  },
} 