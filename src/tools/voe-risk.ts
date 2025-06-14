/**
 * VOE Risk Analysis Tool Wrapper
 * --------------------------------------------
 * Provides a convenient TypeScript helper that triggers the
 * `MEDICAL_ANALYSIS_TOOLS.voe_risk_analysis` template via the existing
 * `codeExecutor`.  The Python analysis code (pandas / matplotlib /
 * scikit-learn) already lives in the code template defined in
 * `services/code-executor.ts`, ensuring compatibility with the E2B
 * environment.
 *
 * Example:
 *   import { runVoeRiskAnalysis } from "../tools/voe-risk.js";
 *   const result = await runVoeRiskAnalysis({ age: 12, hbf_level: 3.2, ... });
 */

import { codeExecutor, MEDICAL_ANALYSIS_TOOLS } from "../services/code-executor.js"
import type { E2BExecutionResult } from "../types/integrations.js"

export type PatientData = Record<string, unknown>

/**
 * Execute the VOE Risk Analysis tool in an E2B sandbox.
 * @param patientData – Plain JSON object with patient fields expected by the
 *   underlying Python script (age, hbf_level, hemoglobin, etc.).
 */
export async function runVoeRiskAnalysis(patientData: PatientData = {}): Promise<E2BExecutionResult> {
  const tool = MEDICAL_ANALYSIS_TOOLS.voe_risk_analysis

  if (!tool) {
    throw new Error("VOE Risk Analysis tool definition not found – check MEDICAL_ANALYSIS_TOOLS")
  }

  return codeExecutor.executeMedicalAnalysis(tool, patientData)
}
