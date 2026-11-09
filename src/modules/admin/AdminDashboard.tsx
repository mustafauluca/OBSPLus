import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  ShieldAlert,
  Plus,
  Trash2,
  ExternalLink,
  GraduationCap,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Send,
  FileText,
  Activity,
  Award,
} from 'lucide-react';
import { Department, StudentProfile, University, TranscriptSubmission } from '../../types';
import { getAuditLogs, logAuditEvent, clearAuditLogs } from './auditService';
import { AuditLog } from '../../types';

interface AdminDashboardProps {
  universities: University[];
  onAddUniversity: (uni: University) => void;
  onDeleteUniversity: (uniId: string) => void;
  students: StudentProfile[];
  departments: Department[];
  onSelectStudent: (student: StudentProfile) => void;
  onReturnToHome: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  universities,
  onAddUniversity,
  onDeleteUniversity,
  students,
  departments,
  onSelectStudent,
  onReturnToHome,
}) => {
  const [activeTab, setActiveTab] = useState<'universities' | 'students' | 'transcripts' | 'logs'>('universities');
  const [isAddUniModalOpen, setIsAddUniModalOpen] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [studentSearchQuery, setStudentSearchQuery] = useState('');

  // New university form
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newRector, setNewRector] = useState('');
  const [newDean, setNewDean] = useState('');

  useEffect(() => {
    setAuditLogs(getAuditLogs());
  }, [activeTab]);

  const handleCreateUniversity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || !newName.trim()) return;

    const newUni: University = {
      id: `uni-${Date.now()}`,
      code: newCode.trim().toUpperCase(),
      name: newName.trim(),
      city: newCity.trim() || 'Ankara',
      rectorName: newRector.trim() || 'Prof. Dr. Murat DOĞAN',
      deanName: newDean.trim() || 'Prof. Dr. Ceyda SÖZER',
      sealColor: '#855827',
      badgeBg: 'bg-slate-900',
      establishedYear: 2026,
    };

    onAddUniversity(newUni);

    logAuditEvent(
      'university_add',
      { name: 'Yönetici', role: 'admin' },
      `Yeni üniversite tescil edildi: ${newUni.code} - ${newUni.name}`
    );

    setNewCode('');
    setNewName('');
    setNewCity('');
    setNewRector('');
    setNewDean('');
    setIsAddUniModalOpen(false);
  };

  const handleDeleteUni = (uni: University) => {
    if (confirm(`${uni.code} - ${uni.name} üniversitesini silmek istediğinize emin misiniz?`)) {
      onDeleteUniversity(uni.id);
      logAuditEvent(
        'university_delete',
        { name: 'Yönetici', role: 'admin' },
        `Üniversite kaydı silindi: ${uni.code} - ${uni.name}`
      );
    }
  };

  // Collect all transcript submissions from all students
  const allSubmissions: { sub: TranscriptSubmission; std: StudentProfile }[] = [];
  students.forEach((s) => {
    if (s.transcriptSubmissions) {
      s.transcriptSubmissions.forEach((sub) => {
        allSubmissions.push({ sub, std: s });
      });
    }
  });

  const filteredLogs = auditLogs.filter((log) => {
    const q = logSearchQuery.toLowerCase();
    return (
      log.userName.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
      log.ipAddress.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q)
    );
  });

  const filteredStudents = students.filter((s) => {
    const q = studentSearchQuery.toLowerCase();
    const sNum = (s.studentNumber || s.studentNo || '').toLowerCase();
    const sTc = (s.tcNo || '');
    return (
      (s.fullName || '').toLowerCase().includes(q) ||
      sNum.includes(q) ||
      sTc.includes(q)
    );
  });

  return (
    <div className="bg-slate-100 min-h-screen py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Top Bar */}
        <div className="bg-slate-900 rounded-2xl p-5 sm:p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-md">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                  diplomatr.com Yönetim Paneli
                </span>
                <span className="text-xs text-slate-400">YÖK İntibak & Akreditasyon Merkezi</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-0.5">
                Akademik İdare & Güvenlik Denetim Portali
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsAddUniModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-md transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Üniversite Ekle</span>
            </button>
            <button
              onClick={onReturnToHome}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              Ana Sayfaya Dön
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl border border-slate-200 p-2 flex flex-wrap gap-2 shadow-xs">
          <button
            onClick={() => setActiveTab('universities')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'universities'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Building2 className="w-4 h-4 text-amber-400" />
            <span>Tescilli Üniversiteler ({universities.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('students')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'students'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4 text-amber-400" />
            <span>Öğrenci Dosyaları & Başvurular ({students.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('transcripts')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'transcripts'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span>Transkript Talepleri ({allSubmissions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'logs'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Activity className="w-4 h-4 text-amber-400" />
            <span>İşlem ve Güvenlik Logları ({auditLogs.length})</span>
          </button>
        </div>

        {/* Tab 1: Universities */}
        {activeTab === 'universities' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {universities.map((uni) => (
              <div
                key={uni.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-serif font-black text-xl flex items-center justify-center shadow-xs">
                        {uni.code}
                      </div>
                      <div>
                        <div className="text-xs font-mono font-bold text-amber-700">{uni.code}</div>
                        <div className="text-xs text-slate-400">{uni.city}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteUni(uni)}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Üniversiteyi Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mt-3 leading-snug">
                    {uni.name}
                  </h3>

                  <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                    <div>
                      <span className="text-slate-400">Rektör:</span>{' '}
                      <span className="font-semibold text-slate-800">{uni.rectorName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Dekan / Müdür:</span>{' '}
                      <span className="font-semibold text-slate-800">{uni.deanName}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>14 Bölüm İntibakı Aktif</span>
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Tescilli
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Students */}
        {activeTab === 'students' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative max-w-sm w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="İsim, Öğrenci No veya T.C. ile ara..."
                  value={studentSearchQuery}
                  onChange={(e) => setStudentSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                />
              </div>
              <div className="text-xs text-slate-500 font-medium">
                Toplam {filteredStudents.length} kayıt listelendi
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Öğrenci</th>
                    <th className="p-3.5">Öğrenci No / T.C.</th>
                    <th className="p-3.5">Bölüm & Üniversite</th>
                    <th className="p-3.5 text-center">Durum</th>
                    <th className="p-3.5 text-center">GNO</th>
                    <th className="p-3.5 text-center">Kayıt IP</th>
                    <th className="p-3.5 text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((std) => {
                    const uni = universities.find((u) => u.id === std.universityId);
                    const dept = departments.find((d) => d.id === std.departmentId);
                    return (
                      <tr key={std.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900">{std.fullName}</div>
                          <div className="text-[11px] text-slate-500">{std.email}</div>
                        </td>
                        <td className="p-3.5 font-mono">
                          <div className="font-bold text-amber-700">{std.studentNumber}</div>
                          <div className="text-[11px] text-slate-500">{std.tcNo}</div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-semibold text-slate-900">{dept?.name || 'Bölüm'}</div>
                          <div className="text-[11px] text-slate-500">{uni?.code} - {uni?.name}</div>
                        </td>
                        <td className="p-3.5 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full font-semibold text-[11px] ${
                              std.isGraduated
                                ? 'bg-emerald-100 text-emerald-800'
                                : std.status === 'dismissed_amnesty'
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {std.isGraduated ? 'Mezun' : std.status === 'dismissed_amnesty' ? 'Öğrenci Affı' : 'Kayıtlı'}
                          </span>
                        </td>
                        <td className="p-3.5 text-center font-mono font-bold text-slate-900">
                          {std.gpa.toFixed(2)}
                        </td>
                        <td className="p-3.5 text-center font-mono text-[11px] text-slate-600">
                          {std.registerIp || '176.234.88.14'}
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => onSelectStudent(std)}
                            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 ml-auto cursor-pointer"
                          >
                            <span>OBS'yi Aç</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Transcripts */}
        {activeTab === 'transcripts' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Öğrencilerden Gelen Transkript İnceleme Talepleri
            </h3>
            {allSubmissions.length > 0 ? (
              <div className="space-y-3">
                {allSubmissions.map(({ sub, std }) => (
                  <div
                    key={sub.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{sub.studentName}</span>
                        <span className="text-xs font-mono text-slate-500">({std.studentNumber})</span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold">
                          {sub.status === 'pending' ? 'İnceleme Bekliyor' : 'Onaylandı'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 mt-1">
                        <strong>Öğrenci Notu:</strong> {sub.studentNote}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">Tarih: {sub.submittedAt}</div>
                    </div>

                    <button
                      onClick={() => onSelectStudent(std)}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shrink-0 cursor-pointer"
                    >
                      Transkripti İncele & Not Onayla
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-slate-500">
                Henüz danışman onayına gönderilmiş bekleyen bir transkript talebi bulunmuyor.
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Audit Logs */}
        {activeTab === 'logs' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative max-w-sm w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Kullanıcı, IP veya işlem ara..."
                  value={logSearchQuery}
                  onChange={(e) => setLogSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    clearAuditLogs();
                    setAuditLogs([]);
                  }}
                  className="px-3 py-1.5 rounded-lg text-slate-500 hover:text-red-600 text-xs font-semibold cursor-pointer"
                >
                  Logları Sıfırla
                </button>
                <button
                  type="button"
                  onClick={() => setAuditLogs(getAuditLogs())}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Yenile
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Zaman Damgası</th>
                    <th className="p-3.5">Kullanıcı</th>
                    <th className="p-3.5">Rol</th>
                    <th className="p-3.5">İşlem Kodu</th>
                    <th className="p-3.5">İstemci IP Adresi</th>
                    <th className="p-3.5">Açıklama / Güvenlik Detayı</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="p-3.5 font-mono text-slate-500 whitespace-nowrap">
                        {log.timestamp}
                      </td>
                      <td className="p-3.5 font-semibold text-slate-900 whitespace-nowrap">
                        {log.userName}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            log.userRole === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : log.userRole === 'advisor'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {log.userRole}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-slate-700 whitespace-nowrap">
                        {log.action}
                      </td>
                      <td className="p-3.5 font-mono font-semibold text-amber-700 whitespace-nowrap">
                        {log.ipAddress}
                      </td>
                      <td className="p-3.5 text-slate-600 max-w-md leading-relaxed">
                        {log.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add University Modal */}
      {isAddUniModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Yeni Üniversite Tescil Et</h3>
            <form onSubmit={handleCreateUniversity} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Üniversite Kısaltması / Kodu (Örn: DEÜ, İÜ, MEÜ)
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="Örn: DEÜ"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold uppercase"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tam Üniversite Adı
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Örn: Dokuz Eylül Üniversitesi"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Şehir</label>
                <input
                  type="text"
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  placeholder="Örn: İzmir"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rektör Adı</label>
                <input
                  type="text"
                  value={newRector}
                  onChange={(e) => setNewRector(e.target.value)}
                  placeholder="Prof. Dr. Nükhet HOTAR"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Dekan Adı</label>
                <input
                  type="text"
                  value={newDean}
                  onChange={(e) => setNewDean(e.target.value)}
                  placeholder="Prof. Dr. Selçuk BAŞAR"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddUniModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800"
                >
                  Kaydet & Tescil Et
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
