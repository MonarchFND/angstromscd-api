#!/usr/bin/env bun
/**
 * CLI Demo Session for AngstromSCD
 * --------------------------------------------------
 * This script spins up an interactive (minimal) demo session that
 * exercises the medical-analysis tool‐chain running through the E2B
 * code-execution sandbox.
 *
 * Usage:
 *   bun tsx cli/cli-demo.ts [tool]
 *   tool: (optional) name of a demo tool, default = "voe-risk"
 */

import { codeExecutor, MEDICAL_ANALYSIS_TOOLS } from "../src/services/code-executor.js"
import type {
  BAMLServiceClient as BAMLClient,
  VectorServiceClient as VectorService,
  E2BExecutionResult,
} from "../src/types/integrations.js"


// ---------------------------------------------------------------------------
// Mock / placeholder service clients – replace with real ones later
// ---------------------------------------------------------------------------
class MockBAMLClient implements BAMLClient {
  async generateResponse() {
    return {
      id: crypto.randomUUID(),
      template_name: "mock_template",
      model_used: "gpt-4",
      content: "[Mock BAML response]",
      metadata: { tokens_used: 0, processing_time_ms: 0 },
      created_at: new Date().toISOString(),
    } as any
  }
  async analyzeMedicalData() {
    return {
      analysis_type: "risk_assessment",
      findings: [],
      recommendations: [],
    } as any
  }
  async generateLiteratureQuery() {
    return "sickle cell disease vaso-occlusive risk factors"
  }
  async synthesizeFindings() {
    return "[Mock synthesis]"
  }
}

class MockVectorClient implements VectorService {
  async search() {
    return { query: "", collection_name: "", results: [], total_results: 0, search_time_ms: 0 }
  }
  async addDocument() { return "" }
  async updateDocument() {}
  async deleteDocument() {}
  async createCollection() {}
  async listCollections() { return [] }
}

// ---------------------------------------------------------------------------
// Demo Session interface – extends the broader type with only required pieces
// ---------------------------------------------------------------------------
interface DemoSession {
  bamlClient: BAMLClient
  e2bSession: typeof codeExecutor
  vectorClient: VectorService
  medicalContext: unknown | null
}

async function runDemo(toolName: string) {
  // Prepare session
  const session: DemoSession = {
    bamlClient: new MockBAMLClient(),
    e2bSession: codeExecutor,
    vectorClient: new MockVectorClient(),
    medicalContext: null,
  }

  const toolTemplate = MEDICAL_ANALYSIS_TOOLS[toolName as keyof typeof MEDICAL_ANALYSIS_TOOLS]
  if (!toolTemplate) {
    console.error(`Unknown tool "${toolName}"\nAvailable: ${Object.keys(MEDICAL_ANALYSIS_TOOLS).join(", ")}`)
    process.exit(1)
  }

  console.log("⏳ Executing medical analysis via E2B …\n")
  const result: E2BExecutionResult = await session.e2bSession.executeMedicalAnalysis(
    toolTemplate,
    {},
  )

  if (result.status === "completed") {
    console.log("✅ Execution completed in", result.execution_time_ms, "ms")
    console.log(JSON.stringify(result, null, 2))
  } else {
    console.error("❌ Execution failed", result.error_details)
  }
}

// ---------------------------------------------------------------------------
// Entrypoint
// ---------------------------------------------------------------------------
const [, , argTool] = process.argv
const tool = argTool ?? "voe_risk_analysis"
runDemo(tool).catch((err) => {
  console.error("Fatal error: ", err)
  process.exit(1)
})
