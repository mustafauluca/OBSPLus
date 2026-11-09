import React, { useState, useEffect } from 'react';
import { useElearn } from '../context/ElearnContext';
import {
  FileText,
  Download,
  Search,
  Filter,
  Calendar,
  BookOpen,
  Award,
  Eye,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface PastExamsViewProps {
  setCurrentView: (view: string, params?: Record<string, any>) => void;
}

export const PastExamsView: React.FC<PastExamsViewProps> = ({ setCurrentView }) => {
  const { pastExams, courses, downloadPastExam, trackPageVisit, trackClick } = useElearn();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState<number | 'all'>('all');
  const [selectedExamType, setSelectedExamType] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [previewExam, setPreviewExam] = useState<any | null>(null);

  useEffect(() => {
    trackPageVisit('Çıkmış Sorular & Arşiv', '/past-exams');
  }, [trackPageVisit]);

  const filteredExams = pastExams.filter((item) => {
    const cName = item.courseName || item.courseTitle || '';
    const cCode = item.courseCode || '';
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cCode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCourse = selectedCourseId === 'all' || item.courseId === selectedCourseId;
    const matchesType = selectedExamType === 'all' || (item.examType || item.year || item.title).includes(selectedExamType);
    const matchesYear = selectedYear === 'all' || item.year.includes(selectedYear);

    return matchesSearch && matchesCourse && matchesType && matchesYear;
  });

  const years = Array.from(new Set(pastExams.map((e) => e.year))).sort().reverse();

  const handleDownload = (exam: any) => {
    trackClick('A', `Çıkmış Soru İndir: ${exam.title}`, `download-past-exam-${exam.id}`);
    downloadPastExam(exam.id);

    // Trigger download
    if (exam.fileUrl) {
      const link = document.createElement('a');
      link.href = exam.fileUrl;
      link.download = `${exam.courseCode}_${exam.examType}_${exam.year}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert(`"${exam.title}" sınav soru kitapçığı indiriliyor...`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Başlık ve Bilgilendirme */}
        <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-teal-500/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/20 border border-teal-500/40 text-teal-300 text-xs font-bold">
              <Sparkles className="w-4 h-4 text-teal-400" />
              Üniversite & OBS Çıkmış Sorular Arşivi
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              Derslere Ait <span className="text-teal-400">Çıkmış Sınav Soruları</span> ve Çözümleri
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Vize, Final ve Bütünleme dönemlerinde çıkmış geçmiş sınav soruları, denemeler ve resmi soru kitapçıklarını
              inceleyin, PDF olarak anında cihazınıza indirin ve sınava tam hazırlanın.
            </p>
          </div>
        </div>

        {/* Filtreleme ve Arama Çubuğu */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Arama Kutusu */}
            <div className="md:col-span-1 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Ders adı, kodu veya konu ara..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm text-slate-900"
              />
            </div>

            {/* Ders Filtresi */}
            <div>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm text-slate-800 bg-white"
              >
                <option value="all">Tüm Dersler</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code || `DERS-${c.id}`} - {c.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Sınav Türü Filtresi */}
            <div>
              <select
                value={selectedExamType}
                onChange={(e) => setSelectedExamType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm text-slate-800 bg-white"
              >
                <option value="all">Tüm Sınav Türleri (Vize / Final / Büt)</option>
                <option value="Vize">Vize Sınavı</option>
                <option value="Final">Final Sınavı</option>
                <option value="Bütünleme">Bütünleme Sınavı</option>
              </select>
            </div>

            {/* Yıl Filtresi */}
            <div>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm text-slate-800 bg-white"
              >
                <option value="all">Tüm Yıllar</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y} Akademik Yılı
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>Toplam <strong className="text-slate-800 font-bold">{filteredExams.length}</strong> adet çıkmış sınav soru arşivi listeleniyor.</span>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCourseId('all');
                setSelectedExamType('all');
                setSelectedYear('all');
              }}
              className="text-teal-600 hover:text-teal-700 font-semibold cursor-pointer"
            >
              Filtreleri Temizle
            </button>
          </div>
        </div>

        {/* Çıkmış Soru Kartları Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExams.map((exam) => (
            <div
              key={exam.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-teal-50 text-teal-700 font-mono font-bold text-xs border border-teal-200">
                      {exam.courseCode || `DERS-${exam.courseId}`}
                    </span>
                    <span className={`px-2.5 py-1 rounded-md font-bold text-xs ${
                      (exam.examType || exam.year).includes('Vize')
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : (exam.examType || exam.year).includes('Final')
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {exam.examType || (exam.year.includes('Vize') ? 'Vize' : exam.year.includes('Final') ? 'Final' : 'Bütünleme')}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                    {exam.year}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-600 transition-colors">
                    {exam.title}
                  </h3>
                  <p className="text-xs font-medium text-slate-500 mt-1">
                    {exam.courseName || exam.courseTitle}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" /> {exam.term}. Dönem
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    <FileText className="w-3.5 h-3.5 text-slate-400" /> {exam.fileSize || '1.8 MB'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Download className="w-3.5 h-3.5 text-teal-500" /> {exam.downloadCount || 0} İndirme
                  </span>
                  <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Çözümlü PDF
                  </span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => setPreviewExam(exam)}
                  className="flex-1 py-2 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-500" /> İncele
                </button>
                <button
                  onClick={() => handleDownload(exam)}
                  className="flex-1 py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> PDF İndir
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredExams.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
            <FileText className="w-12 h-12 text-slate-300 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800">Seçilen kriterlere uygun çıkmış soru bulunamadı</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Arama teriminizi veya filtrelerinizi değiştirerek tekrar deneyebilirsiniz.
              </p>
            </div>
          </div>
        )}

        {/* Modal: Çıkmış Soru Önizleme */}
        {previewExam && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl border border-slate-100">
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2.5 py-1 rounded bg-teal-50 text-teal-700 font-mono font-bold text-xs">
                    {previewExam.courseCode || `DERS-${previewExam.courseId}`} - {previewExam.examType || previewExam.year}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-2">{previewExam.title}</h3>
                  <p className="text-xs text-slate-500">{previewExam.courseName || previewExam.courseTitle}</p>
                </div>
                <button
                  onClick={() => setPreviewExam(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  ✕
                </button>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl space-y-2 text-xs text-slate-600">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Akademik Yıl:</span>
                  <span className="font-semibold text-slate-800">{previewExam.year}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Dönem:</span>
                  <span className="font-semibold text-slate-800">{previewExam.term}. Yarıyıl</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Format:</span>
                  <span className="font-semibold text-slate-800">Resmi Soru & Cevap Anahtarlı PDF</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Toplam İndirilme:</span>
                  <span className="font-bold text-teal-600 font-mono">{previewExam.downloadCount} defa</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPreviewExam(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Kapat
                </button>
                <button
                  onClick={() => {
                    handleDownload(previewExam);
                    setPreviewExam(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Kitapçığı İndir
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
