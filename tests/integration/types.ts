import type { MessageParam } from '@anthropic-ai/sdk/resources/messages';

// ============================================================================
// Execution Modes
// ============================================================================

export type ExecutionMode = 'autonomous' | 'interactive' | 'challenger';

// ============================================================================
// Conversation Types
// ============================================================================

export interface ConversationTurn {
  // Condition to check before sending this turn (regex matched against last assistant response)
  trigger?: string;
  // User message to send
  user_message: string;
}

// ============================================================================
// Task Input Types (Discriminated Union)
// ============================================================================

interface BaseTaskInput {
  startup_name: string;
  context: string;
}

/**
 * Autonomous: Single-shot document generation via business-writer agent
 */
export interface AutonomousTaskInput extends BaseTaskInput {
  execution_mode: 'autonomous';
  // Document type to generate (e.g., 'business-brief', 'market-analysis')
  document_type: string;
  // Optional prior document for context (relative to fixtures/)
  context_fixture?: string;
}

/**
 * Interactive: Multi-turn conversation via inline skill execution
 */
export interface InteractiveTaskInput extends BaseTaskInput {
  execution_mode: 'interactive';
  // Skill to load (e.g., 'gathering-input', 'naming-business')
  skill: string;
  // Document type when using gathering-input (e.g., 'business-brief', 'brand-brief', 'product-brief')
  document_type?: string;
  // Optional additional reference files to load (relative to skill directory)
  references?: string[];
  // Required conversation turns for multi-turn testing
  conversation: ConversationTurn[];
}

/**
 * Challenger: Scrutiny mode for challenging document assumptions
 */
export interface ChallengerTaskInput extends BaseTaskInput {
  execution_mode: 'challenger';
  // Document type being challenged
  document_type: string;
  // Fixture containing the document to challenge (relative to fixtures/)
  fixture: string;
  // Optional conversation turns for multi-turn challenger dialogue
  conversation?: ConversationTurn[];
}

export type TaskInput = AutonomousTaskInput | InteractiveTaskInput | ChallengerTaskInput;

// ============================================================================
// Task Definition
// ============================================================================

export interface Task {
  name: string;
  description: string;
  trials: number;
  input: TaskInput;
  reference_solution?: string;
  graders: GraderConfig[];
  success_criteria: SuccessCriteria;
}

export interface SuccessCriteria {
  all_code_graders_pass: boolean;
  model_grader_score?: string;
  // Minimum fraction of trials that must pass (default: 1.0 = all trials)
  min_pass_rate?: number;
}

// ============================================================================
// Grader Types
// ============================================================================

export interface GraderConfig {
  type: 'code' | 'model';
  checks?: CodeChecks;
  rubric?: string;
  threshold?: number;
}

export interface CodeChecks {
  sections_present?: string[];
  min_word_count?: number;
  no_placeholder_text?: boolean;
  contains?: string[];
  not_contains?: string[];
  // Conversation-specific checks
  min_turns?: number;
  contains_questions?: boolean;
  no_self_answering?: boolean;
}

export interface CheckResult {
  check: string;
  passed: boolean;
  message: string | null;
}

export interface GraderResult {
  type: 'code' | 'model';
  passed: boolean;
  score?: number;
  details: CheckResult[] | ModelGraderDetails;
}

export interface ModelGraderDetails {
  scores: Record<string, number>;
  overall: number;
  feedback: string;
}

// ============================================================================
// Usage Tracking
// ============================================================================

export interface UsageStats {
  inputTokens: number;
  outputTokens: number;
  cacheCreationInputTokens: number;
  cacheReadInputTokens: number;
  apiCalls: number;
  estimatedCostUsd: number;
}

// ============================================================================
// Evaluation Results
// ============================================================================

export interface Trial {
  taskName: string;
  trialNumber: number;
  transcript: MessageParam[];
  output: string;
  graderResults: GraderResult[];
  passed: boolean;
  durationMs: number;
  usage: UsageStats;
}

export interface EvalResult {
  task: string;
  trials: number;
  trialsRun: number; // Actual trials run (may be less due to early exit)
  passed: number;
  passAtK: boolean;
  passK: boolean;
  passRate: number;
  trialResults: Trial[];
  totalUsage: UsageStats;
}

// ============================================================================
// Orchestration Types (Tool-Use Simulation)
// ============================================================================

/** A recorded tool invocation from an orchestration trial */
export interface ToolInvocation {
  name: string;
  input: Record<string, unknown>;
  id: string;
  /** Sequence position across the trial (0-based) */
  order: number;
}

/** An assertion to evaluate against collected tool invocations */
export interface OrchestratorAssertion {
  description: string;
  check: (invocations: ToolInvocation[]) => boolean;
}

/** Result of a single assertion check */
export interface AssertionResult {
  description: string;
  passed: boolean;
}

/** Result of a single orchestration trial */
export interface OrchestratorTrialResult {
  trialNumber: number;
  toolInvocations: ToolInvocation[];
  assertionResults: AssertionResult[];
  passed: boolean;
  durationMs: number;
  usage: UsageStats;
}

/** Result of evaluating an orchestration task across all trials */
export interface OrchestratorEvalResult {
  task: string;
  trials: number;
  trialsRun: number;
  passed: number;
  passRate: number;
  trialResults: OrchestratorTrialResult[];
  totalUsage: UsageStats;
}

/** Plugin file to load into orchestration system prompt */
export interface OrchestratorContextFile {
  /** Path relative to plugin root */
  relativePath: string;
  /** Section header in system prompt */
  header: string;
}

/** Mock tool handler: receives tool input, returns simulated result string */
export type MockToolHandler = (input: Record<string, unknown>) => string;

/** Orchestration task definition */
export interface OrchestratorTask {
  name: string;
  description: string;
  trials: number;
  /** Plugin files to inject into system prompt context */
  contextFiles: OrchestratorContextFile[];
  /** Additional system prompt instructions appended after context */
  systemInstructions: string;
  /** User message to send */
  userMessage: string;
  /** Override default mock handlers for specific tools */
  mockOverrides?: Record<string, MockToolHandler>;
  /** Assertions to evaluate against tool invocations */
  assertions: OrchestratorAssertion[];
  /** Minimum fraction of trials that must pass (default: uses global MIN_PASS_RATE) */
  min_pass_rate?: number;
}
