import React, { useState } from 'react';
import { X, LogIn, UserPlus, Shield, GraduationCap, AlertCircle, Building2, BookOpen, Lock, Phone, Mail, User } from 'lucide-react';
import { Department, StudentProfile, StudentStatus, University } from '../../types';
import {
  generateStudentNumber,
  generateInitialCurriculum,
  calculateGPA,
  calculateFinancials,
  getDepartmentThesis,
  getStudentAvatar,
} from '../../utils/academicRules';
import { CONSULTANTS_AND_STAFF } from '../../data/departmentsAndUniversities';
import { getStoredClientIp, logAuditEvent } from '../admin/auditService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  universities: University[];
  departments: Department[];
  initialMode?: 'login' | 'register';
  preselectedDepartmentId?: string;
  onAuthenticated: (profile: StudentProfile) => void;
  existingStudents: StudentProfile[];
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  universities,
  departments,
  initialMode = 'register',
  preselectedDepartmentId,
  onAuthenticated,
  existingStudents,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [fullName, setFullName] = useState('');
  const [tcNo, setTcNo] = useState('');
  const [age, setAge] = useState<number>(24);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [universityId, setUniversityId] = useState<string>(universities[0]?.id || '');
  const [departmentId, setDepartmentId] = useState<string>(
    preselectedDepartmentId || departments[0]?.id || ''
  );
  const [status, setStatus] = useState<StudentStatus>('dismissed_amnesty');
  const [currentClass, setCurrentClass] = useState<string>('Uzatmalı (Artık Yıl)');
  const [delayedYears, setDelayedYears] = useState<number>(2);

  if (!isOpen) return null;

  const clientIp = getStoredClientIp();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanId = loginIdentifier.trim();
    if (!cleanId || !loginPassword.trim()) {
      setErrorMsg('Lütfen T.C. Kimlik No / Öğrenci No ve şifrenizi giriniz.');
      return;
    }

    // Find student in existing students
    const found = existingStudents.find(
      (s) =>
        s.tcNo === cleanId ||
        s.studentNumber === cleanId ||
        s.email?.toLowerCase() === cleanId.toLowerCase()
    );

    if (found) {
      logAuditEvent(
        'login',
        { id: found.userId, name: found.fullName, role: 'student' },
        `Öğrenci Bilgi Sistemi (OBS) girişi başarılı (${found.studentNumber})`,
        clientIp
      );
      onAuthenticated(found);
      onClose();
    } else {
      setErrorMsg('Girdiğiniz bilgilere ait aktif bir öğrenci kaydı bulunamadı. Lütfen "Kayıt Ol & Başvuru Yap" sekmesinden yeni başvuru oluşturunuz.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim() || fullName.trim().split(' ').length < 2) {
      setErrorMsg('Lütfen ad ve soyadınızı eksiksiz giriniz.');
      return;
    }

    if (!tcNo || tcNo.length !== 11 || !/^\d+$/.test(tcNo)) {
      setErrorMsg('T.C. Kimlik Numarası 11 haneli rakamlardan oluşmalıdır.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Lütfen geçerli bir e-posta adresi giriniz.');
      return;
    }

    if (!phone.trim()) {
      setErrorMsg('Lütfen iletişim telefon numaranızı giriniz.');
      return;
    }

    if (!password || password.length < 4) {
      setErrorMsg('Şifreniz en az 4 karakter olmalıdır.');
      return;
    }

    if (password !== passwordConfirm) {
      setErrorMsg('Girdiğiniz şifreler birbiriyle eşleşmiyor.');
      return;
    }

    const selectedUni = universities.find((u) => u.id === universityId) || universities[0];
    const selectedDept = departments.find((d) => d.id === departmentId) || departments[0];

    const studentNumber = generateStudentNumber(
      selectedUni.code,
      selectedDept.id,
      age,
      fullName
    );

    const initialCourses = generateInitialCurriculum(
      selectedDept,
      currentClass,
      delayedYears,
      status,
      fullName
    );

    const missing = initialCourses.filter((c) => !c.passed);
    const missingAkts = missing.reduce((sum, c) => sum + c.akts, 0);

    const financials = calculateFinancials(
      delayedYears,
      missing.length,
      missingAkts,
      selectedDept.termFee,
      selectedDept.perCreditFee,
      status
    );

    const studentId = `std-${Date.now()}`;
    const userId = `usr-${Date.now()}`;

    const parts = fullName.trim().split(/\s+/);
    const firstName = parts[0] || fullName.trim();
    const lastName = parts.slice(1).join(' ') || '';

    const newProfile: StudentProfile = {
      id: Date.now(),
      userId,
      studentNo: studentNumber,
      studentNumber,
      firstName,
      lastName,
      fullName: fullName.trim(),
      age,
      tcNo,
      email: email.trim(),
      phone: phone.trim(),
      password_text: password || 'Ogr.2026!',
      universityId: selectedUni.id,
      departmentId: selectedDept.id,
      status,
      currentClass,
      delayedYears,
      avatarUrl: getStudentAvatar(fullName),
      photoStatus: 'approved',
      bloodType: 'A Rh(+)',
      registrationDate: new Date().toISOString().slice(0, 10).replace(/-/g, '.'),
      registerIp: clientIp,
      assignedAdvisor: CONSULTANTS_AND_STAFF[0].name,
      thesisTopic: getDepartmentThesis(selectedDept, fullName),
      courses: initialCourses,
      financials,
      hasCommitted: false,
      isGraduated: false,
      gpa: calculateGPA(initialCourses),
      totalScore: 100,
      allowScoreboard: true,
      transcriptSubmissions: [],
      examAttempts: [],
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    logAuditEvent(
      'register',
      { id: userId, name: newProfile.fullName, role: 'student' },
      `Yeni öğrenci kaydı & intibak başvurusu oluşturuldu: ${selectedDept.name} (${selectedUni.code}), Öğrenci No: ${studentNumber}`,
      clientIp
    );

    logAuditEvent(
      'login',
      { id: userId, name: newProfile.fullName, role: 'student' },
      `Öğrenci Bilgi Sistemi (OBS) ilk oturumu başlatıldı.`,
      clientIp
    );

    onAuthenticated(newProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-4">
        {/* Modal Top Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Öğrenci Bilgi Sistemi & Kayıt</h2>
              <p className="text-xs text-slate-400">diplomatr.com / obs Güvenli Erişim Portali</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2">
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMsg(null);
            }}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              mode === 'register'
                ? 'border-amber-500 text-slate-950'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <UserPlus className="w-4 h-4 text-amber-500" />
            <span>Kayıt Ol & Mezuniyet Başvurusu</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg(null);
            }}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              mode === 'login'
                ? 'border-amber-500 text-slate-950'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <LogIn className="w-4 h-4 text-amber-500" />
            <span>Öğrenci Girişi</span>
          </button>
        </div>

        {/* Form Container */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {mode === 'login' ? (
            /* Login Form */
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  T.C. Kimlik No / Öğrenci No / E-posta
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="T.C. Kimlik No veya Öğrenci Numaranız"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Şifre
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="OBS Giriş Şifreniz"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-[11px] flex items-center justify-between">
                <span>Bağlantı Güvenliği: SSL 256-Bit</span>
                <span className="font-mono text-slate-600">IP: {clientIp}</span>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-slate-900/10 transition-colors cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-amber-400" />
                <span>Öğrenci Bilgi Sistemine Giriş Yap</span>
              </button>
            </form>
          ) : (
            /* Registration Form */
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ad Soyad
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Örn: Ahmet Yılmaz"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    T.C. Kimlik Numarası (11 Hane)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={11}
                    value={tcNo}
                    onChange={(e) => setTcNo(e.target.value.replace(/\D/g, ''))}
                    placeholder="Örn: 28491028472"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Yaş
                  </label>
                  <input
                    type="number"
                    min={18}
                    max={75}
                    required
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    E-posta
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ornek@ogrenci.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Telefon Numarası
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0541 914 12 48"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Şifre Belirleyin
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="En az 4 karakter"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Şifre Tekrarı
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    placeholder="Şifrenizi doğrulayın"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Academic Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Üniversite
                  </label>
                  <select
                    value={universityId}
                    onChange={(e) => setUniversityId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                  >
                    {universities.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.code} - {u.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bölüm / Program
                  </label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.type.includes('2') ? 'Ön Lisans' : 'Lisans'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status and Class */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Öğrencilik Durumu
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as StudentStatus)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                  >
                    <option value="dismissed_amnesty">Kaydı Silinmiş (Öğrenci Affı İntibak)</option>
                    <option value="passive">Pasif Kayıt / Yenileme Bekleyen</option>
                    <option value="active">Aktif Öğrenci</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bulunduğu Sınıf
                  </label>
                  <select
                    value={currentClass}
                    onChange={(e) => setCurrentClass(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                  >
                    <option value="Uzatmalı (Artık Yıl)">Uzatmalı (Artık Yıl)</option>
                    <option value="4. Sınıf (Son Sınıf)">4. Sınıf (Son Sınıf)</option>
                    <option value="3. Sınıf">3. Sınıf</option>
                    <option value="2. Sınıf">2. Sınıf</option>
                    <option value="1. Sınıf">1. Sınıf</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Gecikme / Boşta Geçen Yıl
                  </label>
                  <select
                    value={delayedYears}
                    onChange={(e) => setDelayedYears(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                  >
                    <option value={0}>0 Yıl (Zamanında)</option>
                    <option value={1}>1 Yıl Gecikmeli</option>
                    <option value={2}>2 Yıl Gecikmeli</option>
                    <option value={3}>3 Yıl Gecikmeli</option>
                    <option value={4}>4 Yıl Gecikmeli</option>
                    <option value={5}>5+ Yıl Gecikmeli</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-center justify-between">
                <span>Kayıt İstemci IP Adresi:</span>
                <span className="font-mono font-bold">{clientIp} (Güvenlik Denetiminde Kaydedilecektir)</span>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Kaydı Tamamla & Öğrenci OBS Ekranına Geç</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
