import { describe, it, expect } from 'vitest';
import { runCodeGrader } from './code-based';

describe('code grader', () => {
  describe('sections_present', () => {
    it('should detect sections with standard ## headers', () => {
      const output = '## Executive Summary\nContent here.\n## Market Analysis\nMore content.';
      const result = runCodeGrader(output, {
        sections_present: ['Executive Summary', 'Market Analysis'],
      });
      expect(result.passed).toBe(true);
    });

    it('should detect sections with numbered prefixes', () => {
      const output = '## 2. Market Size & Economics\nContent.';
      const result = runCodeGrader(output, { sections_present: ['Market Size'] });
      expect(result.passed).toBe(true);
    });

    it('should fail when a section is missing', () => {
      const output = '## Executive Summary\nContent.';
      const result = runCodeGrader(output, {
        sections_present: ['Executive Summary', 'Financial Plan'],
      });
      expect(result.passed).toBe(false);
      const details = result.details as {
        check: string;
        passed: boolean;
        message: string | null;
      }[];
      const failed = details.find((d) => !d.passed);
      expect(failed?.message).toContain('Financial Plan');
    });

    it('should be case-insensitive', () => {
      const output = '## executive summary\nContent.';
      const result = runCodeGrader(output, { sections_present: ['Executive Summary'] });
      expect(result.passed).toBe(true);
    });
  });

  describe('min_word_count', () => {
    it('should pass when word count meets threshold', () => {
      const output = 'word '.repeat(500);
      const result = runCodeGrader(output, { min_word_count: 500 });
      expect(result.passed).toBe(true);
    });

    it('should fail when word count is below threshold', () => {
      const output = 'word '.repeat(10);
      const result = runCodeGrader(output, { min_word_count: 500 });
      expect(result.passed).toBe(false);
    });
  });

  describe('no_placeholder_text', () => {
    it('should pass for clean output', () => {
      const output = 'This is a complete document with real content.';
      const result = runCodeGrader(output, { no_placeholder_text: true });
      expect(result.passed).toBe(true);
    });

    it('should fail for {UPPERCASE_PLACEHOLDER} patterns', () => {
      const output = 'The company has {TAM_ESTIMATE} total addressable market.';
      const result = runCodeGrader(output, { no_placeholder_text: true });
      expect(result.passed).toBe(false);
    });

    it('should pass for lowercase curly brace content like {token}', () => {
      const output = 'The API accepts a {token} parameter for authentication.';
      const result = runCodeGrader(output, { no_placeholder_text: true });
      expect(result.passed).toBe(true);
    });

    it('should fail for [TODO] markers', () => {
      const output = 'Revenue model: [TODO] fill in later.';
      const result = runCodeGrader(output, { no_placeholder_text: true });
      expect(result.passed).toBe(false);
    });

    it('should ignore placeholders inside code blocks', () => {
      const output = 'Here is example code:\n```\nconst x = {FIELD_NAME};\n```\nThe end.';
      const result = runCodeGrader(output, { no_placeholder_text: true });
      expect(result.passed).toBe(true);
    });
  });

  describe('contains', () => {
    it('should pass when all strings are present', () => {
      const output = 'This document covers AI and enterprise solutions.';
      const result = runCodeGrader(output, { contains: ['AI', 'enterprise'] });
      expect(result.passed).toBe(true);
    });

    it('should be case-insensitive', () => {
      const output = 'We use artificial intelligence.';
      const result = runCodeGrader(output, { contains: ['Artificial Intelligence'] });
      expect(result.passed).toBe(true);
    });

    it('should fail when a string is missing', () => {
      const output = 'This document covers AI solutions.';
      const result = runCodeGrader(output, { contains: ['AI', 'blockchain'] });
      expect(result.passed).toBe(false);
    });
  });

  describe('not_contains', () => {
    it('should pass when forbidden strings are absent', () => {
      const output = 'Clean content here.';
      const result = runCodeGrader(output, { not_contains: ['[insert', 'placeholder'] });
      expect(result.passed).toBe(true);
    });

    it('should fail when forbidden string is present', () => {
      const output = 'Please [insert your company name] here.';
      const result = runCodeGrader(output, { not_contains: ['[insert'] });
      expect(result.passed).toBe(false);
    });
  });

  describe('conversation checks', () => {
    it('should detect minimum turns via --- separators', () => {
      const output = 'Turn 1\n\n---\n\nTurn 2\n\n---\n\nTurn 3';
      const result = runCodeGrader(output, { min_turns: 3 });
      expect(result.passed).toBe(true);
    });

    it('should fail when too few turns', () => {
      const output = 'Only one turn here.';
      const result = runCodeGrader(output, { min_turns: 3 });
      expect(result.passed).toBe(false);
    });

    it('should detect questions via ? character', () => {
      const output = 'What is your target market?';
      const result = runCodeGrader(output, { contains_questions: true });
      expect(result.passed).toBe(true);
    });

    it('should fail when no questions present', () => {
      const output = 'This is a statement without any questions.';
      const result = runCodeGrader(output, { contains_questions: true });
      expect(result.passed).toBe(false);
    });
  });

  describe('combined checks', () => {
    it('should pass when all checks pass', () => {
      const output = '## Executive Summary\n' + 'word '.repeat(500) + '\nAI enterprise solutions.';
      const result = runCodeGrader(output, {
        sections_present: ['Executive Summary'],
        min_word_count: 100,
        no_placeholder_text: true,
        contains: ['AI', 'enterprise'],
      });
      expect(result.passed).toBe(true);
    });

    it('should fail if any check fails', () => {
      const output = '## Executive Summary\nShort. {PLACEHOLDER_TEXT}';
      const result = runCodeGrader(output, {
        sections_present: ['Executive Summary'],
        min_word_count: 500,
        no_placeholder_text: true,
      });
      expect(result.passed).toBe(false);
    });
  });
});
