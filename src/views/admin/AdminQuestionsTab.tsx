import React, { useState } from 'react';
import { useElearn } from '../../context/ElearnContext';
import { Plus, Edit2, Trash2, CheckCircle2 } from 'lucide-react';
import { Question, QuestionOption } from '../../types';

export const AdminQuestionsTab: React.FC = () => {
  const { questions, courses, saveQuestion, deleteQuestion } = useElearn();
  const [selectedCourseId, setSelectedCourseId] = useState<number>(0);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState({
    courseId: courses[0]?.id || 1,
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctKey: 'A',
    explanation: '',
    points: 20,
  });

  const filteredQuestions = questions.filter((q) => {
    if (selectedCourseId === 0) return true;
    return q.courseId === selectedCourseId;
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({
      courseId: selectedCourseId || courses[0]?.id || 1,
      questionText: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctKey: 'A',
      explanation: '',
      points: 20,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (q: Question) => {
    setEditingId(q.id);
    const optA = q.options.find((o: QuestionOption) => o.optionKey === 'A')?.optionText || '';
    const optB = q.options.find((o: QuestionOption) => o.optionKey === 'B')?.optionText || '';
    const optC = q.options.find((o: QuestionOption) => o.optionKey === 'C')?.optionText || '';
    const optD = q.options.find((o: QuestionOption) => o.optionKey === 'D')?.optionText || '';
    const correct = q.options.find((o: QuestionOption) => o.isCorrect)?.optionKey || 'A';

    setForm({
      courseId: q.courseId,
      questionText: q.questionText,
      optionA: optA,
      optionB: optB,
      optionC: optC,
      optionD: optD,
      correctKey: correct,
      explanation: q.explanation || '',
      points: q.points,
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.questionText || !form.optionA || !form.optionB) return;

    const options = [
      { id: 1, questionId: editingId || 0, optionKey: 'A', optionText: form.optionA, isCorrect: form.correctKey === 'A' },
      { id: 2, questionId: editingId || 0, optionKey: 'B', optionText: form.optionB, isCorrect: form.correctKey === 'B' },
      { id: 3, questionId: editingId || 0, optionKey: 'C', optionText: form.optionC, isCorrect: form.correctKey === 'C' },
      { id: 4, questionId: editingId || 0, optionKey: 'D', optionText: form.optionD, isCorrect: form.correctKey === 'D' },
    ];

    saveQuestion({
      ...(editingId ? { id: editingId } : {}),
      courseId: form.courseId,
      questionText: form.questionText,
      points: form.points,
      explanation: form.explanation,
      options,
    });

    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Soru Havuzu Yönetimi</h2>
          <p className="text-sm text-slate-500">
            Konu testleri ve vize sınavlarında kullanılan çoktan seçmeli soruları yönetin
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Yeni Soru Ekle
        </button>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCourseId(0)}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            selectedCourseId === 0
              ? 'bg-teal-600 text-white shadow-md shadow-teal-100'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Tüm Dersler ({questions.length})
        </button>
        {courses.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCourseId(c.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCourseId === c.id
                ? 'bg-teal-600 text-white shadow-md shadow-teal-100'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {c.title}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredQuestions.map((q) => {
          const course = courses.find((c) => c.id === q.courseId);
          return (
            <div
              key={q.id}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all space-y-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-teal-50 text-teal-700 text-xs font-semibold">
                      {course?.title || `Ders #${q.courseId}`}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">Puan: {q.points}</span>
                    <span className="text-xs text-slate-400 font-mono">ID: #{q.id}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-800">{q.questionText}</h3>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(q)}
                    className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Bu soruyu silmek istediğinize emin misiniz?')) {
                        deleteQuestion(q.id);
                      }
                    }}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {q.options.map((opt) => (
                  <div
                    key={opt.optionKey}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border ${
                      opt.isCorrect
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-900 font-semibold'
                        : 'border-slate-100 bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center font-bold uppercase text-[10px] ${
                        opt.isCorrect
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white text-slate-500 border border-slate-200'
                      }`}
                    >
                      {opt.optionKey}
                    </span>
                    <span className="flex-1">{opt.optionText}</span>
                    {opt.isCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  </div>
                ))}
              </div>

              {q.explanation && (
                <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl text-xs text-amber-900">
                  <strong className="font-semibold">Çözüm Açıklaması:</strong> {q.explanation}
                </div>
              )}
            </div>
          );
        })}

        {filteredQuestions.length === 0 && (
          <div className="bg-white p-12 text-center text-slate-400 rounded-2xl border border-slate-200">
            Soru bulunamadı.
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 my-8">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              {editingId ? 'Soruyu Düzenle' : 'Yeni Soru Tanımla'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
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
                  <label className="block text-xs font-bold text-slate-600 mb-1">Soru Puanı</label>
                  <input
                    type="number"
                    min="1"
                    value={form.points}
                    onChange={(e) => setForm({ ...form, points: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Soru Metni</label>
                <textarea
                  rows={3}
                  required
                  value={form.questionText}
                  onChange={(e) => setForm({ ...form, questionText: e.target.value })}
                  placeholder="Soru metnini yazınız..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-600">Seçenekler</label>
                {(['A', 'B', 'C', 'D'] as const).map((opt) => (
                  <div key={opt} className="flex items-center gap-2">
                    <span className="w-6 text-center font-bold text-xs uppercase text-slate-400">
                      {opt}:
                    </span>
                    <input
                      type="text"
                      required
                      value={(form as any)[`option${opt}`]}
                      onChange={(e) => setForm({ ...form, [`option${opt}`]: e.target.value })}
                      placeholder={`Seçenek ${opt}`}
                      className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Doğru Cevap</label>
                <select
                  value={form.correctKey}
                  onChange={(e) => setForm({ ...form, correctKey: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 font-bold uppercase"
                >
                  <option value="A">A Seçeneği</option>
                  <option value="B">B Seçeneği</option>
                  <option value="C">C Seçeneği</option>
                  <option value="D">D Seçeneği</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Çözüm Açıklaması (Sınav bittiğinde gösterilir)
                </label>
                <textarea
                  rows={2}
                  value={form.explanation}
                  onChange={(e) => setForm({ ...form, explanation: e.target.value })}
                  placeholder="Doğru cevabın gerekçesi..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
                />
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
