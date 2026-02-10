import { describe, it, expect } from 'vitest';
import { parseGraderResponse } from './model-based';

describe('parseGraderResponse', () => {
  it('should parse pure JSON response', () => {
    const response = '{"scores": {"quality": 0.8}, "overall": 0.8, "feedback": "Good."}';
    const result = parseGraderResponse(response);
    expect(result.overall).toBe(0.8);
    expect(result.scores).toEqual({ quality: 0.8 });
    expect(result.feedback).toBe('Good.');
  });

  it('should parse JSON wrapped in markdown code fence', () => {
    const response =
      '```json\n{"scores": {"quality": 0.9}, "overall": 0.9, "feedback": "Great."}\n```';
    const result = parseGraderResponse(response);
    expect(result.overall).toBe(0.9);
  });

  it('should parse JSON wrapped in code fence without language tag', () => {
    const response = '```\n{"scores": {"quality": 0.7}, "overall": 0.7, "feedback": "OK."}\n```';
    const result = parseGraderResponse(response);
    expect(result.overall).toBe(0.7);
  });

  it('should parse JSON with surrounding text', () => {
    const response =
      'Here is my evaluation:\n{"scores": {"quality": 0.6}, "overall": 0.6, "feedback": "Needs work."}\nEnd.';
    const result = parseGraderResponse(response);
    expect(result.overall).toBe(0.6);
  });

  it('should parse JSON with whitespace padding', () => {
    const response = '\n  {"scores": {"quality": 0.85}, "overall": 0.85, "feedback": "Solid."}\n  ';
    const result = parseGraderResponse(response);
    expect(result.overall).toBe(0.85);
  });

  it('should throw for response with no JSON', () => {
    const response = 'This is just text with no JSON at all.';
    expect(() => parseGraderResponse(response)).toThrow('No valid grader JSON');
  });

  it('should throw for JSON missing required fields', () => {
    const response = '{"scores": {"quality": 0.8}}';
    expect(() => parseGraderResponse(response)).toThrow('No valid grader JSON');
  });

  it('should throw for JSON with wrong types', () => {
    const response = '{"scores": {"quality": 0.8}, "overall": "high", "feedback": "Good."}';
    expect(() => parseGraderResponse(response)).toThrow('No valid grader JSON');
  });

  it('should handle multiple dimensions in scores', () => {
    const response = JSON.stringify({
      scores: { specificity: 0.9, coherence: 0.8, completeness: 0.7, actionability: 0.85 },
      overall: 0.81,
      feedback: 'Well-structured document.',
    });
    const result = parseGraderResponse(response);
    expect(Object.keys(result.scores)).toHaveLength(4);
    expect(result.overall).toBe(0.81);
  });
});
