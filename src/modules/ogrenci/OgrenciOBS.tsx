import React, { useState } from 'react';
import {
  GraduationCap,
  Award,
  BookOpen,
  DollarSign,
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  Send,
  UserCheck,
  CreditCard,
  Download,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building,
  HelpCircle,
  FileText,
  Clock,
  Edit3,
  X,
  Plus,
  Camera,
  Upload,
  Printer,
  Calculator,
  RefreshCw,
  Info,
  Lock,
  Check,
  Copy,
  Video,
  Play,
  FileDown
} from 'lucide-react';
import {
  CourseGrade,
  Department,
  StudentProfile,
  University,
  TranscriptSubmission,
  ExamAttempt,
} from '../../types';
import {
  calculateGPA,
  calculateFinancials,
  applyCoachingRemediation,
  formatTL,
  scoreToLetter,
} from '../../utils/academicRules';
import { logAuditEvent } from '../admin/auditService';
import { TranscriptSubmissionModal } from './TranscriptSubmissionModal';
import { ExamModal } from '../exams/ExamModal';
import { TemporaryCertificateModal } from '../exams/TemporaryCertificateModal';
import { useElearn } from '../../context/ElearnContext';

interface OgrenciOBSProps {
  profile: StudentProfile;
  university: University;
  department: Department;
  onUpdateProfile: (updated: StudentProfile) => void;
  onOpenIdCard: () => void;
  onOpenDiploma: () => void;
  onReturnToHome: () => void;
}

export const OgrenciOBS: React.FC<OgrenciOBSProps> = ({
  profile,
  university,
  department,
  onUpdateProfile,
  onOpenIdCard,
  onOpenDiploma,
  onReturnToHome,
}) => {
  const {
    uploadStudentPhoto,
    freezeStudentTerm,
    applyStudentAmnesty,
    addStudentCourse,
    trackClick,
    siteSettings,
    courses,
    pastExams
  } = useElearn();

  const [activeTab, setActiveTab] = useState<'early_grad' | 'curriculum' | 'financials' | 'calculators' | 'status_ops' | 'thesis' | 'elearn_portal' | 'exams'>('early_grad');
  const [copiedIban, setCopiedIban] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);
  const [paymentSender, setPaymentSender] = useState(profile.fullName);
  const [paymentBank, setPaymentBank] = useState('Ziraat Bankası');
  const [paymentAmount, setPaymentAmount] = useState(profile.financials.totalPayable);
  const [paymentNote, setPaymentNote] = useState('');
  const [paymentReceiptName, setPaymentReceiptName] = useState<string | null>(null);
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [isCommitModalOpen, setIsCommitModalOpen] = useState(false);
  const [commitmentAgreed, setCommitmentAgreed] = useState(false);
  const [isEditingCourse, setIsEditingCourse] = useState<CourseGrade | null>(null);
  const [editMidterm, setEditMidterm] = useState<number>(50);
  const [editFinal, setEditFinal] = useState<number>(60);
  const [isTranscriptModalOpen, setIsTranscriptModalOpen] = useState(false);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [activeExamAttempt, setActiveExamAttempt] = useState<ExamAttempt | undefined>(
    profile.examAttempts?.[0]
  );

  // Vesikalık Fotoğraf Yükleme State
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoMessage, setPhotoMessage] = useState<string | null>(null);

  // Alttan / Üstten Ders Alma State
  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);
  const [selectedCourseCode, setSelectedCourseCode] = useState<string>('');
  const [addCourseError, setAddCourseError] = useState<string | null>(null);

  // Kayıt Dondurma (Pasif Kayıt) State
  const [isFreezeModalOpen, setIsFreezeModalOpen] = useState(false);
  const [freezeReason, setFreezeReason] = useState<string>('Sağlık Raporu (Heyet Kararı)');
  const [freezeSemesters, setFreezeSemesters] = useState<number>(1);
  const [freezeSuccess, setFreezeSuccess] = useState<string | null>(null);

  // Öğrenci Affı State
  const [isAmnestyModalOpen, setIsAmnestyModalOpen] = useState(false);
  const [amnestyYear, setAmnestyYear] = useState<string>('2024');
  const [amnestySuccess, setAmnestySuccess] = useState<string | null>(null);

  // Dekont / Fiş Yazdırma Modali
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Hesaplama Araçları Tab State (OBS İçinde)
  const [calcHarcTerms, setCalcHarcTerms] = useState<number>(profile.delayedYears ?? 1);
  const [calcHarcAkts, setCalcHarcAkts] = useState<number>(6);
  const [calcVize, setCalcVize] = useState<number>(65);
  const [calcFinal, setCalcFinal] = useState<number>(70);
  const [calcKrediMonths, setCalcKrediMonths] = useState<number>(48);

  const missingCourses = profile.courses.filter((c) => !c.passed);
  const passedCourses = profile.courses.filter((c) => c.passed);
  const totalAkts = profile.courses.reduce((sum, c) => sum + c.akts, 0);
  const earnedAkts = passedCourses.reduce((sum, c) => sum + c.akts, 0);

  // Group courses by term
  const coursesByTerm: { [term: number]: CourseGrade[] } = {};
  profile.courses.forEach((c) => {
    if (!coursesByTerm[c.term]) coursesByTerm[c.term] = [];
    coursesByTerm[c.term].push(c);
  });

  // Apply coaching remediation
  const handleApplyCoaching = () => {
    trackClick('BUTTON', 'Koçluk ile Not Tamamlama', 'btn-apply-coaching');
    const remediatedCourses = applyCoachingRemediation(profile.courses);
    const newGpa = calculateGPA(remediatedCourses);
    const missing = remediatedCourses.filter((c) => !c.passed);
    const missingAkts = missing.reduce((sum, c) => sum + c.akts, 0);

    const newFinancials = calculateFinancials(
      profile.delayedYears ?? 0,
      missing.length,
      missingAkts,
      department.termFee,
      department.perCreditFee,
      profile.status
    );

    const updated: StudentProfile = {
      ...profile,
      courses: remediatedCourses,
      financials: newFinancials,
      gpa: newGpa,
    };

    logAuditEvent(
      'grade_update',
      { id: String(profile.userId || profile.id), name: profile.fullName, role: 'student' },
      `Akademik koçluk not ataması uygulandı. Yeni GNO: ${newGpa.toFixed(2)}`
    );

    onUpdateProfile(updated);
  };

  // Save manual course grade edit
  const handleSaveCourseEdit = () => {
    if (!isEditingCourse) return;

    const { letterGrade, gradePoint, passed } = scoreToLetter(editMidterm, editFinal);
    const updatedCourses = profile.courses.map((c) => {
      if (c.code === isEditingCourse.code) {
        return {
          ...c,
          midterm: editMidterm,
          final: editFinal,
          letterGrade,
          gradePoint,
          passed,
          status: 'student_entered' as const,
        };
      }
      return c;
    });

    const newGpa = calculateGPA(updatedCourses);
    const missing = updatedCourses.filter((c) => !c.passed);
    const missingAkts = missing.reduce((sum, c) => sum + c.akts, 0);

    const newFinancials = calculateFinancials(
      profile.delayedYears ?? 0,
      missing.length,
      missingAkts,
      department.termFee,
      department.perCreditFee,
      profile.status
    );

    const updated: StudentProfile = {
      ...profile,
      courses: updatedCourses,
      financials: newFinancials,
      gpa: newGpa,
    };

    logAuditEvent(
      'grade_update',
      { id: String(profile.userId || profile.id), name: profile.fullName, role: 'student' },
      `Ders notu güncellendi: ${isEditingCourse.code} (${editMidterm}/${editFinal} -> ${letterGrade})`
    );

    onUpdateProfile(updated);
    setIsEditingCourse(null);
  };

  // Sign financial & academic commitment
  const handleSignCommitment = () => {
    const sNum = profile.studentNumber || profile.studentNo || '202610101';
    const updated: StudentProfile = {
      ...profile,
      hasCommitted: true,
      isGraduated: true,
      graduationDate: '08 Kasım 2026',
      diplomaNumber: `DIP-${university.code}-${sNum.slice(-6)}`,
    };

    logAuditEvent(
      'commitment_sign',
      { id: String(profile.userId || profile.id), name: profile.fullName, role: 'student' },
      `Mezuniyet taahhütnamesi dijital olarak imzalandı. Mezuniyet onaylandı.`
    );

    onUpdateProfile(updated);
    setIsCommitModalOpen(false);
  };

  // Photo Upload Handler (Admin Approval Workflow)
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setPhotoMessage('Lütfen geçerli bir resim dosyası (.jpg, .png) seçiniz.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setPhotoPreview(base64);
      setPhotoMessage(null);
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoSave = () => {
    if (!photoPreview) {
      setPhotoMessage('Lütfen bir fotoğraf seçiniz veya çekiniz.');
      return;
    }

    uploadStudentPhoto(profile.id, photoPreview);

    const updated: StudentProfile = {
      ...profile,
      pendingAvatarUrl: photoPreview,
      photoStatus: 'pending',
    };
    onUpdateProfile(updated);

    logAuditEvent(
      'photo_upload',
      { id: String(profile.userId || profile.id), name: profile.fullName, role: 'student' },
      `Yeni vesikalık fotoğraf yüklendi, admin onayı bekleniyor.`
    );

    setPhotoMessage('Fotoğraf başarıyla yüklendi! Yönetici onayı alındıktan sonra kimlik kartı ve diplomanızda aktif hale gelecektir.');
    setTimeout(() => {
      setIsPhotoModalOpen(false);
      setPhotoPreview(null);
      setPhotoMessage(null);
    }, 2000);
  };

  // Alttan / Üstten Ders Ekleme
  const availableDeptCourses = department.courses.filter(
    (dc) => !profile.courses.some((c) => c.code === dc.code && c.passed)
  );

  const handleAddCourseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAddCourseError(null);

    const targetDef = department.courses.find((c) => c.code === selectedCourseCode);
    if (!targetDef) {
      setAddCourseError('Lütfen geçerli bir ders seçiniz.');
      return;
    }

    // Check maximum 45 AKTS credit limit per term
    const currentTermCourses = profile.courses.filter((c) => c.term === targetDef.term);
    const currentTermAkts = currentTermCourses.reduce((sum, c) => sum + c.akts, 0);
    if (currentTermAkts + targetDef.akts > 45) {
      setAddCourseError(`YÖK Yönetmeliği gereği bir yarıyılda azami 45 AKTS sınırını aşamazsınız. (Mevcut: ${currentTermAkts} AKTS + Eklenecek: ${targetDef.akts} AKTS > 45 AKTS)`);
      return;
    }

    const newCourseGrade: CourseGrade = {
      code: targetDef.code,
      name: targetDef.name,
      term: targetDef.term,
      akts: targetDef.akts,
      credit: targetDef.credit,
      midterm: 0,
      final: 0,
      letterGrade: 'FF',
      gradePoint: 0.0,
      passed: false,
      status: 'failed',
    };

    addStudentCourse(profile.id, newCourseGrade);

    const updatedCourses = [...profile.courses, newCourseGrade];
    const newGpa = calculateGPA(updatedCourses);
    const missing = updatedCourses.filter((c) => !c.passed);
    const missingAkts = missing.reduce((sum, c) => sum + c.akts, 0);

    const newFinancials = calculateFinancials(
      profile.delayedYears ?? 0,
      missing.length,
      missingAkts,
      department.termFee,
      department.perCreditFee,
      profile.status
    );

    const updated: StudentProfile = {
      ...profile,
      courses: updatedCourses,
      financials: newFinancials,
      gpa: newGpa,
    };

    onUpdateProfile(updated);

    logAuditEvent(
      'course_enroll',
      { id: String(profile.userId || profile.id), name: profile.fullName, role: 'student' },
      `Alttan/Üstten yeni ders eklendi: ${targetDef.code} - ${targetDef.name} (${targetDef.akts} AKTS)`
    );

    setIsAddCourseModalOpen(false);
    setSelectedCourseCode('');
  };

  // Pasif Kayıt / Kayıt Dondurma Talebi
  const handleFreezeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    freezeStudentTerm(profile.id, freezeReason);

    const updated: StudentProfile = {
      ...profile,
      status: 'passive',
    };
    onUpdateProfile(updated);

    logAuditEvent(
      'term_freeze',
      { id: String(profile.userId || profile.id), name: profile.fullName, role: 'student' },
      `Kayıt dondurma (pasif kayıt) talebi onaylandı: ${freezeReason} (${freezeSemesters} yarıyıl)`
    );

    setFreezeSuccess('Kayıt dondurma başvurunuz onaylandı. Öğrencilik statünüz "Pasif Kayıt / Yenileme" olarak güncellendi.');
    setTimeout(() => {
      setIsFreezeModalOpen(false);
      setFreezeSuccess(null);
    }, 2000);
  };

  // Öğrenci Affından Yararlanma
  const handleAmnestySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyStudentAmnesty(profile.id);

    const updated: StudentProfile = {
      ...profile,
      status: 'dismissed_amnesty',
    };
    onUpdateProfile(updated);

    logAuditEvent(
      'amnesty_apply',
      { id: String(profile.userId || profile.id), name: profile.fullName, role: 'student' },
      `7417 Sayılı YÖK Öğrenci Affı İntibak Başvurusu onaylandı.`
    );

    setAmnestySuccess('Öğrenci Affı intibak başvurunuz başarıyla kabul edildi! Transkriptiniz af kanunu kapsamına alındı.');
    setTimeout(() => {
      setIsAmnestyModalOpen(false);
      setAmnestySuccess(null);
    }, 2000);
  };

  // Handle transcript submission
  const handleTranscriptSubmit = (submission: TranscriptSubmission) => {
    const updated: StudentProfile = {
      ...profile,
      transcriptSubmissions: [submission, ...(profile.transcriptSubmissions || [])],
    };
    onUpdateProfile(updated);
  };

  // Handle exam passed
  const handleExamPassed = (attempt: ExamAttempt) => {
    setActiveExamAttempt(attempt);
    const updated: StudentProfile = {
      ...profile,
      examAttempts: [attempt, ...(profile.examAttempts || [])],
    };
    onUpdateProfile(updated);
  };

  return (
    <div className="bg-slate-100 min-h-screen py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        {/* OBS Navigation & Title Bar */}
        <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-5 border border-slate-800">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <img
                src={profile.avatarUrl}
                alt={profile.fullName}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-amber-400 shadow-md bg-slate-800"
                referrerPolicy="no-referrer"
              />
              <button
                type="button"
                onClick={() => setIsPhotoModalOpen(true)}
                className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-[10px] font-bold text-white cursor-pointer"
              >
                <Camera className="w-5 h-5 text-amber-400 mb-1" />
                Foto Değiştir
              </button>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-white">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono text-xs font-bold border border-amber-500/30">
                  Öğrenci No: {profile.studentNumber || profile.studentNo}
                </span>
                <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                  profile.status === 'dismissed_amnesty'
                    ? 'bg-purple-900/60 text-purple-300 border border-purple-700/50'
                    : profile.status === 'passive'
                    ? 'bg-rose-900/60 text-rose-300 border border-rose-700/50'
                    : 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50'
                }`}>
                  {profile.status === 'dismissed_amnesty'
                    ? 'Öğrenci Affı İntibak'
                    : profile.status === 'passive'
                    ? 'Pasif Kayıt / Yenileme'
                    : 'Aktif Öğrenci'}
                </span>
                {profile.photoStatus === 'pending' && (
                  <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/40 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Vesikalık Admin Onayı Bekliyor
                  </span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1">
                {profile.fullName}
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                {university.name} • {department.name} ({department.type})
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsPhotoModalOpen(true)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold flex items-center gap-1.5 border border-amber-500/30 transition-colors cursor-pointer"
            >
              <Camera className="w-4 h-4 text-amber-400" />
              <span>Fotoğraf Yükle</span>
            </button>

            <button
              onClick={onOpenIdCard}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
            >
              <CreditCard className="w-4 h-4 text-amber-400" />
              <span>Öğrenci Kartı (PDF)</span>
            </button>

            {profile.isGraduated ? (
              <button
                onClick={onOpenDiploma}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
              >
                <Award className="w-4 h-4" />
                <span>Resmi Diploma (PDF)</span>
              </button>
            ) : (
              <button
                onClick={() => setIsCommitModalOpen(true)}
                className="px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
              >
                <FileCheck2 className="w-4 h-4" />
                <span>Mezuniyet & Taahhüt</span>
              </button>
            )}

            <button
              onClick={onReturnToHome}
              className="px-3 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-medium transition-colors cursor-pointer"
            >
              Ana Sayfa
            </button>
          </div>
        </div>

        {/* Student Metrics 4-Card Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Genel Not Ortalaması
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
                {(profile.gpa ?? 0).toFixed(2)}
              </span>
              <span className="text-xs text-slate-500 font-semibold">/ 4.00</span>
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1">
              {(profile.gpa ?? 0) >= 2.0 ? '✓ Mezuniyet Şartı Sağlandı' : '⚠ Baraj Altında (< 2.00)'}
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Kazanılan / Toplam AKTS
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
                {earnedAkts}
              </span>
              <span className="text-xs text-slate-500 font-semibold">/ {department.totalAkts} AKTS</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {department.totalAkts - earnedAkts > 0
                ? `${department.totalAkts - earnedAkts} AKTS Eksik Kredi`
                : 'Tüm Krediler Tamamlandı'}
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Eksik / Başarısız Dersler
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-amber-600 mt-1">
              {missingCourses.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {missingCourses.length === 0 ? 'Tüm dersler başarıyla verildi' : 'Koçlukla yükseltilebilir'}
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Toplam Mali Yükümlülük
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-amber-700 mt-1">
              {formatTL(profile.financials.totalPayable)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 truncate">
              Harç + Kredi + 10.000 TL Burs
            </div>
          </div>
        </div>

        {/* Tab Selection Navigation */}
        <div className="bg-white rounded-2xl border border-slate-200 p-2 flex flex-wrap gap-2 shadow-xs">
          <button
            onClick={() => {
              setActiveTab('early_grad');
              trackClick('BUTTON', 'OBS Erken Mezuniyet Sekmesi', 'tab-obs-early-grad');
            }}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'early_grad'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-md'
                : 'text-amber-800 bg-amber-50/70 hover:bg-amber-100 font-bold border border-amber-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>⚡ Hızlandırılmış Erken Mezuniyet & Ödeme (IBAN)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('curriculum');
              trackClick('BUTTON', 'OBS Müfredat Sekmesi', 'tab-obs-curriculum');
            }}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'curriculum'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>Müfredat & Not Simülasyonu ({profile.courses.length} Ders)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('financials');
              trackClick('BUTTON', 'OBS Mali Sekme', 'tab-obs-financials');
            }}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'financials'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <DollarSign className="w-4 h-4 text-amber-400" />
            <span>Harç, Borç ve Burs Hesabı</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('calculators');
              trackClick('BUTTON', 'OBS Hesaplayıcılar Sekmesi', 'tab-obs-calculators');
            }}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'calculators'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Calculator className="w-4 h-4 text-indigo-400" />
            <span>Harç, Kredi & Not Hesaplayıcı</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('status_ops');
              trackClick('BUTTON', 'OBS Pasif Kayıt Sekmesi', 'tab-obs-status');
            }}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'status_ops'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-4 h-4 text-rose-400" />
            <span>Pasif Kayıt & Öğrenci Affı</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('elearn_portal');
              trackClick('BUTTON', 'OBS E-Öğrenme Sekmesi', 'tab-obs-elearn');
            }}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'elearn_portal'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Video className="w-4 h-4 text-teal-400" />
            <span>E-Öğrenme & Sınav Portalı</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('thesis');
              trackClick('BUTTON', 'OBS Tez Sekmesi', 'tab-obs-thesis');
            }}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'thesis'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span>Bitirme Projesi & İntihal</span>
          </button>
        </div>

        {/* TAB 0: HIZLANDIRILMIŞ ERKEN MEZUNİYET & BEKLEYEN ÖDEME (IBAN) */}
        {activeTab === 'early_grad' && (
          <div className="space-y-6">
            {/* MOTİVASYON VE SLOGAN BANNERI */}
            <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 border-2 border-amber-500/50 shadow-xl">
              <div className="absolute -right-8 -bottom-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-3xl">
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black uppercase tracking-wider border border-amber-400/40 inline-flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Resmi Erken Mezuniyet & Danışmanlık İntibakı
                  </span>
                  <h2 className="text-xl sm:text-3xl font-black text-amber-400 leading-tight">
                    "Diplomanı Geciktirme, Mezuniyetini Geciktirme! Hemen Mezun Ol, Hemen Diplomanı Al, İş Hayatına Atıl!"
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Sayın <strong>{profile.fullName}</strong>, intibak kaydınız başarıyla tamamlanmıştır. Eksik kredilerinizi ve alttan kalan derslerinizi danışmanınız <strong>{profile.assignedAdvisor || 'Prof. Dr. Murat DOĞAN'}</strong> rehberliğinde hızlandırarak <strong>2026 Ağustos Yaz Okulu</strong> sonunda resmi diplomanıza kavuşabilirsiniz.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 w-full md:w-auto shrink-0">
                  <button
                    onClick={onOpenIdCard}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-amber-500/40 shadow-xs cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4 text-amber-400" />
                    <span>Öğrenci Kartını Aç (PDF)</span>
                  </button>
                  <button
                    onClick={onOpenDiploma}
                    className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-md cursor-pointer"
                  >
                    <Award className="w-4 h-4 text-slate-950" />
                    <span>Resmi Diplomayı İndir (PDF)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* MEZUNİYET TARİHİ KARŞILAŞTIRMASI & KAZANIM ÇİZELGESİ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Standart Mezuniyet Süreci</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-bold">Normal Takvim</span>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-black font-mono text-slate-800">Haziran 2028 (4 Dönem Sonra)</div>
                  <p className="text-xs text-slate-500">
                    Gecikmiş dersler ve alttan kalanlar tek tek normal dönemlerde alındığında mezuniyet 2 yıl uzamaktadır.
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600 flex items-center justify-between">
                  <span>Mevcut Sınıf: <strong>{profile.currentClass || '3. Sınıf'}</strong></span>
                  <span>Eksik Ders: <strong className="text-amber-600">{missingCourses.length} Ders</strong></span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-amber-100/60 p-5 rounded-2xl border-2 border-amber-400/60 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-900 uppercase tracking-wider">⚡ Hızlandırılmış Erken Mezuniyet</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[11px] font-black">
                    1.5 Yıl Erken!
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-black font-mono text-amber-950">Ağustos 2026 (Yaz Okulu ile)</div>
                  <p className="text-xs text-amber-900/90 font-medium">
                    Danışman intibakı ve hızlandırılmış sınav kredilendirmesi ile 2026 yazında mezuniyet belgeniz tescillenir.
                  </p>
                </div>
                <div className="pt-2 border-t border-amber-200/80 text-[11px] text-amber-950 flex items-center justify-between">
                  <span>Atanan Danışman: <strong>{profile.assignedAdvisor || 'Prof. Dr. Murat DOĞAN'}</strong></span>
                  <button
                    onClick={() => setActiveTab('curriculum')}
                    className="text-amber-800 font-bold hover:underline"
                  >
                    Notları Simüle Et →
                  </button>
                </div>
              </div>
            </div>

            {/* BEKLEYEN TAHAKKUK & RESMİ IBAN EKRANI */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Sol: Bekleyen Tahakkuk Tablosu */}
              <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-amber-600" />
                    <h3 className="font-bold text-base text-slate-900">Bekleyen Tahakkuk / Harç Dökümü</h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black border border-amber-300">
                    Ödeme Bekliyor
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                    <div>
                      <div className="font-bold text-slate-800">Kayıt & İntibak Danışmanlık Harcı</div>
                      <div className="text-[11px] text-slate-500">Müfredat taraması ve senato intibak harcı</div>
                    </div>
                    <span className="font-mono font-bold text-slate-900">1.250,00 ₺</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                    <div>
                      <div className="font-bold text-slate-800">
                        Geçmiş Yıllara Ait Ödenmemiş Harçlar ({profile.financials.unpaidTuitionYears} Yıl)
                      </div>
                      <div className="text-[11px] text-slate-500">Dönem başına {department.termFee.toLocaleString('tr-TR')} ₺ x 2 dönem</div>
                    </div>
                    <span className="font-mono font-bold text-slate-900">{formatTL(profile.financials.totalTuitionDebt)}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                    <div>
                      <div className="font-bold text-slate-800">
                        Eksik Ders Tamamlama Bedeli ({profile.financials.missingAktsTotal} AKTS)
                      </div>
                      <div className="text-[11px] text-slate-500">Kredi başına {department.perCreditFee} ₺ hızlandırılmış yaz okulu</div>
                    </div>
                    <span className="font-mono font-bold text-slate-900">{formatTL(profile.financials.totalCoursesFee)}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                    <div>
                      <div className="font-bold text-slate-800">Öğrenim Bursu Borcu Mahsubu</div>
                      <div className="text-[11px] text-slate-500">Sabit üniversite burs geri ödeme yapılandırması</div>
                    </div>
                    <span className="font-mono font-bold text-slate-900">10.000,00 ₺</span>
                  </div>

                  {/* Toplam Barı */}
                  <div className="p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 flex items-center justify-between">
                    <div>
                      <div className="text-xs uppercase font-black text-amber-900 tracking-wider">TOPLAM BEKLEYEN TAHAKKUK</div>
                      <div className="text-[11px] text-slate-600">Tek seferde veya taksitli ödenebilir</div>
                    </div>
                    <div className="text-2xl font-black font-mono text-amber-800">
                      {formatTL(profile.financials.totalPayable)}
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsReceiptModalOpen(true)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-slate-500" />
                    <span>Mali Tahakkuk Makbuzu Al</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCommitModalOpen(true)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <FileCheck2 className="w-4 h-4 text-amber-400" />
                    <span>Mezuniyet Taahhütnamesi</span>
                  </button>
                </div>
              </div>

              {/* Sağ: Üniversite / Danışmanlık Resmi Banka IBAN Ekranı */}
              <div className="lg:col-span-6 bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-amber-400" />
                    <h3 className="font-bold text-base text-white">Resmi Banka & IBAN Bilgileri</h3>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-mono font-bold border border-teal-500/30">
                    GÜVENLİ BANKACILIK
                  </span>
                </div>

                <div className="space-y-3.5 text-xs">
                  {/* Banka Adı */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="text-[11px] text-slate-400 uppercase font-semibold">Banka Adı:</div>
                    <div className="font-bold text-white text-sm mt-0.5">
                      {siteSettings.bankName || 'T.C. Ziraat Bankası A.Ş.'}
                    </div>
                  </div>

                  {/* Hesap Sahibi */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="text-[11px] text-slate-400 uppercase font-semibold">Alıcı / Hesap Sahibi Ünvanı:</div>
                    <div className="font-bold text-amber-300 text-xs sm:text-sm mt-0.5">
                      {siteSettings.accountHolder || 'DiplomaTR Üniversite Akademik Koçluk ve Danışmanlık Hizmetleri A.Ş.'}
                    </div>
                  </div>

                  {/* IBAN Numarası with 1-click Copy */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border-2 border-amber-500/40 relative">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] text-amber-400 uppercase font-black tracking-wider">IBAN NUMARASI (TR):</span>
                      {copiedIban && (
                        <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                          <Check className="w-3 h-3" /> IBAN Kopyalandı!
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-bold text-white text-sm sm:text-base tracking-wider break-all">
                        {siteSettings.iban || 'TR32 0001 0002 0003 0004 0005 06'}
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard?.writeText(siteSettings.iban || 'TR32 0001 0002 0003 0004 0005 06');
                          setCopiedIban(true);
                          setTimeout(() => setCopiedIban(false), 2500);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shrink-0 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Kopyala</span>
                      </button>
                    </div>
                  </div>

                  {/* Havale Açıklama Referansı */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] text-slate-400 uppercase font-semibold">Zorunlu Havale/EFT Açıklaması:</span>
                      {copiedRef && (
                        <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Açıklama Kopyalandı!
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-amber-200 font-bold text-xs truncate">
                        {profile.studentNumber || profile.studentNo} - {profile.fullName} - Erken Mezuniyet Harci
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard?.writeText(`${profile.studentNumber || profile.studentNo} - ${profile.fullName} - Erken Mezuniyet Harci`);
                          setCopiedRef(true);
                          setTimeout(() => setCopiedRef(false), 2500);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs shrink-0 cursor-pointer"
                        title="Açıklamayı Kopyala"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed italic">
                    * {siteSettings.paymentInstructions || 'Ödeme açıklamasına Öğrenci Numaranızı ve Ad Soyadınızı mutlaka yazınız. Danışmanınız dekont bildiriminizden sonra intibak onayınızı işleyecektir.'}
                  </p>
                </div>

                {/* Dekont Yükleme & Bildirim Kutusu */}
                <div className="pt-3 border-t border-slate-800 space-y-3">
                  <div className="font-bold text-xs text-slate-200 flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-teal-400" />
                    <span>Ödememi Yaptım / Dekont Bildirimi Yap</span>
                  </div>

                  {paymentSubmitted ? (
                    <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
                      <span>
                        <strong>Ödeme bildiriminiz alındı!</strong> Danışmanınız <strong>{profile.assignedAdvisor}</strong> işlemi onayladığında transkript intibakınız sistemde aktif edilecektir.
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-2 text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={paymentSender}
                          onChange={(e) => setPaymentSender(e.target.value)}
                          placeholder="Gönderen Ad Soyad"
                          className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:ring-1 focus:ring-amber-500"
                        />
                        <select
                          value={paymentBank}
                          onChange={(e) => setPaymentBank(e.target.value)}
                          className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:ring-1 focus:ring-amber-500"
                        >
                          <option value="Ziraat Bankası">Ziraat Bankası</option>
                          <option value="VakıfBank">VakıfBank</option>
                          <option value="Halkbank">Halkbank</option>
                          <option value="Garanti BBVA">Garanti BBVA</option>
                          <option value="İş Bankası">İş Bankası</option>
                          <option value="Diğer Banka / FAST">Diğer Banka / FAST</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="flex-1 py-2 px-3 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-lg text-slate-400 text-xs flex items-center justify-between cursor-pointer">
                          <span>{paymentReceiptName || 'Dekont Dosyası Seç (PDF / JPG)'}</span>
                          <Upload className="w-3.5 h-3.5 text-slate-500" />
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                setPaymentReceiptName(e.target.files[0].name);
                              }
                            }}
                          />
                        </label>

                        <button
                          type="button"
                          onClick={() => {
                            setPaymentSubmitted(true);
                            logAuditEvent(
                              'payment_notify',
                              { id: String(profile.userId || profile.id), name: profile.fullName, role: 'student' },
                              `Öğrenci ödeme bildirimi yaptı: ${formatTL(paymentAmount)} - Banka: ${paymentBank} - Gönderen: ${paymentSender}`
                            );
                          }}
                          className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-lg shadow-sm cursor-pointer transition-colors"
                        >
                          Bildirimi Gönder
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: CURRICULUM & COURSE REGISTRATION */}
        {activeTab === 'curriculum' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>Ders İntibakı ve Not Durumu</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                    {department.totalSemesters} Yarıyıl
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                  Öğrencinin transkriptindeki eksik veya başarısız dersler listelenmiştir. Alttan veya üstten ders ekleyebilir,
                  manuel not düzenleyebilir veya koçluk sistemiyle eksik notları tamamlayabilirsiniz.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => setIsAddCourseModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Alttan / Üstten Ders Ekle</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsTranscriptModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4 text-slate-600" />
                  <span>Transkript Gönder</span>
                </button>

                {missingCourses.length > 0 && (
                  <button
                    onClick={handleApplyCoaching}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-extrabold flex items-center gap-2 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Koçluk ile Notları Tamamla ({missingCourses.length})</span>
                  </button>
                )}
              </div>
            </div>

            {/* Semester-by-Semester Tables */}
            <div className="space-y-6">
              {Object.keys(coursesByTerm).map((termStr) => {
                const termNum = Number(termStr);
                const courses = coursesByTerm[termNum];
                const termMissing = courses.filter((c) => !c.passed).length;

                return (
                  <div
                    key={termNum}
                    className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden"
                  >
                    <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-slate-900 text-white text-xs font-bold flex items-center justify-center font-mono">
                          {termNum}
                        </span>
                        <h4 className="font-bold text-sm text-slate-900">
                          {termNum}. Yarıyıl Dersleri
                        </h4>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500">
                          Toplam:{' '}
                          <strong className="text-slate-800 font-mono">
                            {courses.reduce((sum, c) => sum + c.akts, 0)} AKTS
                          </strong>
                        </span>
                        {termMissing > 0 ? (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                            {termMissing} Eksik Ders
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                            Tamamlandı
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-slate-50/50 text-slate-500 border-b border-slate-200 text-[11px] uppercase tracking-wider">
                            <th className="py-3 px-4">Ders Kodu</th>
                            <th className="py-3 px-4">Ders Adı</th>
                            <th className="py-3 px-3 text-center">Kredi</th>
                            <th className="py-3 px-3 text-center">AKTS</th>
                            <th className="py-3 px-3 text-center">Vize</th>
                            <th className="py-3 px-3 text-center">Final</th>
                            <th className="py-3 px-3 text-center">Harf Notu</th>
                            <th className="py-3 px-4 text-center">Durum</th>
                            <th className="py-3 px-3 text-right">İşlem</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {courses.map((c) => (
                            <tr
                              key={c.code}
                              className={`hover:bg-slate-50 transition-colors ${
                                !c.passed ? 'bg-amber-50/30' : ''
                              }`}
                            >
                              <td className="py-3 px-4 font-mono font-bold text-slate-700">
                                {c.code}
                              </td>
                              <td className="py-3 px-4 font-medium text-slate-900">
                                {c.name}
                              </td>
                              <td className="py-3 px-3 text-center font-mono text-slate-600">
                                {c.credit}
                              </td>
                              <td className="py-3 px-3 text-center font-mono text-slate-600">
                                {c.akts}
                              </td>
                              <td className="py-3 px-3 text-center font-mono">
                                {c.midterm > 0 ? c.midterm : '-'}
                              </td>
                              <td className="py-3 px-3 text-center font-mono">
                                {c.final > 0 ? c.final : '-'}
                              </td>
                              <td className="py-3 px-3 text-center">
                                <span
                                  className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${
                                    c.passed
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-red-100 text-red-700'
                                  }`}
                                >
                                  {c.letterGrade}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                                    c.passed
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                                  }`}
                                >
                                  {c.passed ? 'Geçti' : 'Kaldı / Eksik'}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsEditingCourse(c);
                                    setEditMidterm(c.midterm || 50);
                                    setEditFinal(c.final || 60);
                                  }}
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
                                  title="Notu Düzenle"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: FINANCIALS & TUITION DEBT BREAKDOWN */}
        {activeTab === 'financials' && (
          <div className="space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-amber-500" />
                    <span>Öğrenim Harcı, Eksik Kredi ve Burs Geri Ödeme Dökümü</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                    YÖK mevzuatı gereği kaç yıl geriden gelinmişse ödenmemiş harçların tümü, eksik kredilerin ücreti
                    ve tahsis edilen 10.000,00 TL öğrenim bursunun geri ödemesi tahakkuk ettirilir.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsReceiptModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer shrink-0"
                >
                  <Printer className="w-4 h-4 text-amber-400" />
                  <span>Resmi Tahakkuk Fişi & Dekont Yazdır</span>
                </button>
              </div>

              {/* Financial Calculation Breakdown Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <th className="p-3.5">Mali Borç Kalemi ve Açıklaması</th>
                      <th className="p-3.5 text-center">Birim / Çarpan</th>
                      <th className="p-3.5 text-right">Tahakkuk Eden Tutar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">
                          Ödenmemiş Dönemlik Öğrenim Harcı ({profile.financials.unpaidTuitionYears} Yıl)
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {profile.financials.unpaidSemestersCount} yarıyıl x {formatTL(profile.financials.semesterFee)} katkı payı harç bedeli
                        </div>
                      </td>
                      <td className="p-3.5 text-center font-mono">
                        {profile.financials.unpaidSemestersCount} Yarıyıl
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-slate-900">
                        {formatTL(profile.financials.totalTuitionDebt)}
                      </td>
                    </tr>

                    <tr>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">
                          Eksik / Başarısız Kredi Tamamlama Ücreti
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {profile.financials.missingCoursesCount} ders ({profile.financials.missingAktsTotal} AKTS) x {formatTL(department.perCreditFee)}
                        </div>
                      </td>
                      <td className="p-3.5 text-center font-mono">
                        {profile.financials.missingAktsTotal} AKTS
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-slate-900">
                        {formatTL(profile.financials.totalCoursesFee)}
                      </td>
                    </tr>

                    <tr>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">Öğrenim Bursu Geri Ödemesi</div>
                        <div className="text-[11px] text-slate-500">
                          Tüm öğrencilere tahsis edilen 10.000,00 TL öğrenim bursu borç bakiyesi
                        </div>
                      </td>
                      <td className="p-3.5 text-center font-mono">
                        Sabit Burs
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-slate-900">
                        {formatTL(profile.financials.scholarshipDebt)}
                      </td>
                    </tr>

                    <tr className="bg-amber-50/70 font-bold text-sm">
                      <td className="p-4 text-amber-950 font-black">
                        GENEL TOPLAM MALİ YÜKÜMLÜLÜK
                      </td>
                      <td className="p-4 text-center font-mono text-amber-900">
                        Nihai Bakiye
                      </td>
                      <td className="p-4 text-right font-mono font-black text-amber-900 text-base">
                        {formatTL(profile.financials.totalPayable)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Commitment Action Box */}
              <div className="p-5 rounded-2xl bg-slate-900 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-amber-400">
                    {profile.hasCommitted
                      ? 'Mezuniyet Şartları ve Mali Taahhütname Onaylandı'
                      : 'Mezuniyet Taahhütnamesini İnceleyin ve Onaylayın'}
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                    Yukarıdaki borç ve eksik ders yükümlülüklerini taahhüt ederek mezuniyet onayını alabilir,
                    resmi diplomayı ve geçici mezuniyet belgesini tescil ettirebilirsiniz.
                  </p>
                </div>

                {!profile.hasCommitted ? (
                  <button
                    onClick={() => setIsCommitModalOpen(true)}
                    className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-2 shadow-lg shadow-amber-500/20 shrink-0 cursor-pointer"
                  >
                    <FileCheck2 className="w-4 h-4" />
                    <span>Şartları Taahhüt Et & Mezun Ol</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Taahhütname Onaylıdır</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: AKADEMİK HESAPLAMA ARAÇLARI (PORTALA DAHİL) */}
        {activeTab === 'calculators' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Harç Hesaplayıcı */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                <DollarSign className="w-4 h-4" />
                <span>Harç ve Katkı Payı Simülatörü</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Kaç yarıyıl gecikme olduğunu ve alttan alınan AKTS miktarını değiştirerek borç tutarını hesaplayın.
              </p>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Gecikilen Yarıyıl: {calcHarcTerms}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="6"
                    value={calcHarcTerms}
                    onChange={(e) => setCalcHarcTerms(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Eksik AKTS: {calcHarcAkts}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    value={calcHarcAkts}
                    onChange={(e) => setCalcHarcAkts(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>
                <div className="p-3 bg-indigo-50 rounded-xl text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Harç Borcu:</span>
                    <span className="font-mono font-bold text-slate-900">{formatTL(calcHarcTerms * department.termFee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Kredi Borcu:</span>
                    <span className="font-mono font-bold text-slate-900">{formatTL(calcHarcAkts * department.perCreditFee)}</span>
                  </div>
                  <div className="flex justify-between border-t border-indigo-200 pt-1 font-bold text-indigo-900">
                    <span>Toplam Harç:</span>
                    <span className="font-mono">{formatTL(calcHarcTerms * department.termFee + calcHarcAkts * department.perCreditFee)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Kredi ve Burs Geri Ödeme */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                <GraduationCap className="w-4 h-4" />
                <span>Kredi & Burs Geri Ödeme</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                KYK bursu veya geri ödemeli öğrenim kredisi için taksit simülasyonu.
              </p>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Alınan Ay Sayısı: {calcKrediMonths} Ay
                  </label>
                  <input
                    type="range"
                    min="12"
                    max="48"
                    step="12"
                    value={calcKrediMonths}
                    onChange={(e) => setCalcKrediMonths(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>
                <div className="p-3 bg-indigo-50 rounded-xl text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Alınan Anapara:</span>
                    <span className="font-mono font-bold text-slate-900">{formatTL(calcKrediMonths * 2000)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Sabit Burs Borcu:</span>
                    <span className="font-mono font-bold text-slate-900">{formatTL(10000)}</span>
                  </div>
                  <div className="flex justify-between border-t border-indigo-200 pt-1 font-bold text-indigo-900">
                    <span>24 Ay Taksit:</span>
                    <span className="font-mono">{formatTL((calcKrediMonths * 2000 * 1.35 + 10000) / 24)} / ay</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Geçer Not ve Çan Eğrisi */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                <Award className="w-4 h-4" />
                <span>Geçer Not & Çan Eğrisi</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Vize ve Final notunuzun ortalamasını ve harf notu karşılığını hesaplayın.
              </p>

              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Vize Notu</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={calcVize}
                      onChange={(e) => setCalcVize(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-mono text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Final Notu</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={calcFinal}
                      onChange={(e) => setCalcFinal(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-mono text-xs font-bold"
                    />
                  </div>
                </div>

                {(() => {
                  const avg = Math.round(calcVize * 0.4 + calcFinal * 0.6);
                  const res = scoreToLetter(calcVize, calcFinal);
                  return (
                    <div className="p-3 bg-indigo-50 rounded-xl text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Ham Ağırlıklı Not:</span>
                        <span className="font-mono font-bold text-slate-900">{avg} Puan</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Harf Notu & Katsayı:</span>
                        <span className="font-mono font-bold text-indigo-700">{res.letterGrade} ({res.gradePoint.toFixed(1)})</span>
                      </div>
                      <div className="flex justify-between border-t border-indigo-200 pt-1 font-bold">
                        <span>Durum:</span>
                        <span className={res.passed ? 'text-emerald-700' : 'text-rose-700'}>
                          {res.passed ? 'Geçti (Başarılı)' : 'Kaldı (FF)'}
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PASİF KAYIT (KAYIT DONDURMA) & ÖĞRENCİ AFFI */}
        {activeTab === 'status_ops' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Pasif Kayıt / Kayıt Dondurma */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Kayıt Dondurma (Pasif Kayıt) Talebi</h3>
                  <p className="text-xs text-slate-500">Mazeret dilekçesi ile yarıyıl dondurma işlemi</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2">
                <p>
                  2547 Sayılı Yükseköğretim Kanunu ilgili maddesi uyarınca; sağlık, askerlik veya haklı ve geçerli
                  mazereti bulunan öğrenciler 2 yarıyıla kadar kayıt dondurma başvurusunda bulunabilirler.
                </p>
                <div className="flex items-center justify-between font-semibold pt-1 border-t border-slate-200">
                  <span>Mevcut Durum:</span>
                  <span className={`px-2 py-0.5 rounded font-bold ${
                    profile.status === 'passive' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {profile.status === 'passive' ? 'Pasif Kayıtlı' : 'Aktif Öğrenci'}
                  </span>
                </div>
              </div>

              {freezeSuccess && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold">
                  {freezeSuccess}
                </div>
              )}

              <button
                type="button"
                onClick={() => setIsFreezeModalOpen(true)}
                className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
              >
                Kayıt Dondurma Dilekçesi Ver
              </button>
            </div>

            {/* Öğrenci Affından Yararlanma */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Öğrenci Affından Yararlanma</h3>
                  <p className="text-xs text-slate-500">7417 Sayılı Af Kanunu İntibak Başvurusu</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2">
                <p>
                  Yükseköğretim kurumlarından ilişiği kesilen öğrencilerin af kanunu kapsamında eğitime geri dönüşü ve
                  geçmiş derslerinin YÖK denkliğine göre intibakının yapılmasını sağlar.
                </p>
                <div className="flex items-center justify-between font-semibold pt-1 border-t border-slate-200">
                  <span>Mevcut Durum:</span>
                  <span className={`px-2 py-0.5 rounded font-bold ${
                    profile.status === 'dismissed_amnesty' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {profile.status === 'dismissed_amnesty' ? 'Aftan Yararlanmış (İntibak)' : 'Standart Müfredat'}
                  </span>
                </div>
              </div>

              {amnestySuccess && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold">
                  {amnestySuccess}
                </div>
              )}

              <button
                type="button"
                onClick={() => setIsAmnestyModalOpen(true)}
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
              >
                Öğrenci Affı İntibak Başvurusu Yap
              </button>
            </div>
          </div>
        )}

        {/* TAB 5: BITIRME PROJESI / TEZ KONUSU */}
        {activeTab === 'thesis' && (
          <div className="space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                    {department.name} Bitirme Çalışması
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                    {profile.thesisTopic}
                  </h3>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  Danışman Onaylı
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-500">Tez / Proje Danışmanı:</span>
                  <div className="font-bold text-slate-900 mt-0.5">{profile.assignedAdvisor}</div>
                </div>
                <div>
                  <span className="text-slate-500">Kabul Tarihi:</span>
                  <div className="font-bold text-slate-900 mt-0.5">{profile.registrationDate || profile.createdAt?.substring(0, 10) || '08.11.2026'}</div>
                </div>
                <div>
                  <span className="text-slate-500">İntihal (Benzerlik) Oranı:</span>
                  <div className="font-bold text-emerald-600 mt-0.5">%8 (Kabul Sınırı Dahilinde)</div>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Bitirme tezi ve uygulamalı proje çalışması, YÖK lisans/ön lisans yeterlilik çerçevesine uygun olarak
                {profile.assignedAdvisor} denetiminde incelenmiş ve tam not ile kabul edilmiştir.
              </p>
            </div>
          </div>
        )}

        {/* TAB: E-ÖĞRENME & SINAV PORTALI (OBS PANELİ İÇİNDE GERİ PLANDA) */}
        {activeTab === 'elearn_portal' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-bold border border-teal-200">
                  OBS Entegre Akademi
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">E-Öğrenme, Video Dersler & Çıkmış Sorular</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Erken mezuniyet intibakınız için atanan video dersler, modül testleri ve geçmiş yıl çıkmış sınav soruları.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsExamModalOpen(true)}
                  className="px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  <span>Online Vize Sınavına Gir</span>
                </button>
              </div>
            </div>

            {/* Video Player Modal / Embed */}
            {activeVideoId && (
              <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Video className="w-5 h-5 text-amber-400" />
                    <h4 className="font-bold text-sm text-white">Video Ders İzleme Modülü (YouTube & Stream)</h4>
                  </div>
                  <button
                    onClick={() => setActiveVideoId(null)}
                    className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border border-slate-800">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${activeVideoId}?autoplay=1`}
                    title="Ders Videosu"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {/* Ders Kartları */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col hover:shadow-md transition-shadow"
                >
                  <div className="h-40 overflow-hidden relative">
                    <img
                      src={course.imageUrl}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold">
                      {course.category}
                    </span>
                  </div>

                  <div className="p-4 flex flex-col flex-grow space-y-3">
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug">{course.title}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed flex-grow">
                      {course.description}
                    </p>

                    <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveVideoId('dQw4w9WgXcQ')}
                        className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Play className="w-3 h-3 text-amber-400" /> Video İzle
                      </button>
                      <a
                        href="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
                        title="Ders Notunu İndir (PDF)"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Çıkmış Sorular & Arşiv */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Dönem Sonu Çıkmış Sorular & Sınav Arşivi</span>
                </h4>
                <span className="text-xs text-slate-500">{pastExams.length} Sınav Dosyası Mevcut</span>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {pastExams.map((pe) => (
                  <div key={pe.id} className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <div className="font-bold text-slate-900">{pe.title}</div>
                      <div className="text-[11px] text-slate-500">{pe.year} • {pe.fileName} ({pe.fileSize})</div>
                    </div>
                    <a
                      href={pe.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" /> İndir
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: SINAVLAR & GEÇİCİ MEZUNİYET BELGESİ */}
        {activeTab === 'exams' && (
          <div className="space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Öğrenci Sınav ve Mezuniyet Belgesi Modülü
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Girdiğiniz vize, final ve yeterlilik sınavlarının resmi sonuç kayıtları.
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setIsExamModalOpen(true)}
                    className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                  >
                    <Award className="w-4 h-4" />
                    <span>Yeterlilik Sınavına Gir</span>
                  </button>

                  {activeExamAttempt && (
                    <button
                      onClick={() => setIsCertificateModalOpen(true)}
                      className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-amber-400" />
                      <span>Geçici Mezuniyet Belgesi (PDF)</span>
                    </button>
                  )}
                </div>
              </div>

              {profile.examAttempts && profile.examAttempts.length > 0 ? (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                        <th className="p-3">Sınav Adı</th>
                        <th className="p-3 text-center">Tarih</th>
                        <th className="p-3 text-center">Puan</th>
                        <th className="p-3 text-center">Sonuç</th>
                        <th className="p-3 text-right">Belge</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {profile.examAttempts.map((attempt) => (
                        <tr key={attempt.id} className="hover:bg-slate-50">
                          <td className="p-3 font-semibold text-slate-900">
                            {attempt.targetTitle || attempt.examTitle || 'Yeterlilik Sınavı'}
                          </td>
                          <td className="p-3 text-center text-slate-500">
                            {attempt.completedAt?.substring(0, 10) || attempt.attemptDate || '08.11.2026'}
                          </td>
                          <td className="p-3 text-center font-mono font-bold text-slate-900">
                            {attempt.score} Puan
                          </td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              attempt.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {attempt.passed ? 'Başarılı' : 'Kaldı'}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => {
                                setActiveExamAttempt(attempt);
                                setIsCertificateModalOpen(true);
                              }}
                              className="text-xs text-amber-600 hover:text-amber-700 font-bold cursor-pointer"
                            >
                              Belgeyi Aç
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
                  Henüz kayıtlı bir sınav sonucunuz bulunmamaktadır.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: VESİKALIK FOTOĞRAF YÜKLEME (ADMİN ONAYI BEKLİYOR) */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <Camera className="w-5 h-5 text-amber-500" />
                <span>Vesikalık Fotoğraf Yükle</span>
              </div>
              <button onClick={() => setIsPhotoModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
              <span className="font-bold flex items-center gap-1.5 text-amber-950">
                <Info className="w-4 h-4 text-amber-600" /> Önemli Bilgilendirme:
              </span>
              <p>
                Yüklenen fotoğraf doğrudan kimlik kartı ve resmi diplomada kullanılır. Bu nedenle yüklediğiniz
                fotoğraf <strong>yönetici (admin) onayına</strong> gönderilir. Onaylanana kadar sistemde mevcut aktif fotoğrafınız gösterilir.
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-28 h-28 mx-auto rounded-2xl overflow-hidden border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50">
                {photoPreview ? (
                  <img src={photoPreview} alt="Önizleme" className="w-full h-full object-cover" />
                ) : (
                  <img src={profile.avatarUrl} alt="Mevcut Fotoğraf" className="w-full h-full object-cover opacity-60" />
                )}
              </div>

              <div>
                <label className="inline-block px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5 inline mr-1.5" />
                  Cihazdan Fotoğraf Seç (JPG/PNG)
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {photoMessage && (
              <div className="p-3 bg-slate-100 rounded-xl text-xs text-slate-800 text-center font-medium">
                {photoMessage}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsPhotoModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={handlePhotoSave}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md cursor-pointer"
              >
                Onaya Gönder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ALTTAN / ÜSTTEN DERS ALMA */}
      {isAddCourseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <Plus className="w-5 h-5 text-teal-600" />
                <span>Alttan / Üstten Ders Seçimi (Maks 45 AKTS)</span>
              </div>
              <button onClick={() => setIsAddCourseModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCourseSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Müfredattan Ders Seçiniz</label>
                <select
                  value={selectedCourseCode}
                  onChange={(e) => setSelectedCourseCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white"
                  required
                >
                  <option value="">-- Ders Seçiniz --</option>
                  {availableDeptCourses.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} - {c.name} ({c.term}. Yarıyıl, {c.akts} AKTS, {c.credit} Kredi)
                    </option>
                  ))}
                </select>
              </div>

              {addCourseError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium">
                  {addCourseError}
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddCourseModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Dersi Ekle & Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: KAYIT DONDURMA (PASİF KAYIT) DİLEKÇESİ */}
      {isFreezeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <Clock className="w-5 h-5 text-rose-600" />
                <span>Kayıt Dondurma (Pasif Kayıt) Mazeret Dilekçesi</span>
              </div>
              <button onClick={() => setIsFreezeModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFreezeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Mazeret Türü</label>
                <select
                  value={freezeReason}
                  onChange={(e) => setFreezeReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white"
                >
                  <option value="Sağlık Raporu (Heyet Kararı)">Sağlık Raporu (Tam Teşekküllü Hastane Heyet Kararı)</option>
                  <option value="Zorunlu Askerlik Hizmeti">Zorunlu Askerlik Hizmeti</option>
                  <option value="Maddi ve Ailevi Zorunlu Sebepler">Maddi ve Ailevi Zorunlu Sebepler</option>
                  <option value="Yurt Dışı Eğitim / Erasmus Stajı">Yurt Dışı Eğitim / Dil Eğitimi / Erasmus</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Dondurulacak Süre</label>
                <select
                  value={freezeSemesters}
                  onChange={(e) => setFreezeSemesters(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white"
                >
                  <option value={1}>1 Yarıyıl (Bahar)</option>
                  <option value={2}>2 Yarıyıl (1 Akademik Yıl)</option>
                </select>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl text-xs text-slate-600 space-y-1">
                <strong>Dilekçe Özeti:</strong>
                <p>
                  {university.name} Rektörlüğüne; yukarıda beyan ettiğim mazeretim nedeniyle öğrencilik kaydımın
                  ilgili yarıyıl süresince dondurulmasını saygılarımla arz ederim.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFreezeModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Dilekçeyi Onayla & Dondur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: ÖĞRENCİ AFFI BAŞVURUSU */}
      {isAmnestyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <span>7417 Sayılı YÖK Öğrenci Affı İntibak Başvurusu</span>
              </div>
              <button onClick={() => setIsAmnestyModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAmnestySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">İlişik Kesilme / Kayıp Yılı</label>
                <select
                  value={amnestyYear}
                  onChange={(e) => setAmnestyYear(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white"
                >
                  <option value="2025">2025 Yılı</option>
                  <option value="2024">2024 Yılı</option>
                  <option value="2023">2023 Yılı</option>
                  <option value="2022">2022 Yılı (7417 SK Kapsamı)</option>
                </select>
              </div>

              <div className="p-3.5 bg-purple-50 rounded-xl text-xs text-purple-900 space-y-1">
                <strong>Yasal Dayanak:</strong>
                <p>
                  7417 Sayılı Kanun Geçici 83. Madde uyarınca intibakınız yapılarak eksik dersleriniz başarı puanı
                  üzerinden tamamlanacaktır.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAmnestyModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Affa Başvur & İntibakı Başlat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: RESMİ TAHAKKUK VE DEKONT YAZDIRMA */}
      {isReceiptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-slate-900" />
                <h3 className="text-base font-bold text-slate-900">Resmi Mali Borç ve Tahakkuk Belgesi</h3>
              </div>
              <button onClick={() => setIsReceiptModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div id="financial-receipt" className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 text-xs font-mono">
              <div className="text-center pb-3 border-b border-slate-200">
                <h4 className="font-bold text-sm text-slate-900">{university.name}</h4>
                <p className="text-slate-500">Strateji Geliştirme Daire Başkanlığı • Öğrenci Tahakkuk Fişi</p>
                <p className="text-slate-400 text-[10px] mt-0.5">Tarih: 08.11.2026 • Fiş No: THK-2026-98124</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-700">
                <div>Öğrenci: <strong className="text-slate-900">{profile.fullName}</strong></div>
                <div>Öğrenci No: <strong className="text-slate-900">{profile.studentNumber || profile.studentNo}</strong></div>
                <div>T.C. Kimlik: <strong>{profile.tcNo}</strong></div>
                <div>Program: <strong>{department.name}</strong></div>
              </div>

              <div className="border-t border-b border-slate-200 py-2 space-y-1.5">
                <div className="flex justify-between">
                  <span>Ödenmemiş Harç ({profile.financials.unpaidTuitionYears} Yıl / {profile.financials.unpaidSemestersCount} Yarıyıl):</span>
                  <span>{formatTL(profile.financials.totalTuitionDebt)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Eksik AKTS Bedeli ({profile.financials.missingAktsTotal} AKTS):</span>
                  <span>{formatTL(profile.financials.totalCoursesFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Öğrenim Bursu Borcu:</span>
                  <span>{formatTL(profile.financials.scholarshipDebt)}</span>
                </div>
              </div>

              <div className="flex justify-between text-sm font-bold text-slate-900 pt-1">
                <span>GENEL TOPLAM BORÇ:</span>
                <span className="text-base text-amber-700">{formatTL(profile.financials.totalPayable)}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsReceiptModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
              >
                Kapat
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Yazdır (Baskı Al)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMMITMENT MODAL */}
      {isCommitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-4 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <FileCheck2 className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900">Resmi Mezuniyet Taahhütnamesi</h3>
              </div>
              <button
                onClick={() => setIsCommitModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 space-y-2 leading-relaxed">
              <p>
                Ben, <strong>{profile.fullName}</strong> (T.C. Kimlik No: {profile.tcNo}, Öğrenci No: {profile.studentNumber || profile.studentNo}),
                {university.name} {department.name} programındaki geçmiş {profile.financials.unpaidTuitionYears} yıla ait
                ödenmemiş harçları, eksik kredi bedellerini ve 10.000,00 TL tutarındaki öğrenim bursu borcumu
                (Toplam: {formatTL(profile.financials.totalPayable)}) ödeyeceğimi; intibak ve mezuniyet şartlarını sağladığımı
                beyan ve taahhüt ederim.
              </p>
            </div>

            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={commitmentAgreed}
                onChange={(e) => setCommitmentAgreed(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 mt-0.5 focus:ring-amber-500"
              />
              <span className="text-xs text-slate-700 font-medium">
                Yukarıdaki mali yükümlülükleri ve akademik intibak koşullarını okudum, anladım ve taahhüt ediyorum.
              </span>
            </label>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCommitModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                type="button"
                disabled={!commitmentAgreed}
                onClick={handleSignCommitment}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 text-xs font-extrabold flex items-center gap-2 shadow-md shadow-amber-500/20 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Taahhüdü İmzala & Mezuniyeti Onayla</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Course Edit Modal */}
      {isEditingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <span className="font-mono text-xs font-bold text-slate-500">{isEditingCourse.code}</span>
                <h4 className="font-bold text-sm text-slate-900">{isEditingCourse.name}</h4>
              </div>
              <button onClick={() => setIsEditingCourse(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Vize Notu (0 - 100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editMidterm}
                  onChange={(e) => setEditMidterm(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Final Notu (0 - 100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editFinal}
                  onChange={(e) => setEditFinal(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold text-sm"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditingCourse(null)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={handleSaveCourseEdit}
                className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transcript Submission Modal */}
      <TranscriptSubmissionModal
        isOpen={isTranscriptModalOpen}
        onClose={() => setIsTranscriptModalOpen(false)}
        profile={profile}
        department={department}
        onSubmit={handleTranscriptSubmit}
      />

      {/* Exam Modal */}
      <ExamModal
        isOpen={isExamModalOpen}
        onClose={() => setIsExamModalOpen(false)}
        profile={profile}
        onExamPassed={handleExamPassed}
      />

      {/* Temporary Certificate Modal */}
      <TemporaryCertificateModal
        isOpen={isCertificateModalOpen}
        onClose={() => setIsCertificateModalOpen(false)}
        profile={profile}
        university={university}
        department={department}
        attempt={activeExamAttempt}
      />
    </div>
  );
};
