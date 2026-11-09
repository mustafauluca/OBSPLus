import test from 'node:test';
import assert from 'node:assert/strict';
import {
  maskStudentName,
  evaluateExamAnswers,
  checkRateLimit,
  calculateStudentRank,
  type QuestionAnswer
} from './elearn-logic';

test('maskStudentName properly formats names according to KVKK rules', () => {
  assert.equal(maskStudentName('Ahmet Yılmaz'), 'Ahmet Y.');
  assert.equal(maskStudentName('Mehmet Ali Kaya'), 'Mehmet Ali K.');
  assert.equal(maskStudentName('Ayşe'), 'Ayşe');
  assert.equal(maskStudentName(''), '');
});

test('evaluateExamAnswers calculates score, corrects, wrongs, and passing status', () => {
  const answers: QuestionAnswer[] = [
    { questionId: 1, points: 20, correctOptionKey: 'A', selectedOptionKey: 'A' }, // correct
    { questionId: 2, points: 20, correctOptionKey: 'B', selectedOptionKey: 'C' }, // wrong
    { questionId: 3, points: 20, correctOptionKey: 'C', selectedOptionKey: undefined }, // empty
    { questionId: 4, points: 20, correctOptionKey: 'D', selectedOptionKey: 'D' }, // correct
    { questionId: 5, points: 20, correctOptionKey: 'A', selectedOptionKey: 'A' }, // correct
  ];

  const result = evaluateExamAnswers(answers, 50);

  assert.equal(result.totalQuestions, 5);
  assert.equal(result.correctCount, 3);
  assert.equal(result.wrongCount, 1);
  assert.equal(result.emptyCount, 1);
  assert.equal(result.totalPoints, 100);
  assert.equal(result.earnedPoints, 60);
  assert.equal(result.scorePercentage, 60);
  assert.equal(result.passed, true);
});

test('evaluateExamAnswers marks as failed if below passing grade', () => {
  const answers: QuestionAnswer[] = [
    { questionId: 1, points: 50, correctOptionKey: 'A', selectedOptionKey: 'B' },
    { questionId: 2, points: 50, correctOptionKey: 'B', selectedOptionKey: 'B' },
  ];

  const result = evaluateExamAnswers(answers, 60);
  assert.equal(result.earnedPoints, 50);
  assert.equal(result.scorePercentage, 50);
  assert.equal(result.passed, false);
});

test('checkRateLimit accurately blocks after max attempts', () => {
  const safe = checkRateLimit(2, 5, 15);
  assert.equal(safe.isBlocked, false);
  assert.equal(safe.remainingAttempts, 3);

  const blocked = checkRateLimit(5, 5, 15);
  assert.equal(blocked.isBlocked, true);
  assert.equal(blocked.remainingAttempts, 0);
  assert.equal(blocked.blockDurationMinutes, 15);
});

test('calculateStudentRank ranks top and intermediate scores correctly', () => {
  const scores = [985, 940, 920, 895, 750];
  assert.equal(calculateStudentRank(985, scores), 1);
  assert.equal(calculateStudentRank(940, scores), 2);
  assert.equal(calculateStudentRank(900, scores), 4);
  assert.equal(calculateStudentRank(600, scores), 6);
});
