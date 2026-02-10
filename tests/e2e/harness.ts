import Anthropic from '@anthropic-ai/sdk';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { MessageParam } from '@anthropic-ai/sdk/resources/messages';
import type {
  Task,
  TaskInput,
  AutonomousTaskInput,
  InteractiveTaskInput,
  ChallengerTaskInput,
  Trial,
  EvalResult,
  GraderResult,
  GraderConfig,
  ConversationTurn,
} from './types';
import { calculateRequiredPasses } from './utils';
import { runCodeGrader } from './graders/code-based';
import { runModelGrader } from './graders/model-based';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PLUGIN_ROOT = resolve(__dirname, '../../plugin');

const client = new Anthropic();

export const GENERATION_MODEL = process.env.E2E_GENERATION_MODEL ?? 'claude-haiku-4-5';
export const GRADER_MODEL = process.env.E2E_GRADER_MODEL ?? 'claude-haiku-4-5';

export const MIN_PASS_RATE = process.env.E2E_MIN_PASS_RATE
  ? parseFloat(process.env.E2E_MIN_PASS_RATE)
  : 0.33;

// ============================================================================
// Trial Execution
// ============================================================================

export async function runTrial(task: Task, trialNum: number): Promise<Trial> {
  const startTime = Date.now();
  const transcript: MessageParam[] = [];

  const systemPrompt = composeSystemPrompt(task);
  const userMessage = composeUserMessage(task);

  transcript.push({ role: 'user', content: userMessage });

  let response = await client.messages.create({
    model: GENERATION_MODEL,
    max_tokens: 16384,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  });

  let output = response.content[0].type === 'text' ? response.content[0].text : '';
  transcript.push({ role: 'assistant', content: output });

  // Handle multi-turn conversation if defined
  const conversation = getConversation(task.input);
  if (conversation) {
    for (const turn of conversation) {
      if (turn.trigger) {
        const triggerRegex = new RegExp(turn.trigger, 'i');
        if (!triggerRegex.test(output)) {
          continue;
        }
      }

      transcript.push({ role: 'user', content: turn.user_message });

      response = await client.messages.create({
        model: GENERATION_MODEL,
        max_tokens: 16384,
        system: systemPrompt,
        messages: transcript.map((m) => ({
          role: m.role,
          content: m.content as string,
        })),
      });

      output = response.content[0].type === 'text' ? response.content[0].text : '';
      transcript.push({ role: 'assistant', content: output });
    }
  }

  // Collect output for grading
  // For interactive mode, include full conversation so grader can evaluate response integration
  // For other modes, only include assistant messages
  const fullOutput =
    task.input.execution_mode === 'interactive'
      ? transcript
          .map((m) => `**${m.role.toUpperCase()}:**\n${m.content as string}`)
          .join('\n\n---\n\n')
      : transcript
          .filter((m) => m.role === 'assistant')
          .map((m) => m.content as string)
          .join('\n\n---\n\n');

  // Run graders on full conversation output
  const graderResults = await runGraders(task.graders, fullOutput, task.reference_solution);

  // Determine pass/fail based on success criteria
  const codeGradersPassed = graderResults.filter((g) => g.type === 'code').every((g) => g.passed);

  const modelGraderScore = graderResults.find((g) => g.type === 'model')?.score ?? 1;
  const modelThreshold = parseThreshold(task.success_criteria.model_grader_score);

  const passed =
    (!task.success_criteria.all_code_graders_pass || codeGradersPassed) &&
    (modelThreshold === null || modelGraderScore >= modelThreshold);

  // Save transcript for debugging
  const transcriptPath = join(
    __dirname,
    'transcripts',
    `${sanitizeFilename(task.name)}-trial-${trialNum.toString()}.json`
  );
  writeFileSync(
    transcriptPath,
    JSON.stringify({ transcript, output: fullOutput, graderResults }, null, 2)
  );

  return {
    taskName: task.name,
    trialNumber: trialNum,
    transcript,
    output: fullOutput,
    graderResults,
    passed,
    durationMs: Date.now() - startTime,
  };
}

// ============================================================================
// Task Evaluation
// ============================================================================

export type TrialStartCallback = (trialNum: number) => void;
export type TrialCompleteCallback = (trial: Trial) => void;

export async function evaluateTask(
  task: Task,
  onTrialStart?: TrialStartCallback,
  onTrialComplete?: TrialCompleteCallback
): Promise<EvalResult> {
  const trialResults: Trial[] = [];
  const minPassRate = task.success_criteria.min_pass_rate ?? MIN_PASS_RATE;
  const requiredPasses = calculateRequiredPasses(task.trials, minPassRate);
  const maxAllowedFailures = task.trials - requiredPasses;

  let passCount = 0;
  let failCount = 0;

  for (let i = 1; i <= task.trials; i++) {
    onTrialStart?.(i);
    const trial = await runTrial(task, i);
    trialResults.push(trial);
    onTrialComplete?.(trial);

    if (trial.passed) {
      passCount++;
      // Early exit: already achieved required passes
      if (passCount >= requiredPasses) {
        break;
      }
    } else {
      failCount++;
      // Early exit: too many failures to possibly pass
      if (failCount > maxAllowedFailures) {
        break;
      }
    }
  }

  return {
    task: task.name,
    trials: task.trials,
    trialsRun: trialResults.length,
    passed: passCount,
    passAtK: passCount > 0,
    passK: passCount === task.trials,
    passRate: passCount / trialResults.length,
    trialResults,
  };
}

// ============================================================================
// Graders
// ============================================================================

async function runGraders(
  graders: GraderConfig[],
  output: string,
  referencePath?: string
): Promise<GraderResult[]> {
  const results: GraderResult[] = [];
  const reference = referencePath ? loadReference(referencePath) : undefined;

  for (const grader of graders) {
    if (grader.type === 'code' && grader.checks) {
      results.push(runCodeGrader(output, grader.checks));
    } else if (grader.type === 'model' && grader.rubric) {
      const result = await runModelGrader(
        output,
        grader.rubric,
        grader.threshold ?? 0.7,
        reference
      );
      results.push(result);
    }
  }

  return results;
}

// ============================================================================
// System Prompt Composition (Mode-Specific)
// ============================================================================

export function composeSystemPrompt(task: Task): string {
  switch (task.input.execution_mode) {
    case 'autonomous':
      return composeAutonomousPrompt(task.input);
    case 'interactive':
      return composeInteractivePrompt(task.input);
    case 'challenger':
      return composeChallengerPrompt(task.input);
  }
}

function composeAutonomousPrompt(input: AutonomousTaskInput): string {
  // Load the business-writer agent
  const agentPath = join(PLUGIN_ROOT, 'agents', 'business-writer.md');
  const agentContent = existsSync(agentPath)
    ? substitutePluginVariables(readFileSync(agentPath, 'utf-8'))
    : '';

  // Load the template for this document type
  const templatePath = join(
    PLUGIN_ROOT,
    'skills',
    'generating-documents',
    'assets',
    'templates',
    `${input.document_type}.md`
  );
  const templateContent = existsSync(templatePath)
    ? substitutePluginVariables(readFileSync(templatePath, 'utf-8'))
    : '';

  return `You are the business-writer agent generating startup documentation.

## Agent Definition
${agentContent}

## Output Template
${templateContent}

## Instructions
- Generate the document directly without asking clarifying questions
- Follow the template structure exactly, including all section headers
- Fill in all sections with realistic, specific content based on the provided context
- Do not include placeholder text like {FIELD_NAME} or {TAM_ESTIMATE}
- Remove all <!-- Guidance: ... --> comments from output
- Use the startup name and context provided by the user`;
}

function composeInteractivePrompt(input: InteractiveTaskInput): string {
  // Load the skill
  const skillPath = join(PLUGIN_ROOT, 'skills', input.skill, 'SKILL.md');
  const skillContent = existsSync(skillPath)
    ? substitutePluginVariables(readFileSync(skillPath, 'utf-8'))
    : '';

  // Load any specified reference files
  const referenceContent = (input.references ?? [])
    .map((ref) => {
      const refPath = join(PLUGIN_ROOT, 'skills', input.skill, ref);
      return existsSync(refPath) ? substitutePluginVariables(readFileSync(refPath, 'utf-8')) : '';
    })
    .filter(Boolean)
    .join('\n\n---\n\n');

  // If document_type is specified, load the topic-specific guide
  let topicContent = '';
  if (input.document_type && input.skill === 'gathering-input') {
    const topicPath = join(
      PLUGIN_ROOT,
      'skills',
      'gathering-input',
      'references',
      `${input.document_type}-topic.md`
    );
    if (existsSync(topicPath)) {
      topicContent = substitutePluginVariables(readFileSync(topicPath, 'utf-8'));
    }
  }

  return `You are conducting an interactive session with a startup founder.

## Skill Definition
${skillContent}

${topicContent ? `## Topic Guide\n${topicContent}` : ''}

${referenceContent ? `## Reference Material\n${referenceContent}` : ''}

## Session Context
${input.document_type ? `- document_type: ${input.document_type}` : ''}
- startup_name: ${input.startup_name}

## Instructions
- Follow the conversational pattern defined in the skill
${input.document_type ? `- You are gathering input for a ${input.document_type}` : ''}
- Ask questions and wait for user responses
- Use the checkpoint and phase structure from the skill
- Adapt based on user responses
- Do NOT generate final output until all phases are complete
- For naming: generate candidates when preferences are gathered
- For input gathering: produce a structured summary after all phases`;
}

function composeChallengerPrompt(input: ChallengerTaskInput): string {
  // Load the challenging-assumptions skill
  const skillPath = join(PLUGIN_ROOT, 'skills', 'challenging-assumptions', 'SKILL.md');
  const skillContent = existsSync(skillPath)
    ? substitutePluginVariables(readFileSync(skillPath, 'utf-8'))
    : '';

  // Load specific domain file based on document type
  const domainMap: Record<string, string> = {
    'market-analysis': 'market',
    'business-brief': 'problem',
    'product-brief': 'solution',
    'product-spec': 'solution',
    'business-plan': 'financials',
    'pitch-deck': 'financials',
  };
  const domainName = domainMap[input.document_type] ?? 'market';
  const specificDomainPath = join(
    PLUGIN_ROOT,
    'skills',
    'challenging-assumptions',
    'references',
    'domains',
    `${domainName}.md`
  );
  const specificDomain = existsSync(specificDomainPath)
    ? substitutePluginVariables(readFileSync(specificDomainPath, 'utf-8'))
    : '';

  return `You are the Challenger agent in SKEPTIC MODE. The user has just completed a ${input.document_type} and opted into scrutiny.

## Challenger Skill
${skillContent}

## Domain-Specific Challenges
${specificDomain}

## Session Context
- document_type: ${input.document_type}
- startup_name: ${input.startup_name}

## Instructions
- Begin with the SKEPTIC MODE ENGAGED header as defined in the skill
- Challenge the assumptions in the provided document
- Use the domain-specific challenges as inspiration (not scripts)
- Move to a new topic after 1 satisfactory answer OR 3 questions on same topic
- Exit after 3 cumulative satisfactory answers OR 6 cumulative unsatisfactory answers
- When exiting, provide calibrated "tough love" based on session outcome
- Always produce the structured insights summary (Validated Strengths, Identified Gaps, Revision Suggestions) as defined in the Session Exit section`;
}

// ============================================================================
// User Message Composition (Mode-Specific)
// ============================================================================

export function composeUserMessage(task: Task): string {
  const input = task.input;

  switch (input.execution_mode) {
    case 'autonomous':
      return composeAutonomousUserMessage(input);
    case 'interactive':
      return composeInteractiveUserMessage(input);
    case 'challenger':
      return composeChallengerUserMessage(input);
  }
}

function composeAutonomousUserMessage(input: AutonomousTaskInput): string {
  if (input.context_fixture) {
    const fixtureContent = loadFixture(input.context_fixture);
    if (!fixtureContent) {
      throw new Error(`Context fixture not found: ${input.context_fixture}`);
    }
    return `Generate ${input.document_type} for "${input.startup_name}".

Prior document for context:
---
${fixtureContent}
---

Additional context:
${input.context}

Generate the complete document now.`;
  }

  return `Generate ${input.document_type} for "${input.startup_name}".

Context:
${input.context}

Generate the complete document now.`;
}

function composeInteractiveUserMessage(input: InteractiveTaskInput): string {
  return `Let's work on "${input.startup_name}".

Context:
${input.context}

Please begin the session.`;
}

function composeChallengerUserMessage(input: ChallengerTaskInput): string {
  const fixtureContent = loadFixture(input.fixture);
  if (!fixtureContent) {
    throw new Error(`Fixture not found: ${input.fixture}`);
  }
  return `I just completed this ${input.document_type} for "${input.startup_name}":

---
${fixtureContent}
---

${input.context}`;
}

// ============================================================================
// Helpers
// ============================================================================

function getConversation(input: TaskInput): ConversationTurn[] | undefined {
  switch (input.execution_mode) {
    case 'interactive':
      return input.conversation;
    case 'challenger':
      return input.conversation;
    case 'autonomous':
      return undefined;
  }
}

function loadReference(relativePath: string): string | undefined {
  const fullPath = join(__dirname, relativePath);
  if (existsSync(fullPath)) {
    return readFileSync(fullPath, 'utf-8');
  }
  return undefined;
}

function loadFixture(fixtureName: string): string | undefined {
  const fullPath = join(__dirname, 'fixtures', fixtureName);
  if (existsSync(fullPath)) {
    return readFileSync(fullPath, 'utf-8');
  }
  return undefined;
}

function parseThreshold(threshold?: string): number | null {
  if (!threshold) return null;
  const match = />=?\s*([\d.]+)/.exec(threshold);
  return match ? parseFloat(match[1]) : null;
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
}

function substitutePluginVariables(content: string): string {
  return content.replace(/\$\{CLAUDE_PLUGIN_ROOT\}/g, PLUGIN_ROOT);
}
