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
}
