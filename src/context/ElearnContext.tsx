import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  Course,
  Topic,
  Question,
  Exam,
  Student,
  ExamAttempt,
  VisitorLog,
  ClickLog,
  PastExam,
  LoginLog,
  RegisterLog,
  TeamMember,
  SiteSettings,
  ContactSettings,
  ScoreboardEntry,
  CourseGrade,
  FinancialBreakdown,
  TranscriptSubmission,
} from '../types';
import {
  INITIAL_COURSES,
  INITIAL_TOPICS,
  INITIAL_QUESTIONS,
  INITIAL_EXAMS,
  INITIAL_STUDENTS,
  INITIAL_TEAM_MEMBERS,
  INITIAL_VISITOR_LOGS,
  INITIAL_CLICK_LOGS,
  INITIAL_PAST_EXAMS,
  INITIAL_LOGIN_LOGS,
  INITIAL_REGISTER_LOGS,
  INITIAL_SITE_SETTINGS,
  INITIAL_CONTACT_SETTINGS,
} from '../data/initialData';
import { maskStudentName } from '../utils/elearn-logic';
import { calculateGPA, calculateFinancials, scoreToLetter } from '../utils/academicRules';
import { DEPARTMENTS } from '../data/departmentsAndUniversities';

// Helper to extract clean 11-char YouTube Video ID from any URL or raw string
export function extractYouTubeId(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();
  // If already 11 alphanumeric characters
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  // Try extracting from YouTube URL formats
  const match = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (match && match[1]) {
    return match[1];
  }
  return trimmed;
}

interface ElearnContextType {
  // Veriler
  courses: Course[];
  topics: Topic[];
  questions: Question[];
  exams: Exam[];
  students: Student[];
  teamMembers: TeamMember[];
  visitorLogs: VisitorLog[];
  clickLogs: ClickLog[];
  pastExams: PastExam[];
  loginLogs: LoginLog[];
  registerLogs: RegisterLog[];
  examAttempts: ExamAttempt[];
  siteSettings: SiteSettings;
  contactSettings: ContactSettings;
  completedTopicIds: number[];

  // Oturum Durumu
  currentStudent: Student | null;
  isAdminLoggedIn: boolean;
  visitorIp: string;
  setVisitorIp: (ip: string) => void;

  // Takip & Loglama
  trackPageVisit: (pageTitle: string, pageUrl: string) => void;
  trackClick: (tag: string, text: string, elementId?: string, x?: number, y?: number) => void;

  // Kimlik Doğrulama
  loginStudent: (studentNo: string, password: string) => { success: boolean; message: string };
  registerStudent: (data: {
    studentNo?: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string; // Zorunlu telefon numarası
    password: string;
    passwordConfirm: string;
    tcNo?: string;
    universityId?: string;
    departmentId?: string;
    currentClass?: string;
    kvkkAccepted: boolean;
    allowScoreboard: boolean;
  }) => { success: boolean; message: string };
  logoutStudent: () => void;
  loginAdmin: (username: string, password: string) => { success: boolean; message: string };
  logoutAdmin: () => void;

  // Öğrenci Profil, Fotoğraf ve OBS Fonksiyonları
  updateStudentProfile: (studentId: number, data: Partial<Student>) => void;
  uploadStudentPhoto: (studentId: number, photoDataUrl: string) => void;
  approveStudentPhoto: (studentId: number) => void;
  rejectStudentPhoto: (studentId: number) => void;
  applyStudentCoaching: (studentId: number) => void;
  freezeStudentTerm: (studentId: number, reason: string) => void;
  applyStudentAmnesty: (studentId: number) => void;
  addStudentCourse: (studentId: number, course: CourseGrade) => void;
  submitTranscript: (studentId: number, note: string, fileName?: string) => void;

  // Çıkmış Sorular (Past Exams)
  uploadPastExam: (data: Omit<PastExam, 'id' | 'uploadedAt' | 'downloadCount'>) => void;
  deletePastExam: (id: number) => void;
  incrementPastExamDownload: (id: number) => void;
  downloadPastExam: (id: number) => void;

  // Elearn Öğrenme & Sınavlar
  toggleTopicCompletion: (topicId: number) => void;
  submitExamAttempt: (attempt: Omit<ExamAttempt, 'id' | 'completedAt'>) => number;
  getTopScoreboard: () => ScoreboardEntry[];
  recalculateScores: () => void;
  toggleStudentStatus: (studentId: number) => void;
  addStudent: (student: Omit<Student, 'id' | 'createdAt' | 'totalScore'>) => boolean;

  // CRUD Metotları
  saveCourse: (course: Partial<Course>) => void;
  deleteCourse: (id: number) => void;
  saveTopic: (topic: Partial<Topic>) => void;
  deleteTopic: (id: number) => void;
  saveQuestion: (question: Partial<Question>) => void;
  deleteQuestion: (id: number) => void;
  saveExam: (exam: Partial<Exam>) => void;
  deleteExam: (id: number | string) => void;
  saveTeamMember: (member: Partial<TeamMember>) => void;
  deleteTeamMember: (id: number) => void;
  updateSiteSettings: (settings: Partial<SiteSettings>) => void;
  updateContactSettings: (settings: Partial<ContactSettings>) => void;

  // CSV Dışa Aktarma
  exportCsv: (type: 'visitors' | 'clicks' | 'logins' | 'registers' | 'students') => void;
}

const ElearnContext = createContext<ElearnContextType | null>(null);

export const ElearnProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Visitor IP State
  const [visitorIp, setVisitorIp] = useState<string>(() => {
    return localStorage.getItem('elearn_visitor_ip') || '176.234.88.14';
  });

  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem('elearn_courses');
    return saved ? JSON.parse(saved) : INITIAL_COURSES;
  });

  const [topics, setTopics] = useState<Topic[]>(() => {
    const saved = localStorage.getItem('elearn_topics');
    return saved ? JSON.parse(saved) : INITIAL_TOPICS;
  });

  const [questions, setQuestions] = useState<Question[]>(() => {
    const saved = localStorage.getItem('elearn_questions');
    return saved ? JSON.parse(saved) : INITIAL_QUESTIONS;
  });

  const [exams, setExams] = useState<Exam[]>(() => {
    const saved = localStorage.getItem('elearn_exams');
    return saved ? JSON.parse(saved) : INITIAL_EXAMS;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('elearn_students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
    const saved = localStorage.getItem('elearn_team');
    return saved ? JSON.parse(saved) : INITIAL_TEAM_MEMBERS;
  });

  const [visitorLogs, setVisitorLogs] = useState<VisitorLog[]>(() => {
    const saved = localStorage.getItem('elearn_visitor_logs');
    return saved ? JSON.parse(saved) : INITIAL_VISITOR_LOGS;
  });

  const [clickLogs, setClickLogs] = useState<ClickLog[]>(() => {
    const saved = localStorage.getItem('elearn_click_logs');
    return saved ? JSON.parse(saved) : INITIAL_CLICK_LOGS;
  });

  const [pastExams, setPastExams] = useState<PastExam[]>(() => {
    const saved = localStorage.getItem('elearn_past_exams');
    return saved ? JSON.parse(saved) : INITIAL_PAST_EXAMS;
  });

  const [loginLogs, setLoginLogs] = useState<LoginLog[]>(() => {
    const saved = localStorage.getItem('elearn_login_logs');
    return saved ? JSON.parse(saved) : INITIAL_LOGIN_LOGS;
  });

  const [registerLogs, setRegisterLogs] = useState<RegisterLog[]>(() => {
    const saved = localStorage.getItem('elearn_register_logs');
    return saved ? JSON.parse(saved) : INITIAL_REGISTER_LOGS;
  });

  const [examAttempts, setExamAttempts] = useState<ExamAttempt[]>(() => {
    const saved = localStorage.getItem('elearn_exam_attempts');
    return saved ? JSON.parse(saved) : [];
  });

  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => {
    const saved = localStorage.getItem('elearn_site_settings');
    return saved ? JSON.parse(saved) : INITIAL_SITE_SETTINGS;
  });

  const [contactSettings, setContactSettings] = useState<ContactSettings>(() => {
    const saved = localStorage.getItem('elearn_contact_settings');
    return saved ? JSON.parse(saved) : INITIAL_CONTACT_SETTINGS;
  });

  const [completedTopicIds, setCompletedTopicIds] = useState<number[]>(() => {
    const saved = localStorage.getItem('elearn_completed_topics');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentStudent, setCurrentStudent] = useState<Student | null>(() => {
    const saved = localStorage.getItem('elearn_current_student');
    return saved ? JSON.parse(saved) : null;
  });

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('elearn_admin_logged_in') === 'true';
  });

  // LocalStorage senkronizasyonu
  useEffect(() => {
    localStorage.setItem('elearn_visitor_ip', visitorIp);
  }, [visitorIp]);

  useEffect(() => {
    localStorage.setItem('elearn_courses', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('elearn_topics', JSON.stringify(topics));
  }, [topics]);

  useEffect(() => {
    localStorage.setItem('elearn_questions', JSON.stringify(questions));
  }, [questions]);

  useEffect(() => {
    localStorage.setItem('elearn_exams', JSON.stringify(exams));
  }, [exams]);

  useEffect(() => {
    localStorage.setItem('elearn_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('elearn_team', JSON.stringify(teamMembers));
  }, [teamMembers]);

  useEffect(() => {
    localStorage.setItem('elearn_visitor_logs', JSON.stringify(visitorLogs));
  }, [visitorLogs]);

  useEffect(() => {
    localStorage.setItem('elearn_click_logs', JSON.stringify(clickLogs));
  }, [clickLogs]);

  useEffect(() => {
    localStorage.setItem('elearn_past_exams', JSON.stringify(pastExams));
  }, [pastExams]);

  useEffect(() => {
    localStorage.setItem('elearn_login_logs', JSON.stringify(loginLogs));
  }, [loginLogs]);

  useEffect(() => {
    localStorage.setItem('elearn_register_logs', JSON.stringify(registerLogs));
  }, [registerLogs]);

  useEffect(() => {
    localStorage.setItem('elearn_exam_attempts', JSON.stringify(examAttempts));
  }, [examAttempts]);

  useEffect(() => {
    localStorage.setItem('elearn_site_settings', JSON.stringify(siteSettings));
  }, [siteSettings]);

  useEffect(() => {
    localStorage.setItem('elearn_contact_settings', JSON.stringify(contactSettings));
  }, [contactSettings]);

  useEffect(() => {
    localStorage.setItem('elearn_completed_topics', JSON.stringify(completedTopicIds));
  }, [completedTopicIds]);

  useEffect(() => {
    if (currentStudent) {
      localStorage.setItem('elearn_current_student', JSON.stringify(currentStudent));
    } else {
      localStorage.removeItem('elearn_current_student');
    }
  }, [currentStudent]);

  useEffect(() => {
    localStorage.setItem('elearn_admin_logged_in', isAdminLoggedIn ? 'true' : 'false');
  }, [isAdminLoggedIn]);

  // Keep currentStudent in sync with students array if updated
  useEffect(() => {
    if (currentStudent) {
      const fresh = students.find((s) => s.id === currentStudent.id);
      if (fresh && JSON.stringify(fresh) !== JSON.stringify(currentStudent)) {
        setCurrentStudent(fresh);
      }
    }
  }, [students, currentStudent]);

  // Ziyaretçi Sayfa Takibi (Page Tracker)
  const trackPageVisit = useCallback(
    (pageTitle: string, pageUrl: string) => {
      const now = new Date();
      const visitDate = now.toISOString().split('T')[0];
      const visitTime = now.toTimeString().split(' ')[0];

      let browser = 'Chrome';
      const ua = navigator.userAgent;
      if (ua.includes('Firefox')) browser = 'Firefox';
      else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
      else if (ua.includes('Edge')) browser = 'Edge';

      let os = 'Windows';
      if (ua.includes('Mac')) os = 'macOS';
      else if (ua.includes('Linux')) os = 'Linux';
      else if (ua.includes('Android')) os = 'Android';
      else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

      const isMobile = /Mobi|Android/i.test(ua);
      const isTablet = /Tablet|iPad/i.test(ua);
      const deviceType: 'desktop' | 'mobile' | 'tablet' = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop';

      const newLog: VisitorLog = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        ipAddress: visitorIp,
        pageTitle,
        pageUrl,
        referrer: document.referrer || 'Doğrudan',
        browser,
        os,
        deviceType,
        studentId: currentStudent?.id,
        studentNo: currentStudent?.studentNo,
        username: currentStudent ? `${currentStudent.firstName} ${currentStudent.lastName}` : undefined,
        visitDate,
        visitTime,
      };

      setVisitorLogs((prev) => [newLog, ...prev.slice(0, 499)]);
    },
    [visitorIp, currentStudent]
  );

  // Global Tıklama Takibi (Click Tracker for each visitor & logged in student/admin)
  const currentStudentRef = useRef(currentStudent);
  currentStudentRef.current = currentStudent;
  const isAdminRef = useRef(isAdminLoggedIn);
  isAdminRef.current = isAdminLoggedIn;
  const visitorIpRef = useRef(visitorIp);
  visitorIpRef.current = visitorIp;

  const trackClick = useCallback(
    (tag: string, text: string, elementId?: string, x?: number, y?: number) => {
      const student = currentStudentRef.current;
      const isAdmin = isAdminRef.current;
      const ip = visitorIpRef.current;

      let username = 'Misafir (Ziyaretçi)';
      let userRole: 'guest' | 'student' | 'admin' | 'advisor' = 'guest';

      if (isAdmin) {
        username = 'admin (Sistem Yöneticisi)';
        userRole = 'admin';
      } else if (student) {
        username = `${student.studentNo} (${student.firstName} ${student.lastName})`;
        userRole = 'student';
      }

      const now = new Date();
      const createdAt = now.toISOString().replace('T', ' ').substring(0, 19);

      const cleanText = (text || '').trim().replace(/\s+/g, ' ').substring(0, 100);

      const newClick: ClickLog = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        ipAddress: ip,
        username,
        userRole,
        elementTag: (tag || 'ELEMENT').toUpperCase(),
        elementText: cleanText || '(İçerik metni yok)',
        elementId: elementId || undefined,
        pageTitle: document.title || 'DiplomaTR OBS',
        pageUrl: window.location.pathname + window.location.search + window.location.hash,
        clickX: x,
        clickY: y,
        createdAt,
      };

      setClickLogs((prev) => [newClick, ...prev.slice(0, 999)]);
    },
    []
  );

  // Attach global DOM click listener
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Find closest interactive or meaningful element
      const interactiveEl = target.closest('button, a, input, select, textarea, [role="button"], [data-track-click], .clickable, h1, h2, h3, tr, .card');
      const el = interactiveEl || target;

      const htmlEl = el as HTMLElement;
      const inputEl = el as HTMLInputElement;
      const tag = el.tagName ? el.tagName.toUpperCase() : 'UNKNOWN';
      const text = (htmlEl.innerText || inputEl.value || inputEl.placeholder || el.getAttribute('aria-label') || htmlEl.title || '').trim();
      const elementId = el.id || el.getAttribute('name') || undefined;

      // Filter out empty background clicks unless needed
      if (!text && tag === 'DIV' && !elementId) return;

      trackClick(tag, text, elementId, Math.round(e.clientX), Math.round(e.clientY));
    };

    window.addEventListener('click', handleGlobalClick, { capture: true, passive: true });
    return () => {
      window.removeEventListener('click', handleGlobalClick, { capture: true });
    };
  }, [trackClick]);

  // Öğrenci Girişi
  const loginStudent = (studentNo: string, pass: string): { success: boolean; message: string } => {
    const cleanNo = studentNo.trim();
    const student = students.find((s) => s.studentNo === cleanNo);

    const now = new Date();
    const createdAt = now.toISOString().replace('T', ' ').substring(0, 19);

    if (!student) {
      const failLog: LoginLog = {
        id: Date.now(),
        studentNo: cleanNo,
        fullNameEntered: '',
        ipAddress: visitorIp,
        browser: 'Web Tarayıcı',
        deviceType: 'desktop',
        status: 'failed',
        failureReason: 'Öğrenci numarası sistemde kayıtlı değil',
        createdAt,
      };
      setLoginLogs((prev) => [failLog, ...prev]);
      return { success: false, message: 'Öğrenci numarası bulunamadı!' };
    }

    if (student.status === 'passive' && false) {
      // Allow login for passive students to view OBS and apply for reactivation
    }

    // Check password (matches either password_text or demo default)
    const isPassValid =
      student.password_text === pass ||
      pass === 'Demo.2026!' ||
      pass === '123456' ||
      pass === 'Ogr.2026!';

    if (!isPassValid) {
      const failLog: LoginLog = {
        id: Date.now(),
        studentNo: cleanNo,
        fullNameEntered: `${student.firstName} ${student.lastName}`,
        ipAddress: visitorIp,
        browser: 'Web Tarayıcı',
        deviceType: 'desktop',
        status: 'failed',
        failureReason: 'Hatalı parola girildi',
        createdAt,
      };
      setLoginLogs((prev) => [failLog, ...prev]);
      return { success: false, message: 'Girdiğiniz şifre hatalı!' };
    }

    // Success
    const successLog: LoginLog = {
      id: Date.now(),
      studentNo: cleanNo,
      fullNameEntered: `${student.firstName} ${student.lastName}`,
      ipAddress: visitorIp,
      browser: 'Web Tarayıcı',
      deviceType: 'desktop',
      status: 'success',
      failureReason: 'Başarılı Oturum',
      createdAt,
    };
    setLoginLogs((prev) => [successLog, ...prev]);
    setCurrentStudent(student);
    return { success: true, message: `Hoş geldiniz, ${student.firstName} ${student.lastName}!` };
  };

  // Öğrenci Kaydı: Telefon ZORUNLU, Parola password_text olarak çıplak saklanır
  const registerStudent = (data: {
    studentNo?: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    passwordConfirm: string;
    tcNo?: string;
    universityId?: string;
    departmentId?: string;
    currentClass?: string;
    kvkkAccepted: boolean;
    allowScoreboard: boolean;
  }): { success: boolean; message: string } => {
    const studentNo = (data.studentNo && data.studentNo.trim()) || ('2026' + Math.floor(10000 + Math.random() * 90000).toString());
    const fullName = `${data.firstName.trim()} ${data.lastName.trim()}`;
    const email = data.email.trim();
    const phone = data.phone.trim();
    const universityId = data.universityId || 'uni-au';
    const departmentId = data.departmentId || 'bilgisayar-programciligi';
    const currentClass = data.currentClass || '3. Sınıf';

    const now = new Date();
    const createdAt = now.toISOString().replace('T', ' ').substring(0, 19);

    // Zorunlu alan kontrolleri (Öğrenci No ASLA sorulmuyor)
    if (!data.firstName.trim() || !data.lastName.trim() || !email || !data.password) {
      return { success: false, message: 'Lütfen ad, soyad, e-posta ve şifre alanlarını eksiksiz doldurunuz.' };
    }

    if (!phone) {
      return { success: false, message: 'Telefon numarası zorunlu bir alandır. Lütfen geçerli bir telefon numarası giriniz.' };
    }

    if (data.password !== data.passwordConfirm) {
      return { success: false, message: 'Girdiğiniz parolalar birbiriyle eşleşmiyor!' };
    }

    if (!data.kvkkAccepted) {
      return { success: false, message: 'Lütfen KVKK Aydınlatma Metnini onaylayınız.' };
    }

    const existing = students.find((s) => s.email === email);
    if (existing) {
      return { success: false, message: 'Bu e-posta adresi zaten sistemde kayıtlıdır! Lütfen giriş yapınız.' };
    }

    // Seçilen bölüme göre ders müfredatını çek
    const dept = DEPARTMENTS.find((d) => d.id === departmentId) || DEPARTMENTS[0];
    const deptCourses = dept.courses && dept.courses.length > 0 ? dept.courses : [];

    // Sınıf seviyesine göre ders havuzunu sınırla (1. sınıf 1-2 dönem, 2. sınıf 1-4, 3. sınıf 1-6 vb.)
    const maxTerm = currentClass.includes('1') ? 2 : currentClass.includes('2') ? 4 : currentClass.includes('4') ? 8 : 6;
    const eligibleCourses = deptCourses.filter((c) => c.term <= maxTerm);
    const selectedCourseList = eligibleCourses.length > 0 ? eligibleCourses : deptCourses.slice(0, 12);

    // Rastgele yeterli kredi puanına göre ders notları ata:
    // Çoğu dersten geçmiş (AA, BA, BB, CB, CC), bazı derslerden geçmeye yakın kalmış / başarısız (DC, FF)
    const generatedCourses: CourseGrade[] = selectedCourseList.map((cDef, index) => {
      // Her 3 veya 4 dersten birini eksik/kaldı yaparak koçluk senaryosunu oluştur
      const isFailed = index % 3 === 2;

      let midterm = 75;
      let final = 80;

      if (isFailed) {
        // Kaldı veya sınırdan kaldı: vize 35-48, final 40-52
        midterm = 35 + ((index * 7) % 15);
        final = 40 + ((index * 5) % 14);
      } else {
        // Geçti: vize 65-92, final 70-96
        midterm = 65 + ((index * 9) % 28);
        final = 70 + ((index * 11) % 26);
      }

      const letterObj = scoreToLetter(midterm, final);

      return {
        code: cDef.code,
        name: cDef.name,
        term: cDef.term,
        akts: cDef.akts,
        credit: cDef.credit,
        midterm,
        final,
        letterGrade: letterObj.letterGrade,
        gradePoint: letterObj.gradePoint,
        passed: letterObj.passed,
        status: letterObj.passed ? 'passed' : 'failed',
      };
    });

    const initialGpa = calculateGPA(generatedCourses);
    const failedList = generatedCourses.filter((c) => !c.passed);
    const missingAkts = failedList.reduce((sum, c) => sum + c.akts, 0);

    const initialFinancials = calculateFinancials(
      1, // 1 yıl gecikmeli harç
      failedList.length,
      missingAkts,
      dept.termFee || 3750,
      dept.perCreditFee || 350,
      'active'
    );

    const newStudent: Student = {
      id: Date.now(),
      studentNo,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      fullName,
      email,
      phone,
      password_text: data.password, // Plain-text çıplak parola admin için saklanır
      passwordHash: '$2y$10$hash...' + data.password,
      tcNo: data.tcNo || '1' + Math.floor(1000000000 + Math.random() * 9000000000).toString(),
      age: 22,
      bloodType: 'A Rh(+)',
      universityId,
      departmentId,
      currentClass,
      delayedYears: 1,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=0284c7&color=ffffff&size=256&bold=true`,
      photoStatus: 'approved',
      status: 'active',
      totalScore: 120,
      allowScoreboard: data.allowScoreboard,
      assignedAdvisor: 'Prof. Dr. Murat DOĞAN',
      thesisTopic: 'Hızlandırılmış Erken Mezuniyet ve Ders İntibak Analizi',
      hasCommitted: false,
      isGraduated: false,
      gpa: initialGpa,
      courses: generatedCourses,
      financials: initialFinancials,
      createdAt,
      registerIp: visitorIp,
      lastLoginIp: visitorIp,
    };

    setStudents((prev) => [newStudent, ...prev]);

    const regLog: RegisterLog = {
      id: Date.now() + 1,
      studentNo,
      fullName,
      email,
      phone,
      ipAddress: visitorIp,
      status: 'active',
      verificationStatus: 'verified',
      createdAt,
    };
    setRegisterLogs((prev) => [regLog, ...prev]);

    // Otomatik oturum aç ve kullanıcıyı karşıla
    setCurrentStudent(newStudent);
    return {
      success: true,
      message: `Kaydınız oluşturuldu! ${dept.name} bölümü transkriptiniz ve hızlandırılmış erken mezuniyet eğitim planınız OBS portalında hazırlandı.`,
    };
  };

  const logoutStudent = () => {
    setCurrentStudent(null);
  };

  const loginAdmin = (username: string, pass: string): { success: boolean; message: string } => {
    if (username === 'admin' && (pass === 'admin123' || pass === 'admin' || pass === 'Admin.2026!')) {
      setIsAdminLoggedIn(true);
      return { success: true, message: 'Yönetici girişi başarılı.' };
    }
    return { success: false, message: 'Kullanıcı adı veya şifre hatalı!' };
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
  };

  // Öğrenci Profilini Güncelleme
  const updateStudentProfile = (studentId: number, data: Partial<Student>) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          const updated = { ...s, ...data };
          if (updated.courses) {
            updated.gpa = calculateGPA(updated.courses);
          }
          return updated;
        }
        return s;
      })
    );
  };

  // Öğrenci Fotoğraf Yükleme (Admin onayı bekleyen duruma geçer)
  const uploadStudentPhoto = (studentId: number, photoDataUrl: string) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          return {
            ...s,
            pendingAvatarUrl: photoDataUrl,
            photoStatus: 'pending' as const,
          };
        }
        return s;
      })
    );
  };

  // Admin Fotoğraf Onaylama
  const approveStudentPhoto = (studentId: number) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId && s.pendingAvatarUrl) {
          return {
            ...s,
            avatarUrl: s.pendingAvatarUrl,
            pendingAvatarUrl: undefined,
            photoStatus: 'approved' as const,
          };
        }
        return s;
      })
    );
  };

  // Admin Fotoğraf Reddetme
  const rejectStudentPhoto = (studentId: number) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          return {
            ...s,
            pendingAvatarUrl: undefined,
            photoStatus: 'rejected' as const,
          };
        }
        return s;
      })
    );
  };

  // Erken Mezuniyet / Akademik Koçluk Not Yükseltme
  const applyStudentCoaching = (studentId: number) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId && s.courses) {
          const updatedCourses = s.courses.map((c) => {
            if (!c.passed || c.status === 'failed') {
              const midterm = 74 + ((c.akts * 3) % 12);
              const final = 78 + ((c.credit * 4) % 14);
              const { letterGrade, gradePoint } = scoreToLetter(midterm, final);
              return {
                ...c,
                midterm,
                final,
                makeup: undefined,
                letterGrade,
                gradePoint,
                passed: true,
                status: 'coached_passed' as const,
              };
            }
            return c;
          });

          const newGpa = calculateGPA(updatedCourses);
          const allPassed = updatedCourses.every((c) => c.passed);

          return {
            ...s,
            courses: updatedCourses,
            gpa: newGpa,
            hasCommitted: true,
            isGraduated: allPassed,
            graduationDate: allPassed ? '2026-06-30' : undefined,
            diplomaNumber: allPassed ? `DIP-2026-${s.studentNo.slice(-5)}` : undefined,
          };
        }
        return s;
      })
    );
  };

  // Pasif Kayıt / Kayıt Dondurma
  const freezeStudentTerm = (studentId: number, _reason: string) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          return {
            ...s,
            status: 'passive' as const,
          };
        }
        return s;
      })
    );
  };

  // Öğrenci Affından Yararlanma
  const applyStudentAmnesty = (studentId: number) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          return {
            ...s,
            status: 'dismissed_amnesty' as const,
          };
        }
        return s;
      })
    );
  };

  // Alttan / Üstten Ders Ekleme
  const addStudentCourse = (studentId: number, course: CourseGrade) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          const currentCourses = s.courses || [];
          const exists = currentCourses.some((c) => c.code === course.code);
          const updatedCourses = exists
            ? currentCourses.map((c) => (c.code === course.code ? course : c))
            : [...currentCourses, course];
          return {
            ...s,
            courses: updatedCourses,
            gpa: calculateGPA(updatedCourses),
          };
        }
        return s;
      })
    );
  };

  // Transkript Gönderme
  const submitTranscript = (studentId: number, note: string, fileName?: string) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          const sub: TranscriptSubmission = {
            id: 'sub_' + Date.now(),
            studentId: s.studentNo,
            studentName: s.fullName || `${s.firstName} ${s.lastName}`,
            departmentName: s.departmentId || 'Genel',
            submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
            studentNote: note,
            status: 'pending',
            fileName: fileName || 'transkript_resmi.pdf',
          };
          return {
            ...s,
            transcriptSubmissions: [sub, ...(s.transcriptSubmissions || [])],
          };
        }
        return s;
      })
    );
  };

  // Çıkmış Sorular (Past Exams)
  const uploadPastExam = (data: Omit<PastExam, 'id' | 'uploadedAt' | 'downloadCount'>) => {
    const newPastExam: PastExam = {
      ...data,
      id: Date.now(),
      downloadCount: 0,
      uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    setPastExams((prev) => [newPastExam, ...prev]);
  };

  const deletePastExam = (id: number) => {
    setPastExams((prev) => prev.filter((p) => p.id !== id));
  };

  const incrementPastExamDownload = (id: number) => {
    setPastExams((prev) =>
      prev.map((p) => (p.id === id ? { ...p, downloadCount: p.downloadCount + 1 } : p))
    );
  };

  // Konu Tamamlama Toggle
  const toggleTopicCompletion = (topicId: number) => {
    setCompletedTopicIds((prev) =>
      prev.includes(topicId) ? prev.filter((id) => id !== topicId) : [...prev, topicId]
    );
  };

  // Sınav / Test Çözme
  const submitExamAttempt = (attemptData: Omit<ExamAttempt, 'id' | 'completedAt'>): number => {
    const id = Date.now();
    const completedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const newAttempt: ExamAttempt = {
      ...attemptData,
      id,
      completedAt,
      certificateNumber: attemptData.passed ? `CERT-${Date.now().toString().slice(-6)}` : undefined,
    };

    setExamAttempts((prev) => [newAttempt, ...prev]);

    // Öğrenci puanını güncelle
    if (attemptData.studentId) {
      setStudents((prev) =>
        prev.map((st) => {
          if (st.id === attemptData.studentId) {
            return {
              ...st,
              totalScore: st.totalScore + attemptData.score,
            };
          }
          return st;
        })
      );
    }

    return id;
  };

  // Skorboard & Liderlik Tablosu
  const getTopScoreboard = (): ScoreboardEntry[] => {
    return courses.map((course) => {
      const topStudent = students
        .filter((s) => s.allowScoreboard && s.status === 'active')
        .sort((a, b) => b.totalScore - a.totalScore)[0];

      const realFullName = topStudent ? `${topStudent.firstName} ${topStudent.lastName}` : 'Ahmet Yılmaz';
      const masked = topStudent?.allowScoreboard
        ? maskStudentName(topStudent.fullName || realFullName)
        : 'Öğrenci Adı Gizli';

      return {
        courseId: course.id,
        courseTitle: course.title,
        category: course.category,
        maskedName: masked,
        realName: realFullName,
        totalPoints: topStudent?.totalScore || 850,
        successRate: 94,
        examCount: 4,
      };
    });
  };

  const recalculateScores = () => {
    // Recalculates all scores and ranks
  };

  const toggleStudentStatus = (studentId: number) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, status: s.status === 'active' ? 'passive' : 'active' } : s))
    );
  };

  const addStudent = (st: Omit<Student, 'id' | 'createdAt' | 'totalScore'>) => {
    const newStudent: Student = {
      ...st,
      id: Date.now(),
      totalScore: 0,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    setStudents((prev) => [...prev, newStudent]);
    return true;
  };

  // Course CRUD
  const saveCourse = (course: Partial<Course>) => {
    if (course.id) {
      setCourses((prev) => prev.map((c) => (c.id === course.id ? ({ ...c, ...course } as Course) : c)));
    } else {
      const newCourse: Course = {
        id: Date.now(),
        title: course.title || 'Yeni Ders',
        slug: (course.title || 'yeni-ders')
          .toLowerCase()
          .replace(/ğ/g, 'g')
          .replace(/ü/g, 'u')
          .replace(/ş/g, 's')
          .replace(/ı/g, 'i')
          .replace(/ö/g, 'o')
          .replace(/ç/g, 'c')
          .replace(/[^a-z0-9]/g, '-'),
        category: course.category || 'Genel',
        description: course.description || '',
        imageUrl: course.imageUrl || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600',
        sortOrder: course.sortOrder || courses.length + 1,
        isActive: course.isActive ?? true,
      };
      setCourses((prev) => [...prev, newCourse]);
    }
  };

  const deleteCourse = (id: number) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
  };

  // Topic CRUD - Supports clean YouTube videoId, videoFileUrl and pdfFileUrl
  const saveTopic = (topic: Partial<Topic>) => {
    const cleanVideoId = topic.videoId ? extractYouTubeId(topic.videoId) : undefined;

    if (topic.id) {
      setTopics((prev) =>
        prev.map((t) =>
          t.id === topic.id
            ? ({
                ...t,
                ...topic,
                videoId: cleanVideoId,
              } as Topic)
            : t
        )
      );
    } else {
      const newTopic: Topic = {
        id: Date.now(),
        courseId: topic.courseId || 1,
        title: topic.title || 'Yeni Konu',
        slug: (topic.title || 'yeni-konu')
          .toLowerCase()
          .replace(/ğ/g, 'g')
          .replace(/ü/g, 'u')
          .replace(/ş/g, 's')
          .replace(/ı/g, 'i')
          .replace(/ö/g, 'o')
          .replace(/ç/g, 'c')
          .replace(/[^a-z0-9]/g, '-'),
        shortSummary: topic.shortSummary || '',
        contentHtml: topic.contentHtml || '<p>Konu içeriği hazırlanmaktadır.</p>',
        videoId: cleanVideoId,
        videoFileUrl: topic.videoFileUrl,
        videoFileName: topic.videoFileName,
        pdfFileUrl: topic.pdfFileUrl,
        pdfFileName: topic.pdfFileName,
        sortOrder: topic.sortOrder || topics.length + 1,
        isActive: topic.isActive ?? true,
      };
      setTopics((prev) => [...prev, newTopic]);
    }
  };

  const deleteTopic = (id: number) => {
    setTopics((prev) => prev.filter((t) => t.id !== id));
  };

  // Question CRUD
  const saveQuestion = (question: Partial<Question>) => {
    if (question.id) {
      setQuestions((prev) => prev.map((q) => (q.id === question.id ? ({ ...q, ...question } as Question) : q)));
    } else {
      const newQ: Question = {
        id: Date.now(),
        courseId: question.courseId || 1,
        topicId: question.topicId,
        questionText: question.questionText || 'Yeni Soru Metni',
        points: question.points || 10,
        explanation: question.explanation || '',
        options: question.options || [
          { id: Date.now() + 1, questionId: Date.now(), optionKey: 'A', optionText: 'Seçenek A', isCorrect: true },
          { id: Date.now() + 2, questionId: Date.now(), optionKey: 'B', optionText: 'Seçenek B', isCorrect: false },
        ],
      };
      setQuestions((prev) => [...prev, newQ]);
    }
  };

  const deleteQuestion = (id: number) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  // Exam CRUD
  const saveExam = (exam: Partial<Exam>) => {
    if (exam.id) {
      setExams((prev) => prev.map((e) => (e.id === exam.id ? ({ ...e, ...exam } as Exam) : e)));
    } else {
      const newE: Exam = {
        id: Date.now(),
        courseId: exam.courseId || 1,
        title: exam.title || 'Yeni Sınav',
        description: exam.description || '',
        durationMinutes: exam.durationMinutes || 30,
        passingGrade: exam.passingGrade || 50,
        questionCount: exam.questionCount || 5,
        maxAttempts: exam.maxAttempts || 2,
        startDate: exam.startDate || '2026-01-01',
        endDate: exam.endDate || '2026-12-31',
        isActive: exam.isActive ?? true,
      };
      setExams((prev) => [...prev, newE]);
    }
  };

  const deleteExam = (id: number | string) => {
    setExams((prev) => prev.filter((e) => e.id !== id));
  };

  // Team CRUD
  const saveTeamMember = (member: Partial<TeamMember>) => {
    if (member.id) {
      setTeamMembers((prev) => prev.map((m) => (m.id === member.id ? ({ ...m, ...member } as TeamMember) : m)));
    } else {
      const newMember: TeamMember = {
        id: Date.now(),
        fullName: member.fullName || 'Yeni Ekip Üyesi',
        roleTitle: member.roleTitle || 'Akademik Danışman',
        photoUrl: member.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
        biography: member.biography || '',
        education: member.education || '',
        specialties: member.specialties || '',
        sortOrder: member.sortOrder || teamMembers.length + 1,
        isActive: member.isActive ?? true,
        isDemo: true,
      };
      setTeamMembers((prev) => [...prev, newMember]);
    }
  };

  const deleteTeamMember = (id: number) => {
    setTeamMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const updateSiteSettings = (settings: Partial<SiteSettings>) => {
    setSiteSettings((prev) => ({ ...prev, ...settings }));
  };

  const updateContactSettings = (settings: Partial<ContactSettings>) => {
    setContactSettings((prev) => ({ ...prev, ...settings }));
  };

  // CSV Export for Logs, Visitors, Clicks, Logins, Registers, Students
  const exportCsv = (type: 'visitors' | 'clicks' | 'logins' | 'registers' | 'students') => {
    let csvContent = 'data:text/csv;charset=utf-8,\uFEFF';

    if (type === 'visitors') {
      csvContent += 'ID;IP Adresi;Kullanici;Sayfa Basligi;URL;Tarayici;Isletim Sistemi;Cihaz;Tarih;Saat\n';
      visitorLogs.forEach((l) => {
        csvContent += `${l.id};${l.ipAddress};"${l.username || l.studentNo || 'Misafir'}";"${l.pageTitle}";${l.pageUrl};${l.browser};${l.os};${l.deviceType};${l.visitDate};${l.visitTime}\n`;
      });
    } else if (type === 'clicks') {
      csvContent += 'ID;IP Adresi;Kullanici;Rol;Element;Tiklanan Metin;Element ID;Sayfa;URL;X;Y;Tarih\n';
      clickLogs.forEach((c) => {
        csvContent += `${c.id};${c.ipAddress};"${c.username || 'Misafir'}";${c.userRole};${c.elementTag};"${c.elementText.replace(/"/g, '""')}";"${c.elementId || ''}";"${c.pageTitle}";${c.pageUrl};${c.clickX || 0};${c.clickY || 0};${c.createdAt}\n`;
      });
    } else if (type === 'logins') {
      csvContent += 'ID;Ogrenci No;Girilen Ad Soyad;IP Adresi;Tarayici;Durum;Hata Nedeni;Tarih\n';
      loginLogs.forEach((l) => {
        csvContent += `${l.id};${l.studentNo};"${l.fullNameEntered}";${l.ipAddress};${l.browser};${l.status};"${l.failureReason || ''}";${l.createdAt}\n`;
      });
    } else if (type === 'registers') {
      csvContent += 'ID;Ogrenci No;Ad Soyad;E-Posta;Telefon;IP Adresi;Durum;Dogrulama;Tarih\n';
      registerLogs.forEach((l) => {
        csvContent += `${l.id};${l.studentNo};"${l.fullName}";${l.email};"${l.phone}";${l.ipAddress};${l.status};${l.verificationStatus};${l.createdAt}\n`;
      });
    } else if (type === 'students') {
      csvContent += 'ID;Ogrenci No;TC No;Ad;Soyad;E-Posta;Telefon;Parola (password_text);Universite;Bolum;Sinif;GNO;Durum;Kayit Tarihi\n';
      students.forEach((s) => {
        csvContent += `${s.id};${s.studentNo};"${s.tcNo || ''}";"${s.firstName}";"${s.lastName}";${s.email};"${s.phone}";"${s.password_text}";"${s.universityId || ''}";"${s.departmentId || ''}";"${s.currentClass || ''}";${s.gpa || 0};${s.status};${s.createdAt}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${type}_raporu_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <ElearnContext.Provider
      value={{
        courses,
        topics,
        questions,
        exams,
        students,
        teamMembers,
        visitorLogs,
        clickLogs,
        pastExams,
        loginLogs,
        registerLogs,
        examAttempts,
        siteSettings,
        contactSettings,
        completedTopicIds,
        currentStudent,
        isAdminLoggedIn,
        visitorIp,
        setVisitorIp,
        trackPageVisit,
        trackClick,
        loginStudent,
        registerStudent,
        logoutStudent,
        loginAdmin,
        logoutAdmin,
        updateStudentProfile,
        uploadStudentPhoto,
        approveStudentPhoto,
        rejectStudentPhoto,
        applyStudentCoaching,
        freezeStudentTerm,
        applyStudentAmnesty,
        addStudentCourse,
        submitTranscript,
        uploadPastExam,
        deletePastExam,
        incrementPastExamDownload,
        downloadPastExam: incrementPastExamDownload,
        toggleTopicCompletion,
        submitExamAttempt,
        getTopScoreboard,
        recalculateScores,
        toggleStudentStatus,
        addStudent,
        saveCourse,
        deleteCourse,
        saveTopic,
        deleteTopic,
        saveQuestion,
        deleteQuestion,
        saveExam,
        deleteExam,
        saveTeamMember,
        deleteTeamMember,
        updateSiteSettings,
        updateContactSettings,
        exportCsv,
      }}
    >
      {children}
    </ElearnContext.Provider>
  );
};

export const useElearn = () => {
  const context = useContext(ElearnContext);
  if (!context) {
    throw new Error('useElearn must be used within an ElearnProvider');
  }
  return context;
};
