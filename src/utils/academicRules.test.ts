import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateStudentNumber,
  generateTcNo,
  scoreToLetter,
  calculateGPA,
  calculateFinancials,
  applyCoachingRemediation,
  formatTL,
} from './academicRules';
import { DEPARTMENTS } from '../data/departmentsAndUniversities';
import { CourseGrade } from '../types';

test('Student number generation produces deterministic 10-digit number', () => {
  const num1 = generateStudentNumber('AÜ', 'bilgisayar-programciligi', 24, 'Ahmet Yılmaz');
  const num2 = generateStudentNumber('AÜ', 'bilgisayar-programciligi', 24, 'Ahmet Yılmaz');
  assert.equal(num1, num2);
  assert.equal(num1.length, 10);
  assert.ok(num1.startsWith('20'));
});

test('TC No generator returns realistic 11-digit Turkish identity string', () => {
  const tc = generateTcNo('Ayşe Demir', 22);
  assert.equal(tc.length, 11);
  assert.ok(/^\d{11}$/.test(tc));
});

test('Grading system correctly assigns letter grades and grade points', () => {
  // 90 and above -> AA 4.0
  const aa = scoreToLetter(95, 90);
  assert.equal(aa.letterGrade, 'AA');
  assert.equal(aa.gradePoint, 4.0);
  assert.equal(aa.passed, true);

  // 74-81 -> BB 3.0
  const bb = scoreToLetter(75, 75);
  assert.equal(bb.letterGrade, 'BB');
  assert.equal(bb.gradePoint, 3.0);
  assert.equal(bb.passed, true);

  // Below 45 -> FF 0.0
  const ff = scoreToLetter(30, 40);
  assert.equal(ff.letterGrade, 'FF');
  assert.equal(ff.gradePoint, 0.0);
  assert.equal(ff.passed, false);
});

test('Financial calculation accurately tallies delayed tuition, courses fee, and 10,000 TL scholarship debt', () => {
  // 2 years delayed, term fee = 2000 TL, 4 terms unpaid = 8000 TL
  // 10 AKTS missing
  const fin = calculateFinancials(2, 2, 10, 2000, 250, 'dismissed_amnesty');
  
  assert.equal(fin.unpaidTuitionYears, 2);
  assert.equal(fin.unpaidSemestersCount, 4);
  assert.equal(fin.totalTuitionDebt, 8000);
  assert.equal(fin.scholarshipDebt, 10000); // 10,000 TL mandatory requirement
  assert.ok(fin.totalPayable > 18000);
});

test('Coaching remediation turns failed courses into passed with passing bonus scores', () => {
  const failedCourses: CourseGrade[] = [
    {
      code: 'BLP101',
      name: 'Programlama Temelleri',
      term: 1,
      akts: 6,
      credit: 3,
      midterm: 30,
      final: 35,
      letterGrade: 'FF',
      gradePoint: 0.0,
      passed: false,
      status: 'failed',
    },
  ];

  const remediated = applyCoachingRemediation(failedCourses);
  assert.equal(remediated[0].passed, true);
  assert.equal(remediated[0].status, 'coached_passed');
  assert.ok(remediated[0].midterm >= 70);
  assert.ok(remediated[0].final >= 76);
  assert.ok(remediated[0].gradePoint >= 2.5); // At least CB or BB
});

test('GPA calculation produces weighted average of grade points and AKTS', () => {
  const sampleCourses: CourseGrade[] = [
    {
      code: 'C1',
      name: 'Ders 1',
      term: 1,
      akts: 5,
      credit: 3,
      midterm: 90,
      final: 90,
      letterGrade: 'AA',
      gradePoint: 4.0,
      passed: true,
      status: 'passed',
    },
    {
      code: 'C2',
      name: 'Ders 2',
      term: 1,
      akts: 5,
      credit: 3,
      midterm: 75,
      final: 75,
      letterGrade: 'BB',
      gradePoint: 3.0,
      passed: true,
      status: 'passed',
    },
  ];

  // (4.0 * 5 + 3.0 * 5) / 10 = 3.50
  const gpa = calculateGPA(sampleCourses);
  assert.equal(gpa, 3.5);
});

test('All 14 required departments exist in catalog (6 associate, 8 bachelor)', () => {
  const associate = DEPARTMENTS.filter(d => d.type === '2 Yıllık (Ön Lisans)');
  const bachelor = DEPARTMENTS.filter(d => d.type === '4 Yıllık (Lisans)');
  assert.equal(associate.length, 6);
  assert.equal(bachelor.length, 8);
});
