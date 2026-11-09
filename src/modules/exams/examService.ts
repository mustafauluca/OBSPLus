import { Exam, ExamAttempt } from '../../types';

export const GRADUATION_EXAM: Exam = {
  id: 'yok-bitirme-yeterlilik',
  title: 'YÖK Bitirme ve İntibak Yeterlilik Sınavı',
  departmentId: 'all',
  durationMinutes: 15,
  totalQuestions: 5,
  passScore: 60,
  questions: [
    {
      id: 'q1',
      text: 'Yükseköğretim Kanunu (YÖK) intibak mevzuatına göre mezuniyet için asgari kaç AKTS kredisinin ve staj/bitirme projesinin başarıyla tamamlanması zorunludur?',
      options: [
        'Ön Lisans için 120 AKTS, Lisans için 240 AKTS',
        'Ön Lisans için 60 AKTS, Lisans için 120 AKTS',
        'Ön Lisans için 180 AKTS, Lisans için 360 AKTS',
        'Her iki program için de 100 AKTS yeterlidir',
      ],
      correctIndex: 0,
    },
    {
      id: 'q2',
      text: 'Öğrenci Bilgi Sistemi (OBS) üzerinde genel not ortalamasının (GNO) mezuniyet şartını sağlaması için asgari kaç olması gerekir?',
      options: [
        'En az 1.50 / 4.00',
        'En az 2.00 / 4.00',
        'En az 2.50 / 4.00',
        'En az 3.00 / 4.00',
      ],
      correctIndex: 1,
    },
    {
      id: 'q3',
      text: 'Öğrenci Affı ve İntibak Komisyonu incelemesinde daha önce başarısız olunan (FF) dersler için uygulanan yasal prosedür hangisidir?',
      options: [
        'Dersler kayıttan tamamen silinir ve ücret iadesi yapılır',
        'Derslerin eksik kredileri tespit edilerek akademik koçluk ve sınavlarla başarılı seviyeye getirilir',
        'Öğrencinin tüm üniversiteye baştan 1. sınıftan başlaması gerekir',
        'Dersler sınava girilmeksizin doğrudan AA olarak onaylanır',
      ],
      correctIndex: 1,
    },
    {
      id: 'q4',
      text: 'Akademik etik ve bilimsel intihal (plagiarism) kurallarına göre hazırlanan bitirme projesi / tez çalışmasında kabul edilebilir maksimum benzerlik oranı genel olarak ne kadardır?',
      options: [
        '%50 ve üzeri',
        '%20-%25 ve altı (Turnitin/iThenticate raporu ile)',
        '%75 ve altı',
        'Benzerlik oranına bakılmaz',
      ],
      correctIndex: 1,
    },
    {
      id: 'q5',
      text: 'Resmi mezuniyet işlemleri tamamlandıktan sonra asıl diploma tanzim edilene kadar yasal olarak diplomanın yerine geçen resmi belgenin adı nedir?',
      options: [
        'Öğrenci Belgesi',
        'Geçici Mezuniyet Belgesi (e-Devlet Onaylı)',
        'Disiplin Sicil Kaydı',
        'Kayıt Yenileme Makbuzu',
      ],
      correctIndex: 1,
    },
  ],
};

const EXAM_ATTEMPTS_STORAGE_KEY = 'diplomatr_exam_attempts';

export function getStoredExamAttempts(studentId?: string): ExamAttempt[] {
  try {
    const raw = localStorage.getItem(EXAM_ATTEMPTS_STORAGE_KEY);
    if (raw) {
      const all: ExamAttempt[] = JSON.parse(raw);
      if (studentId) {
        return all.filter(a => String(a.studentId) === String(studentId));
      }
      return all;
    }
  } catch {
    // fallback
  }
  return [];
}

export function saveExamAttempt(attempt: ExamAttempt): void {
  try {
    const all = getStoredExamAttempts();
    const updated = [attempt, ...all.filter(a => a.id !== attempt.id)];
    localStorage.setItem(EXAM_ATTEMPTS_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save exam attempt:', err);
  }
}
