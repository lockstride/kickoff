import type { CodeChecks, CheckResult, GraderResult } from '../types';

export function runCodeGrader(output: string, checks: CodeChecks): GraderResult {
  const results: CheckResult[] = [];

  // Section presence check
  // Matches headers like "## Problem Statement", "## 2. Market Size & Economics", etc.
  // Allows optional numbering (e.g., "2.") and additional text after the section name
  if (checks.sections_present) {
    for (const section of checks.sections_present) {
      // Match: ## [optional number.] [section name] [optional additional text]
      const regex = new RegExp(`^##\\s*(?:\\d+\\.?\\s*)?${escapeRegex(section)}`, 'im');
      const found = regex.test(output);
      results.push({
        check: `section_${section}`,
        passed: found,
        message: found ? null : `Missing section: ${section}`,
      });
    }
  }

  // Minimum word count check
  if (checks.min_word_count !== undefined) {
    const wordCount = output.split(/\s+/).filter((w) => w.length > 0).length;
    const passed = wordCount >= checks.min_word_count;
    results.push({
      check: 'min_word_count',
      passed,
      message: passed
        ? null
        : `Word count ${wordCount.toString()} < ${checks.min_word_count.toString()}`,
    });
  }

  // No placeholder text check (ignores content inside code blocks)
  // Matches template-style placeholders like {FIELD_NAME} (uppercase with underscores)
  // Excludes legitimate technical terms like {token}, {id}, {resource}
  if (checks.no_placeholder_text) {
    const textOutsideCodeBlocks = stripCodeBlocks(output);
    // Require uppercase start + at least one more uppercase/underscore to avoid matching {token}, {id}, etc.
    const placeholderPattern = /\{[A-Z][A-Z_]+\}|\[TODO\]|\[PLACEHOLDER\]|\[TBD\]/g;
    const hasPlaceholders = placeholderPattern.test(textOutsideCodeBlocks);
    results.push({
      check: 'no_placeholder_text',
      passed: !hasPlaceholders,
      message: hasPlaceholders ? 'Contains placeholder text' : null,
    });
  }

  // Contains check
  if (checks.contains) {
    for (const text of checks.contains) {
      const found = output.toLowerCase().includes(text.toLowerCase());
      results.push({
        check: `contains_${text}`,
        passed: found,
        message: found ? null : `Missing expected text: ${text}`,
      });
    }
  }

  // Not contains check
  if (checks.not_contains) {
    for (const text of checks.not_contains) {
      const found = output.toLowerCase().includes(text.toLowerCase());
      results.push({
        check: `not_contains_${text}`,
        passed: !found,
        message: found ? `Contains forbidden text: ${text}` : null,
      });
    }
  }

  // ============================================================================
  // Conversation-Specific Checks
  // ============================================================================

  // Minimum conversation turns (assistant messages separated by ---)
  if (checks.min_turns !== undefined) {
    const turns = (output.match(/---\n\n/g) ?? []).length + 1;
    const passed = turns >= checks.min_turns;
    results.push({
      check: 'min_turns',
      passed,
      message: passed
        ? null
        : `Only ${turns.toString()} turns, expected ${checks.min_turns.toString()}`,
    });
  }

  // Contains questions (looking for ? in assistant responses)
  if (checks.contains_questions) {
    const hasQuestions = output.includes('?');
    results.push({
      check: 'contains_questions',
      passed: hasQuestions,
      message: hasQuestions ? null : 'No questions found in output',
    });
  }

  // No self-answering (assistant shouldn't answer its own questions in same turn)
  if (checks.no_self_answering) {
    // Detect: question immediately followed by substantive answer (not a prompt)
    // This pattern looks for a question mark followed by newlines and then content
    // that doesn't start with a prompt-like phrase
    const selfAnswerPattern =
      /\?[^\n]*\n\n(?!(?:\d+\.|[-*]|\*\*|Enter|Choose|Select|Type|Would you like|What would you|How would you|Do you want))[\w]/;
    const hasSelfAnswer = selfAnswerPattern.test(output);
    results.push({
      check: 'no_self_answering',
      passed: !hasSelfAnswer,
      message: hasSelfAnswer ? 'Detected self-answering behavior' : null,
    });
  }

  return {
    type: 'code',
    passed: results.every((r) => r.passed),
    details: results,
  };
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function stripCodeBlocks(text: string): string {
  // Remove fenced code blocks (```...``` or ~~~...~~~)
  return text.replace(/```[\s\S]*?```|~~~[\s\S]*?~~~/g, '');
}
