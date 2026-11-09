import { CourseGrade, Department, FinancialBreakdown, StudentProfile, StudentStatus, University } from '../types';
import { CONSULTANTS_AND_STAFF } from '../data/departmentsAndUniversities';

// Deterministic hash utility for repeatable realistic numbers
export function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Generate realistic 11-digit Turkish TC ID number
export function generateTcNo(name: string, age: number): string {
  const seed = simpleHash(name + age);
  const base = 100000000 + (seed % 899999999);
  return `${base}28`;
}

// Generate authentic student number: e.g. 2022104082
export function generateStudentNumber(
  uniCode: string,
  deptId: string,
  age: number,
  fullName: string
): string {
  const currentYear = 2026;
  const startYear = Math.max(2018, currentYear - Math.max(1, Math.floor((age - 18) / 2)));
  const uniNum = (simpleHash(uniCode) % 90) + 10;
  const deptNum = (simpleHash(deptId) % 900) + 100;
  const seq = (simpleHash(fullName + age) % 900) + 100;
  return `${startYear}${uniNum}${deptNum}${seq}`.substring(0, 10);
}

// Grade calculation helper
export function scoreToLetter(midterm: number, final: number): {
  letterGrade: 'AA' | 'BA' | 'BB' | 'CB' | 'CC' | 'DC' | 'DD' | 'FF';
  gradePoint: number;
  passed: boolean;
} {
  const score = Math.round(midterm * 0.4 + final * 0.6);
  if (score >= 90) return { letterGrade: 'AA', gradePoint: 4.0, passed: true };
  if (score >= 82) return { letterGrade: 'BA', gradePoint: 3.5, passed: true };
  if (score >= 74) return { letterGrade: 'BB', gradePoint: 3.0, passed: true };
  if (score >= 65) return { letterGrade: 'CB', gradePoint: 2.5, passed: true };
  if (score >= 58) return { letterGrade: 'CC', gradePoint: 2.0, passed: true };
  if (score >= 50) return { letterGrade: 'DC', gradePoint: 1.5, passed: true };
  if (score >= 45) return { letterGrade: 'DD', gradePoint: 1.0, passed: true };
  return { letterGrade: 'FF', gradePoint: 0.0, passed: false };
}

// Generate initial curriculum with intentional failed / missing courses to be remediated by coaching
export function generateInitialCurriculum(
  dept: Department,
  currentClass: string,
  delayedYears: number,
  status: StudentStatus,
  fullName: string
): CourseGrade[] {
  const seed = simpleHash(fullName + dept.id);
  
  // Decide how many terms student has taken
  let maxCompletedTerm = 2;
  if (currentClass.includes('2')) maxCompletedTerm = dept.totalSemesters >= 4 ? 3 : 2;
  if (currentClass.includes('3')) maxCompletedTerm = 5;
  if (currentClass.includes('4')) maxCompletedTerm = 7;
  if (currentClass.includes('Uzatmalı')) maxCompletedTerm = dept.totalSemesters;

  const result: CourseGrade[] = [];

  dept.courses.forEach((course, idx) => {
    // If student hasn't reached this semester yet, mark as not taken/failed
    const isPastTerm = course.term <= maxCompletedTerm;
    const pseudoRandom = ((seed * (idx + 13)) % 100);

    if (!isPastTerm) {
      // Future or missing course
      result.push({
        code: course.code,
        name: course.name,
        term: course.term,
        akts: course.akts,
        credit: course.credit,
        midterm: 0,
        final: 0,
        letterGrade: 'FF',
        gradePoint: 0,
        passed: false,
        status: 'failed',
      });
      return;
    }

    // For past terms:
    // If status is dismissed (af) or delayed years > 0, make 3-5 courses failed
    const shouldFail = (status === 'dismissed_amnesty' && (idx % 3 === 0)) ||
      (status === 'passive' && (idx % 4 === 0)) ||
      (delayedYears > 0 && pseudoRandom < (25 + delayedYears * 8));

    if (shouldFail) {
      const midterm = 25 + (pseudoRandom % 22);
      const final = 30 + (pseudoRandom % 18);
      result.push({
        code: course.code,
        name: course.name,
        term: course.term,
        akts: course.akts,
        credit: course.credit,
        midterm,
        final,
        makeup: 38,
        letterGrade: 'FF',
        gradePoint: 0,
        passed: false,
        status: 'failed',
      });
    } else {
      // Passed with realistic distribution
      const scoreTiers = [
        { mid: 88, fin: 92 }, // AA
        { mid: 80, fin: 85 }, // BA
        { mid: 74, fin: 78 }, // BB
        { mid: 68, fin: 70 }, // CB
        { mid: 60, fin: 64 }, // CC
      ];
      const tier = scoreTiers[pseudoRandom % scoreTiers.length];
      const graded = scoreToLetter(tier.mid, tier.fin);
      result.push({
        code: course.code,
        name: course.name,
        term: course.term,
        akts: course.akts,
        credit: course.credit,
        midterm: tier.mid,
        final: tier.fin,
        letterGrade: graded.letterGrade,
        gradePoint: graded.gradePoint,
        passed: true,
        status: 'passed',
      });
    }
  });

  return result;
}

// Calculate GPA across all courses
export function calculateGPA(courses: CourseGrade[]): number {
  let totalAkts = 0;
  let weightedPoints = 0;

  courses.forEach(c => {
    totalAkts += c.akts;
    weightedPoints += c.gradePoint * c.akts;
  });

  if (totalAkts === 0) return 0.0;
  return Number((weightedPoints / totalAkts).toFixed(2));
}

// Calculate financial breakdown
export function calculateFinancials(
  delayedYears: number,
  missingCoursesCount: number,
  missingAktsTotal: number,
  termFee: number,
  perCreditFee: number,
  status: StudentStatus
): FinancialBreakdown {
  // If delayed, student owes tuition for each delayed year (2 semesters per year)
  // If passive, minimum 1 term renewal fee even if delayedYears is 0
  let unpaidSemesters = delayedYears * 2;
  if (unpaidSemesters === 0 && (status === 'passive' || status === 'dismissed_amnesty')) {
    unpaidSemesters = 2;
  }
  const totalTuitionDebt = unpaidSemesters * termFee;

  // Course fee per credit or AKTS for missing courses
  const totalCoursesFee = missingAktsTotal * (perCreditFee * 0.45);

  // Prompt requirement: "tüm öğrencilerin 10.000,00-TL öğrenim bursu aldığını varsayıyoruz bursuda geri ödemesini hesaplayacak"
  const scholarshipDebt = 10000;

  const totalPayable = totalTuitionDebt + Math.round(totalCoursesFee) + scholarshipDebt;

  return {
    unpaidTuitionYears: delayedYears,
    unpaidSemestersCount: unpaidSemesters,
    semesterFee: termFee,
    totalTuitionDebt,
    missingCoursesCount,
    missingAktsTotal,
    totalCoursesFee: Math.round(totalCoursesFee),
    scholarshipDebt,
    totalPayable,
  };
}

// Coach remediation: "geçme notu ve biraz fazlası için seçilen derslere sınav notları ataması yapacak"
export function applyCoachingRemediation(courses: CourseGrade[]): CourseGrade[] {
  return courses.map(c => {
    if (!c.passed || c.status === 'failed') {
      // Assign passing grades + a bit extra (vize: 68-76, final: 74-84 -> CB, BB, BA)
      const bonus = (simpleHash(c.code) % 10);
      const midterm = 70 + bonus;
      const final = 76 + bonus;
      const { letterGrade, gradePoint } = scoreToLetter(midterm, final);

      return {
        ...c,
        midterm,
        final,
        makeup: undefined,
        letterGrade,
        gradePoint,
        passed: true,
        status: 'coached_passed',
      };
    }
    return c;
  });
}

// Generate thesis topic
export function getDepartmentThesis(dept: Department, name: string): string {
  if (dept.thesisTopics && dept.thesisTopics.length > 0) {
    const idx = simpleHash(name + dept.name) % dept.thesisTopics.length;
    return dept.thesisTopics[idx];
  }
  return `${dept.name} Alanında Dijitalleşme ve Çağdaş Yaklaşımlar İncelemesi`;
}

// Generate student avatar (using high quality UI avatar / initials with aesthetic academic styling)
export function getStudentAvatar(fullName: string): string {
  const encodedName = encodeURIComponent(fullName.trim());
  return `https://ui-avatars.com/api/?name=${encodedName}&background=0f172a&color=f8fafc&size=256&bold=true&font-size=0.45`;
}

// Format currency as Turkish Lira: 10.000,00 TL
export function formatTL(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount).replace('TRY', 'TL');
}
