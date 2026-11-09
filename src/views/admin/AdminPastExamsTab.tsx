import React, { useState } from 'react';
import { useElearn } from '../../context/ElearnContext';
import {
  FileArchive,
  Upload,
  Plus,
  Trash2,
  Download,
  Search,
  ExternalLink,
  BookOpen,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { PastExam } from '../../types';

export const AdminPastExamsTab: React.FC = () => {
  const { courses, pastExams, uploadPastExam, deletePastExam } = useElearn();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState<number>(0);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const [form, setForm] = useState<{
    courseId: number;
    title: string;
    year: string;
    term: string;
    fileUrl: string;
    fileName: string;
    fileSize: string;
  }>({
    courseId: courses[0]?.id || 1,
    title: '',
    year: '2024 Vize',
    term: 'Güz',
    fileUrl: '',
    fileName: '',
    fileSize: '1.5 MB',
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
      const reader = new FileReader();
      reader.onload = (event) => {
        setForm((prev) => ({
          ...prev,
          fileUrl: event.target?.result as string,
          fileName: file.name,
          fileSize: sizeMB,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) return;

    const matchedCourse = courses.find((c) => c.id === form.courseId);

    uploadPastExam({
      courseId: form.courseId,
      courseTitle: matchedCourse?.title || 'Genel Ders',
      title: form.title,
      year: form.year,
      term: form.term,
      fileUrl: form.fileUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileName: form.fileName || `${form.title.replace(/\s+/g, '_')}.pdf`,
      fileSize: form.fileSize,
    });

    setShowUploadModal(false);
    setForm({
      courseId: courses[0]?.id || 1,
      title: '',
      year: '2024 Vize',
      term: 'Güz',
      fileUrl: '',
      fileName: '',
      fileSize: '1.5 MB',
    });
  };

  const filteredExams = pastExams.filter((pe) => {
    const matchesSearch =
      pe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pe.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pe.year.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = selectedCourseId === 0 || pe.courseId === selectedCourseId;
    return matchesSearch && matchesCourse;
  });

  return (
    <div className="space-y-6">
      {/* Üst Başlık & Eylemler */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <FileArchive className="w-5 h-5 text-amber-600" />
              Çıkmış Sorular & Vize/Final Soru Bankası Yönetimi
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
              {pastExams.length} Belge
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Öğrencilerin sınavlara hazırlığı için geçmiş yıllara ait vize, final ve bütünleme sorularını PDF olarak sisteme yükleyin
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer"
        >
          <Upload className="w-4 h-4" /> Yeni Çıkmış Soru Belgesi Yükle
        </button>
      </div>

      {/* Arama ve Ders Filtresi */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-grow w-full md:w-auto">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Ders adı, sınav yılı veya başlık ile ara..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Ders:</span>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(Number(e.target.value))}
            className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-amber-500"
          >
            <option value={0}>Tüm Dersler</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Liste Tablosu */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Ders & Başlık</th>
                <th className="px-5 py-3.5">Dönem / Yıl</th>
                <th className="px-5 py-3.5">Dosya Adı & Boyut</th>
                <th className="px-5 py-3.5">İndirilme</th>
                <th className="px-5 py-3.5">Yüklenme Tarihi</th>
                <th className="px-5 py-3.5 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredExams.map((pe) => (
                <tr key={pe.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-bold text-slate-900 text-sm">{pe.title}</div>
                    <div className="text-xs text-amber-700 flex items-center gap-1 mt-0.5">
                      <BookOpen className="w-3 h-3" /> {pe.courseTitle}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-800 rounded font-semibold text-[11px] border border-amber-200">
                      {pe.year} ({pe.term})
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-slate-700">
                    <div>{pe.fileName}</div>
                    <div className="text-[10px] text-slate-400">{pe.fileSize || '1.5 MB'}</div>
                  </td>
                  <td className="px-5 py-3.5 font-bold text-emerald-700">
                    {pe.downloadCount} indirme
                  </td>
                  <td className="px-5 py-3.5 text-slate-400 font-mono">
                    {pe.uploadedAt}
                  </td>
                  <td className="px-5 py-3.5 text-right space-x-2">
                    <a
                      href={pe.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded-lg transition-colors inline-block"
                      title="Görüntüle"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => {
                        if (confirm(`"${pe.title}" belgesini silmek istediğinize emin misiniz?`)) {
                          deletePastExam(pe.id);
                        }
                      }}
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredExams.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    Henüz kayıtlı çıkmış soru belgesi bulunmuyor.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Yükleme Modali */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Upload className="w-5 h-5 text-amber-600" /> Çıkmış Soru PDF Belgesi Yükle
            </h3>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Ders Seçimi *</label>
                <select
                  value={form.courseId}
                  onChange={(e) => setForm({ ...form, courseId: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-amber-500"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Sınav Başlığı *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Örn: 2024-2025 Güz Dönemi Vize Sınavı Soruları ve Çözümleri"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Sınav Türü & Yıl</label>
                  <select
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="2025 Vize">2025 Vize</option>
                    <option value="2025 Final">2025 Final</option>
                    <option value="2024 Vize">2024 Vize</option>
                    <option value="2024 Final">2024 Final</option>
                    <option value="2024 Bütünleme">2024 Bütünleme</option>
                    <option value="2023 Vize">2023 Vize</option>
                    <option value="2023 Final">2023 Final</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Dönem</label>
                  <select
                    value={form.term}
                    onChange={(e) => setForm({ ...form, term: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Güz">Güz Dönemi</option>
                    <option value="Bahar">Bahar Dönemi</option>
                    <option value="Yaz Okulu">Yaz Okulu</option>
                  </select>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  PDF Dosyasını Seçiniz (Bilgisayardan Yükle)
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                />
                {form.fileName && (
                  <p className="text-xs text-amber-700 font-semibold flex items-center gap-1 mt-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Seçilen dosya: {form.fileName} ({form.fileSize})
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  Belgeyi Sisteme Yükle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
