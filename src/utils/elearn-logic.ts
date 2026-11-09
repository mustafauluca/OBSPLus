/**
 * E-LEARN İş Mantığı ve Saf Fonksiyonlar
 * Unit test edilebilir kurallar ve hesaplamalar
 */

export interface QuestionAnswer {
  questionId: number;
  points: number;
  correctOptionKey: string;
  selectedOptionKey?: string;
}

export interface ExamResultSummary {
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  emptyCount: number;
  totalPoints: number;
  earnedPoints: number;
  scorePercentage: number;
  passed: boolean;
}

/**
 * KVKK Uyumlu İsim Maskeleme
 * Örn: "Ahmet Yılmaz" -> "Ahmet Y."
 */
export function maskStudentName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return '';
  if (parts.length === 1) return parts[0];
  const firstName = parts.slice(0, -1).join(' ');
  const lastName = parts[parts.length - 1];
  const lastInitial = lastName.charAt(0).toUpperCase();
  return `${firstName} ${lastInitial}.`;
}

/**
 * Sınav / Test Puanı Hesaplayıcı
 */
export function evaluateExamAnswers(
  answers: QuestionAnswer[],
  passingGrade: number = 50
): ExamResultSummary {
  let correctCount = 0;
  let wrongCount = 0;
  let emptyCount = 0;
  let totalPoints = 0;
  let earnedPoints = 0;

  for (const a of answers) {
    totalPoints += a.points;
    if (!a.selectedOptionKey) {
      emptyCount++;
    } else if (a.selectedOptionKey === a.correctOptionKey) {
      correctCount++;
      earnedPoints += a.points;
    } else {
      wrongCount++;
    }
  }

  const scorePercentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100 * 100) / 100 : 0;
  const passed = scorePercentage >= passingGrade;

  return {
    totalQuestions: answers.length,
    correctCount,
    wrongCount,
    emptyCount,
    totalPoints,
    earnedPoints,
    scorePercentage,
    passed
  };
}

/**
 * Başarısız Giriş Sayısına Göre Rate Limit Kontrolü
 */
export function checkRateLimit(
  failedAttempts: number,
  maxAttempts: number = 5,
  blockMinutes: number = 15
): { isBlocked: boolean; remainingAttempts: number; blockDurationMinutes: number } {
  const isBlocked = failedAttempts >= maxAttempts;
  const remainingAttempts = Math.max(0, maxAttempts - failedAttempts);
  return {
    isBlocked,
    remainingAttempts,
    blockDurationMinutes: blockMinutes
  };
}

/**
 * Öğrenci Sıralama Hesaplayıcı
 */
export function calculateStudentRank(
  targetScore: number,
  allScores: number[]
): number {
  let rank = 1;
  for (const score of allScores) {
    if (score > targetScore) {
      rank++;
    }
  }
  return rank;
}
