import React, { useState } from 'react';
import { useElearn } from '../../context/ElearnContext';
import {
  Search,
  UserPlus,
  CheckCircle,
  XCircle,
  ShieldCheck,
  Mail,
  Phone,
  Eye,
  EyeOff,
  Image,
  Clock,
  Check,
  X,
  CreditCard,
  Building,
  KeyRound,
  Download,
} from 'lucide-react';
import { Student } from '../../types';

export const AdminStudentsTab: React.FC = () => {
  const {
    students,
    toggleStudentStatus,
    addStudent,
    approveStudentPhoto,
    rejectStudentPhoto,
    exportCsv,
  } = useElearn();

  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<{ [id: number]: boolean }>({});

  const [newStudent, setNewStudent] = useState<{
    studentNo: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password_text: string;
    tcNo: string;
    universityId: string;
    departmentId: string;
    currentClass: string;
    allowScoreboard: boolean;
  }>({
    studentNo: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password_text: 'Ogr.2026!',
    tcNo: '',
    universityId: 'ankara',
    departmentId: 'bilgisayar-muhendisligi',
    currentClass: '1. Sınıf',
    allowScoreboard: true,
  });

  const togglePasswordVisibility = (id: number) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredStudents = students.filter(
    (s) =>
      s.studentNo.toLowerCase().includes(search.toLowerCase()) ||
      s.firstName.toLowerCase().includes(search.toLowerCase()) ||
      s.lastName.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.phone?.includes(search)
  );

  // Students with pending photo approval
  const pendingPhotoStudents = students.filter(
    (s) => s.photoStatus === 'pending' && s.pendingAvatarUrl
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.studentNo || !newStudent.firstName || !newStudent.lastName || !newStudent.email || !newStudent.phone) {
      alert('Lütfen telefon dahil tüm zorunlu alanları doldurunuz.');
      return;
    }

    const fullName = `${newStudent.firstName.trim()} ${newStudent.lastName.trim()}`;
    addStudent({
      studentNo: newStudent.studentNo.trim(),
      firstName: newStudent.firstName.trim(),
      lastName: newStudent.lastName.trim(),
      fullName,
      email: newStudent.email.trim(),
      phone: newStudent.phone.trim(),
      password_text: newStudent.password_text || 'Ogr.2026!',
      tcNo: newStudent.tcNo || '1' + Math.floor(1000000000 + Math.random() * 9000000000).toString(),
      universityId: newStudent.universityId,
      departmentId: newStudent.departmentId,
      currentClass: newStudent.currentClass,
      delayedYears: 0,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=0284c7&color=ffffff&size=256&bold=true`,
      photoStatus: 'approved',
      status: 'active',
      allowScoreboard: newStudent.allowScoreboard,
      gpa: 2.5,
      courses: [],
      financials: {
        unpaidTuitionYears: 0,
        unpaidSemestersCount: 0,
        semesterFee: 3750,
        totalTuitionDebt: 0,
        missingCoursesCount: 0,
        missingAktsTotal: 0,
        totalCoursesFee: 0,
        scholarshipDebt: 10000,
        totalPayable: 10000,
      },
    });

    setShowAddModal(false);
    setNewStudent({
      studentNo: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password_text: 'Ogr.2026!',
      tcNo: '',
      universityId: 'ankara',
      departmentId: 'bilgisayar-muhendisligi',
      currentClass: '1. Sınıf',
      allowScoreboard: true,
    });
  };

  return (
    <div className="space-y-6">
      {/* Üst Başlık & Eylemler */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-800">Öğrenci Yönetimi</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800">
              {students.length} Kayıtlı Öğrenci
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Öğrenci profilleri, telefon bilgileri, veritabanı çıplak parolaları (password_text) ve fotoğraf onayları
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => exportCsv('students')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Öğrenci Listesini İndir (CSV)
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer"
          >
            <UserPlus className="w-4 h-4" /> Yeni Öğrenci Ekle
          </button>
        </div>
      </div>

      {/* Fotoğraf Onay Bekleyenler Bannerı */}
      {pendingPhotoStudents.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
              <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
              <span>Admin Onayı Bekleyen Öğrenci Fotoğrafları ({pendingPhotoStudents.length})</span>
            </div>
            <span className="text-xs text-amber-700">
              * Onaylanan fotoğraflar Öğrenci Kimlik Kartı ve Diplomada aktif olacaktır.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingPhotoStudents.map((st) => (
              <div
                key={st.id}
                className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={st.pendingAvatarUrl}
                      alt={st.fullName}
                      className="w-14 h-14 rounded-full object-cover border-2 border-amber-400"
                    />
                    <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 bg-amber-500 text-white text-[9px] font-bold rounded-full">
                      Yeni
                    </span>
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{st.fullName}</div>
                    <div className="text-xs text-slate-500 font-mono">No: {st.studentNo}</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" /> {st.phone}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 shrink-0">
                  <button
                    onClick={() => approveStudentPhoto(st.id)}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                    title="Fotoğrafı Onayla ve Kimlik Kartında Aktif Et"
                  >
                    <Check className="w-3.5 h-3.5" /> Onayla
                  </button>
                  <button
                    onClick={() => rejectStudentPhoto(st.id)}
                    className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    title="Fotoğrafı Reddet"
                  >
                    <X className="w-3.5 h-3.5" /> Reddet
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Arama Çubuğu */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
        <div className="relative flex-grow">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Öğrenci no, ad, soyad, e-posta veya telefon ile ara..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Öğrenci Tablosu */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Öğrenci</th>
                <th className="px-5 py-3.5">Öğrenci No & TC</th>
                <th className="px-5 py-3.5">Telefon (Zorunlu Alan)</th>
                <th className="px-5 py-3.5">
                  <div className="flex items-center gap-1 text-amber-700">
                    <KeyRound className="w-3.5 h-3.5" /> Parola (password_text)
                  </div>
                </th>
                <th className="px-5 py-3.5">Akademik Durum</th>
                <th className="px-5 py-3.5">Fotoğraf Onayı</th>
                <th className="px-5 py-3.5 text-right">Durum / İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((student) => {
                const isPassVisible = visiblePasswords[student.id];
                return (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Öğrenci Avatarı ve Ad Soyad */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={student.avatarUrl}
                          alt={student.fullName}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 bg-slate-100 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{student.fullName}</div>
                          <div className="text-xs text-slate-400 flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {student.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* No & TC */}
                    <td className="px-5 py-3.5 font-mono text-xs">
                      <div className="font-bold text-slate-800">{student.studentNo}</div>
                      <div className="text-slate-400">TC: {student.tcNo || 'Belirtilmedi'}</div>
                    </td>

                    {/* Zorunlu Telefon */}
                    <td className="px-5 py-3.5 text-xs">
                      <div className="font-semibold text-slate-800 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-teal-600" />
                        <span>{student.phone}</span>
                      </div>
                    </td>

                    {/* Çıplak Parola (password_text) */}
                    <td className="px-5 py-3.5 text-xs font-mono">
                      <div className="flex items-center gap-2 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 w-fit">
                        <span className="font-bold text-slate-800 select-all">
                          {isPassVisible ? (
                            student.password_text
                          ) : (
                            '••••••••'
                          )}
                        </span>
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility(student.id)}
                          className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                          title={isPassVisible ? 'Şifreyi Gizle' : 'Çıplak Şifreyi Göster (password_text)'}
                        >
                          {isPassVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-amber-600" />}
                        </button>
                      </div>
                    </td>

                    {/* Akademik Durum & Sınıf */}
                    <td className="px-5 py-3.5 text-xs">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md font-semibold text-[11px] ${
                          student.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : student.status === 'passive'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}
                      >
                        {student.status === 'active'
                          ? 'Aktif Öğrenci'
                          : student.status === 'passive'
                          ? 'Pasif Kayıt / Donduruldu'
                          : 'Öğrenci Affı Kapsamı'}
                      </span>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {student.currentClass || '1. Sınıf'} • GNO: {(student.gpa ?? 0).toFixed(2)}
                      </div>
                    </td>

                    {/* Fotoğraf Onayı Durumu */}
                    <td className="px-5 py-3.5 text-xs">
                      {student.photoStatus === 'pending' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[11px]">
                          <Clock className="w-3 h-3" /> Onay Bekliyor
                        </span>
                      ) : student.photoStatus === 'approved' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                          <CheckCircle className="w-3 h-3" /> Onaylandı
                        </span>
                      ) : student.photoStatus === 'rejected' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[11px]">
                          <XCircle className="w-3 h-3" /> Reddedildi
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">Standart</span>
                      )}
                    </td>

                    {/* İşlem */}
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => toggleStudentStatus(student.id)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                          student.status === 'active'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {student.status === 'active' ? 'Aktif' : 'Pasife Al'}
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400 text-sm">
                    Arama kriterine uygun öğrenci bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Yeni Öğrenci Ekle Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">
              Yeni Öğrenci Tanımla
            </h3>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Öğrenci Numarası *</label>
                  <input
                    type="text"
                    required
                    value={newStudent.studentNo}
                    onChange={(e) => setNewStudent({ ...newStudent, studentNo: e.target.value })}
                    placeholder="202610199"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">TC Kimlik No</label>
                  <input
                    type="text"
                    maxLength={11}
                    value={newStudent.tcNo}
                    onChange={(e) => setNewStudent({ ...newStudent, tcNo: e.target.value })}
                    placeholder="11 Haneli TC"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Ad *</label>
                  <input
                    type="text"
                    required
                    value={newStudent.firstName}
                    onChange={(e) => setNewStudent({ ...newStudent, firstName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Soyad *</label>
                  <input
                    type="text"
                    required
                    value={newStudent.lastName}
                    onChange={(e) => setNewStudent({ ...newStudent, lastName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">E-Posta Adresi *</label>
                <input
                  type="email"
                  required
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                  placeholder="ad.soyad@ogrenci.edu.tr"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                  <span>Telefon Numarası (ZORUNLU ALAN) *</span>
                  <span className="text-[11px] text-teal-700 font-semibold">+90 5XX XXX XX XX</span>
                </label>
                <input
                  type="tel"
                  required
                  value={newStudent.phone}
                  onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                  placeholder="0541 914 12 01"
                  className="w-full px-3 py-2 rounded-xl border border-teal-300 bg-teal-50/20 text-sm focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                  <span>Başlangıç Parolası (DB password_text olarak çıplak kaydedilir) *</span>
                </label>
                <input
                  type="text"
                  required
                  value={newStudent.password_text}
                  onChange={(e) => setNewStudent({ ...newStudent, password_text: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-amber-50/20 text-sm font-mono focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Sınıf Düzeyi</label>
                  <select
                    value={newStudent.currentClass}
                    onChange={(e) => setNewStudent({ ...newStudent, currentClass: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="1. Sınıf">1. Sınıf</option>
                    <option value="2. Sınıf">2. Sınıf</option>
                    <option value="3. Sınıf">3. Sınıf</option>
                    <option value="4. Sınıf">4. Sınıf</option>
                    <option value="Uzatmalı">Uzatmalı Dönem</option>
                    <option value="Af Kapsamı">Af Kapsamı</option>
                  </select>
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={newStudent.allowScoreboard}
                      onChange={(e) => setNewStudent({ ...newStudent, allowScoreboard: e.target.checked })}
                      className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                    />
                    <span>Skorboardda Göster</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  Öğrenciyi Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
