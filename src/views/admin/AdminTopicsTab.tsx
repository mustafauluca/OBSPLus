import React, { useState } from 'react';
import { useElearn, extractYouTubeId } from '../../context/ElearnContext';
import { Plus, Edit2, Trash2, Video, FileText, Upload, CheckCircle2, Film } from 'lucide-react';
import { Topic } from '../../types';

export const AdminTopicsTab: React.FC = () => {
  const { courses, topics, saveTopic, deleteTopic } = useElearn();
  const [selectedCourseId, setSelectedCourseId] = useState<number>(courses[0]?.id || 1);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form state
  const [form, setForm] = useState<{
    courseId: number;
    title: string;
    shortSummary: string;
    contentHtml: string;
    videoType: 'youtube' | 'upload';
    videoId: string;
    videoFileUrl: string;
    videoFileName: string;
    pdfFileUrl: string;
    pdfFileName: string;
    sortOrder: number;
    isActive: boolean;
  }>({
    courseId: selectedCourseId,
    title: '',
    shortSummary: '',
    contentHtml: '',
    videoType: 'youtube',
    videoId: '',
    videoFileUrl: '',
    videoFileName: '',
    pdfFileUrl: '',
    pdfFileName: '',
    sortOrder: 1,
    isActive: true,
  });

  const filteredTopics = topics.filter((t) => t.courseId === selectedCourseId);

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({
      courseId: selectedCourseId,
      title: '',
      shortSummary: '',
      contentHtml: '<p>Konu anlatımı ve akademik ilkeler buraya girilmelidir.</p>',
      videoType: 'youtube',
      videoId: '',
      videoFileUrl: '',
      videoFileName: '',
      pdfFileUrl: '',
      pdfFileName: '',
      sortOrder: filteredTopics.length + 1,
      isActive: true,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (topic: Topic) => {
    setEditingId(topic.id);
    setForm({
      courseId: topic.courseId,
      title: topic.title,
      shortSummary: topic.shortSummary,
      contentHtml: topic.contentHtml,
      videoType: topic.videoFileUrl ? 'upload' : 'youtube',
      videoId: topic.videoId || '',
      videoFileUrl: topic.videoFileUrl || '',
      videoFileName: topic.videoFileName || '',
      pdfFileUrl: topic.pdfFileUrl || '',
      pdfFileName: topic.pdfFileName || '',
      sortOrder: topic.sortOrder,
      isActive: topic.isActive,
    });
    setShowModal(true);
  };

  // Video File Upload handler
  const handleVideoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setForm((prev) => ({
          ...prev,
          videoFileUrl: event.target?.result as string,
          videoFileName: file.name,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // PDF File Upload handler
  const handlePdfFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setForm((prev) => ({
          ...prev,
          pdfFileUrl: event.target?.result as string,
          pdfFileName: file.name,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) return;

    const cleanVideoId = form.videoId ? extractYouTubeId(form.videoId) : undefined;

    saveTopic({
      ...(editingId ? { id: editingId } : {}),
      courseId: form.courseId,
      title: form.title,
      shortSummary: form.shortSummary,
      contentHtml: form.contentHtml,
      videoId: form.videoType === 'youtube' ? cleanVideoId : undefined,
      videoFileUrl: form.videoType === 'upload' ? form.videoFileUrl : undefined,
      videoFileName: form.videoType === 'upload' ? form.videoFileName : undefined,
      pdfFileUrl: form.pdfFileUrl || undefined,
      pdfFileName: form.pdfFileName || undefined,
      sortOrder: form.sortOrder,
      isActive: form.isActive,
      slug: form.title
        .toLowerCase()
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/[^a-z0-9]+/g, '-'),
    });

    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Konu ve Müfredat Yönetimi</h2>
          <p className="text-sm text-slate-500">
            Derslere ait alt konuları, YouTube video ID'lerini, yüklenen videoları ve PDF ders materyallerini yönetin
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Yeni Konu Ekle
        </button>
      </div>

      {/* Course Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
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

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 w-16">Sıra</th>
                <th className="px-6 py-4">Konu Başlığı</th>
                <th className="px-6 py-4">Kısa Açıklama</th>
                <th className="px-6 py-4">Video Materyali</th>
                <th className="px-6 py-4">PDF Ders Notu</th>
                <th className="px-6 py-4 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTopics.map((topic) => (
                <tr key={topic.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-400 font-mono">
                    #{topic.sortOrder}
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-800">
                    {topic.title}
                  </td>
                  <td className="px-6 py-4 text-slate-500 max-w-xs truncate">
                    {topic.shortSummary}
                  </td>
                  <td className="px-6 py-4">
                    {topic.videoId ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700 font-mono border border-red-200">
                        <Video className="w-3.5 h-3.5 text-red-600" /> YT ID: {topic.videoId}
                      </span>
                    ) : topic.videoFileUrl ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                        <Film className="w-3.5 h-3.5 text-blue-600" /> {topic.videoFileName || 'Video Yüklendi'}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {topic.pdfFileUrl ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                        <FileText className="w-3.5 h-3.5 text-amber-600" /> {topic.pdfFileName || 'PDF Notu Var'}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEdit(topic)}
                      className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Düzenle"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`"${topic.title}" konusunu silmek istediğinize emin misiniz?`)) {
                          deleteTopic(topic.id);
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
              {filteredTopics.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400 text-sm">
                    Bu derse ait henüz bir konu bulunmuyor.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">
              {editingId ? 'Konuyu Düzenle' : 'Yeni Konu Ekle'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Bağlı Olduğu Ders</label>
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
                  <label className="block text-xs font-bold text-slate-600 mb-1">Sıra Numarası</label>
                  <input
                    type="number"
                    min="1"
                    value={form.sortOrder}
                    onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Konu Başlığı</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Kısa Açıklama</label>
                <input
                  type="text"
                  required
                  value={form.shortSummary}
                  onChange={(e) => setForm({ ...form, shortSummary: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  İçerik (HTML veya Zengin Metin)
                </label>
                <textarea
                  rows={5}
                  required
                  value={form.contentHtml}
                  onChange={(e) => setForm({ ...form, contentHtml: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono text-xs focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Video Kaynağı: YouTube Video ID veya Video Dosyası Upload */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-rose-600" /> Video Anlatım Seçeneği
                  </span>
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, videoType: 'youtube' })}
                      className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                        form.videoType === 'youtube'
                          ? 'bg-rose-600 text-white'
                          : 'bg-white text-slate-600 border border-slate-200'
                      }`}
                    >
                      YouTube Video ID
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, videoType: 'upload' })}
                      className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                        form.videoType === 'upload'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-slate-600 border border-slate-200'
                      }`}
                    >
                      Video Dosyası Yükle (MP4/WebM)
                    </button>
                  </div>
                </div>

                {form.videoType === 'youtube' ? (
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      YouTube Video ID (Sadece Video ID, örn: <code className="text-rose-600 font-bold">dQw4w9WgXcQ</code>)
                    </label>
                    <input
                      type="text"
                      value={form.videoId}
                      onChange={(e) => setForm({ ...form, videoId: extractYouTubeId(e.target.value) })}
                      placeholder="Örn: dQw4w9WgXcQ (Tam URL yapıştırsanız da otomatik ID ayıklanır)"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono focus:ring-2 focus:ring-teal-500"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      * Kullanıcı talebine göre yalnızca video ID kaydedilir ve sistem tarafından güvenle embed edilir.
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      MP4 / WebM Video Dosyası Seçiniz
                    </label>
                    <input
                      type="file"
                      accept="video/mp4,video/webm"
                      onChange={handleVideoFileUpload}
                      className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {form.videoFileName && (
                      <p className="text-xs text-blue-600 font-medium mt-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Seçilen dosya: {form.videoFileName}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* PDF Ders Notu Upload */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-amber-600" /> PDF Ders Notu / Doküman Yükle
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      PDF Dosyası Seç (Bilgisayardan Yükle)
                    </label>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handlePdfFileUpload}
                      className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Veya Harici PDF URL'si
                    </label>
                    <input
                      type="text"
                      value={form.pdfFileUrl.startsWith('data:') ? '' : form.pdfFileUrl}
                      onChange={(e) => setForm({ ...form, pdfFileUrl: e.target.value })}
                      placeholder="https://.../ders_notu.pdf"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
                {form.pdfFileName && (
                  <p className="text-xs text-amber-700 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> PDF Belgesi: {form.pdfFileName}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer shadow-sm"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
