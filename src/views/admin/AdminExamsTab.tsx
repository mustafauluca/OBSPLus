import React, { useState } from 'react';
import { useElearn } from '../../context/ElearnContext';
import { Plus, Edit2, Trash2, Award, Clock, Calendar } from 'lucide-react';
import { Exam } from '../../types';

export const AdminExamsTab: React.FC = () => {
  const { exams, courses, saveExam, deleteExam } = useElearn();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | string | null>(null);

  const [form, setForm] = useState({
    courseId: courses[0]?.id || 1,
    title: '',
    description: '',
    questionCount: 4,
    durationMinutes: 30,
    passingGrade: 60,
    maxAttempts: 3,
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    isActive: true,
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({
      courseId: courses[0]?.id || 1,
      title: '',
      description: '',
      questionCount: 4,
      durationMinutes: 30,
      passingGrade: 60,
      maxAttempts: 3,
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      isActive: true,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (exam: Exam) => {
    setEditingId(exam.id);
    const parsedCourseId = typeof exam.courseId === 'string' ? parseInt(exam.courseId, 10) || 1 : (exam.courseId || 1);
    setForm({
      courseId: parsedCourseId,
      title: exam.title,
      description: exam.description || '',
      questionCount: exam.questionCount ?? exam.totalQuestions ?? 4,
      durationMinutes: exam.durationMinutes ?? 30,
      passingGrade: exam.passingGrade ?? exam.passScore ?? 60,
      maxAttempts: exam.maxAttempts ?? 3,
      startDate: exam.startDate || '',
      endDate: exam.endDate || '',
      isActive: exam.isActive ?? true,
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) return;

    saveExam({
      ...(editingId ? { id: editingId } : {}),
      courseId: form.courseId,
      title: form.title,
      description: form.description,
      questionCount: form.questionCount,
      durationMinutes: form.durationMinutes,
      passingGrade: form.passingGrade,
      maxAttempts: form.maxAttempts,
      startDate: form.startDate,
      endDate: form.endDate,
      isActive: form.isActive,
    });

    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Vize ve Final Sınavı Yönetimi</h2>
          <p className="text-sm text-slate-500">
            Derslere ait resmi vize sınavları, soru havuzu parametreleri ve geçme kriterleri
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Yeni Sınav Tanımla
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exams.map((exam) => {
          const course = courses.find((c) => c.id === exam.courseId);
          return (
            <div
              key={exam.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between hover:border-slate-300 transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-1 bg-teal-50 text-teal-700 font-semibold text-xs rounded-md">
                    {course?.title || `Ders #${exam.courseId}`}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                      exam.isActive
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {exam.isActive ? 'Aktif' : 'Pasif'}
                  </span>
                </div>

                <h3 className="font-bold text-slate-800 text-lg mb-2">{exam.title}</h3>
                <p className="text-slate-500 text-xs line-clamp-2 mb-4">{exam.description}</p>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Clock className="w-3.5 h-3.5 text-teal-500" />
                    <span>{exam.durationMinutes} Dakika</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    <span>Geçme: {exam.passingGrade} Puan</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <span className="font-bold text-slate-400">?</span>
                    <span>{exam.questionCount} Soru Havuzdan</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <span className="font-bold text-slate-400">↺</span>
                    <span>{exam.maxAttempts} Tekrar Hakkı</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>
                    {exam.startDate} - {exam.endDate}
                  </span>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono">ID: #{exam.id}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(exam)}
                    className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`"${exam.title}" sınavını silmek istediğinize emin misiniz?`)) {
                        deleteExam(exam.id);
                      }
                    }}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 my-8">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              {editingId ? 'Sınavı Düzenle' : 'Yeni Sınav Oluştur'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Ders</label>
                <select
                  value={form.courseId}
                  onChange={(e) => setForm({ ...form, courseId: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Sınav Adı</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Örn: 2026 Bahar Vize Sınavı"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Açıklama</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Sınav talimatları..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Soru Sayısı (Havuzdan)</label>
                  <input
                    type="number"
                    min="1"
                    value={form.questionCount}
                    onChange={(e) => setForm({ ...form, questionCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Süre (Dakika)</label>
                  <input
                    type="number"
                    min="5"
                    value={form.durationMinutes}
                    onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Geçme Notu</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={form.passingGrade}
                    onChange={(e) => setForm({ ...form, passingGrade: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Tekrar Hakkı</label>
                  <input
                    type="number"
                    min="1"
                    value={form.maxAttempts}
                    onChange={(e) => setForm({ ...form, maxAttempts: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Başlangıç Tarihi</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Bitiş Tarihi</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm cursor-pointer"
                >
                  {editingId ? 'Güncelle' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
