export type ProgramType = '2 Yıllık (Ön Lisans)' | '4 Yıllık (Lisans)';

export type StudentStatus =
  | 'active'              // Aktif Öğrenci
  | 'passive'             // Pasif Kayıt / Kayıt Yenileme Bekleyen
  | 'dismissed_amnesty';  // Kaydı Silinmiş / Öğrenci Affından Yararlanan

export type PhotoApprovalStatus = 'none' | 'pending' | 'approved' | 'rejected';

export interface UserAccount {
  id: string;
  email: string;
  tcNo: string;
  fullName: string;
  role: 'student' | 'admin' | 'advisor';
  passwordHash: string;
  password_text?: string;
  phone?: string;
  registerIp: string;
  lastLoginIp: string;
  createdAt: string;
  lastLoginAt: string;
  studentId?: string;
}

export type AuditAction =
  | 'register'
  | 'login'
  | 'logout'
  | 'grade_update'
  | 'transcript_submit'
  | 'advisor_review'
  | 'commitment_sign'
  | 'exam_submit'
  | 'id_card_download'
  | 'diploma_download'
  | 'university_add'
  | 'university_delete'
  | 'photo_upload'
  | 'photo_approved'
  | 'photo_rejected'
  | 'click_tracked'
  | 'past_exam_upload'
  | 'course_enroll'
  | 'term_freeze'
  | 'amnesty_apply'
  | string;

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: 'student' | 'admin' | 'advisor' | 'system';
  action: AuditAction;
  ipAddress: string;
  details: string;
}

export interface University {
  id: string;
  code: string;
  name: string;
  city: string;
  rectorName: string;
  deanName: string;
  sealColor: string;
  badgeBg: string;
  establishedYear: number;
}

export interface CourseDefinition {
  code: string;
  name: string;
  term: number;
  akts: number;
  credit: number;
  isMandatory: boolean;
}

export interface Department {
  id: string;
  name: string;
  type: ProgramType;
  faculty: string;
  totalSemesters: number;
  totalAkts: number;
  termFee: number;
  perCreditFee: number;
  courses: CourseDefinition[];
  thesisTopics: string[];
}

export interface CourseGrade {
  code: string;
  name: string;
  term: number;
  akts: number;
  credit: number;
  midterm: number;        // Vize
  final: number;          // Final
  makeup?: number;        // Bütünleme
  letterGrade: 'AA' | 'BA' | 'BB' | 'CB' | 'CC' | 'DC' | 'DD' | 'FF';
  gradePoint: number;
  passed: boolean;
  status: 'passed' | 'failed' | 'coached_passed' | 'student_entered';
}

export interface FinancialBreakdown {
  unpaidTuitionYears: number;
  unpaidSemestersCount: number;
  semesterFee: number;
  totalTuitionDebt: number;       // Kaç yıl geriden gelmişse ödenmemiş harçların tümü
  missingCoursesCount: number;
  missingAktsTotal: number;
  totalCoursesFee: number;        // Eksik derslerin toplam ücreti
  scholarshipDebt: number;        // 10.000 TL burs geri ödeme varsayımı
  totalPayable: number;           // Genel toplam
}

export interface TranscriptSubmission {
  id: string;
  studentId: string;
  studentName: string;
  departmentName: string;
  submittedAt: string;
  studentNote: string;
  status: 'pending' | 'reviewed' | 'approved';
  advisorFeedback?: string;
  fileUrl?: string;
  fileName?: string;
}

export interface Course {
  id: number;
  title: string;
  code?: string;
  slug: string;
  category: string;
  description: string;
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
}

export interface Topic {
  id: number;
  courseId: number;
  title: string;
  slug: string;
  shortSummary: string;
  contentHtml: string;
  videoId?: string;           // Saf YouTube Video ID (örn: dQw4w9WgXcQ)
  videoUrl?: string;          // Geriye dönük uyumluluk
  videoFileUrl?: string;      // Yüklenen MP4/WebM video
  videoFileName?: string;
  pdfFileUrl?: string;        // Yüklenen ders PDF notu
  pdfFileName?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface QuestionOption {
  id: number;
  questionId: number;
  optionKey: string;
  optionText: string;
  isCorrect: boolean;
}

export interface Question {
  id: number;
  courseId: number;
  topicId?: number;
  questionText: string;
  points: number;
  explanation: string;
  options: QuestionOption[];
}

export interface ExamQuestion {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
}

export interface Exam {
  id: number | string;
  courseId?: number;
  departmentId?: string;
  courseCode?: string;
  title: string;
  description?: string;
  durationMinutes: number;
  passingGrade?: number;
  passScore?: number;
  questionCount?: number;
  totalQuestions?: number;
  maxAttempts?: number;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  questions?: ExamQuestion[];
}

export interface ExamAttempt {
  id: number | string;
  studentId: number | string;
  studentNo?: string;
  studentName: string;
  examType?: 'quiz' | 'exam';
  targetId?: number | string;
  targetTitle?: string;
  score: number;
  correctCount?: number;
  wrongCount?: number;
  emptyCount?: number;
  passed: boolean;
  completedAt?: string;
  attemptDate?: string;
  certificateNumber?: string;
  examId?: string | number;
  examTitle?: string;
  answers?: {
    questionId: number;
    questionText: string;
    chosenKey?: string;
    chosenText?: string;
    correctKey: string;
    correctText: string;
    isCorrect: boolean;
    explanation?: string;
  }[];
}

export interface Student {
  id: number;
  studentNo: string;
  studentNumber?: string;     // Alias for studentNo
  userId?: string;            // Alias for id as string
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;              // Zorunlu telefon numarası
  password_text: string;      // Veritabanında çıplak / plain-text parola
  passwordHash?: string;
  tcNo?: string;
  age?: number;
  bloodType?: string;
  universityId?: string;
  departmentId?: string;
  currentClass?: string;
  delayedYears?: number;
  avatarUrl: string;          // Onaylanmış aktif profil fotoğrafı
  pendingAvatarUrl?: string;  // Admin onayı bekleyen fotoğraf
  photoStatus: PhotoApprovalStatus;
  status: StudentStatus;
  totalScore: number;
  allowScoreboard: boolean;
  assignedAdvisor?: string;
  thesisTopic?: string;
  hasCommitted?: boolean;
  isGraduated?: boolean;
  graduationDate?: string;
  diplomaNumber?: string;
  registrationDate?: string;
  gpa: number;
  courses: CourseGrade[];
  financials: FinancialBreakdown;
  transcriptSubmissions?: TranscriptSubmission[];
  examAttempts?: ExamAttempt[];
  createdAt: string;
  registerIp?: string;
  lastLoginIp?: string;
}

// StudentProfile alias for compatibility
export type StudentProfile = Student;

// Click tracking log for all visitors & users
export interface ClickLog {
  id: number;
  ipAddress: string;
  username?: string;          // Login olduysa öğrenciNo veya admin/ad soyad
  userRole: 'guest' | 'student' | 'admin' | 'advisor';
  elementTag: string;
  elementText: string;
  elementId?: string;
  pageTitle: string;
  pageUrl: string;
  clickX?: number;
  clickY?: number;
  createdAt: string;
}

// Çıkmış Sorular (Past Exams & Questions)
export interface PastExam {
  id: number;
  courseId: number;
  courseTitle: string;
  courseName?: string;
  courseCode?: string;
  title: string;
  examType?: string;
  year: string;               // örn: '2024 Vize', '2023 Final', '2023 Bütünleme'
  term: string;               // Güz / Bahar / Yaz
  fileUrl: string;
  fileName: string;
  fileSize?: string;
  downloadCount: number;
  uploadedAt: string;
}

export interface VisitorLog {
  id: number;
  ipAddress: string;
  pageTitle: string;
  pageUrl: string;
  referrer: string;
  browser: string;
  os: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  studentId?: number;
  studentNo?: string;
  username?: string;
  visitDate: string;
  visitTime: string;
}

export interface LoginLog {
  id: number;
  studentNo: string;
  fullNameEntered: string;
  ipAddress: string;
  browser: string;
  deviceType: string;
  status: 'success' | 'failed';
  failureReason?: string;
  createdAt: string;
}

export interface RegisterLog {
  id: number;
  studentNo: string;
  fullName: string;
  email: string;
  phone: string;
  ipAddress: string;
  status: 'active' | 'pending' | 'success' | 'failed';
  verificationStatus: 'verified' | 'unverified';
  failureReason?: string;
  createdAt: string;
}

export interface TeamMember {
  id: number;
  fullName: string;
  roleTitle: string;
  photoUrl: string;
  biography: string;
  education: string;
  specialties: string;
  sortOrder: number;
  isActive: boolean;
  isDemo?: boolean;
}

export interface SiteSettings {
  siteName?: string;
  siteTitle: string;
  siteSubtitle?: string;
  siteDescription?: string;
  metaDescription: string;
  heroHeadline: string;
  heroDescription: string;
  footerText?: string;
  kvkkText?: string;
  aboutSummary?: string;
  dataRetentionDays?: number;
  rateLimitMaxAttempts?: number;
  rateLimitBlockMinutes?: number;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  defaultPassingGrade: number;
  bankName?: string;
  iban?: string;
  accountHolder?: string;
  paymentInstructions?: string;
}

export interface ContactSettings {
  phone: string;
  email: string;
  address: string;
  whatsapp?: string;
  whatsappNumber?: string;
  mapEmbedUrl?: string;
  facebook?: string;
  facebookUrl?: string;
  twitter?: string;
  twitterUrl?: string;
  instagram?: string;
  instagramUrl?: string;
  linkedin?: string;
  linkedinUrl?: string;
  youtube?: string;
  youtubeUrl?: string;
  workingHours: string;
}

export interface ScoreboardEntry {
  courseId: number;
  courseTitle: string;
  category: string;
  maskedName: string;
  realName: string;
  totalPoints: number;
  successRate: number;
  examCount: number;
}
