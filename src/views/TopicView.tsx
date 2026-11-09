import React, { useEffect } from 'react';
import { useElearn } from '../context/ElearnContext';
import {
  BookOpen,
  CheckCircle2,
  FileCheck,
  FileText,
  Video,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Download
} from 'lucide-react';

interface TopicViewProps {
  topicId: number;
  setCurrentView: (view: string, params?: Record<string, any>) => void;
}

export const TopicView: React.FC<TopicViewProps> = ({ topicId, setCurrentView }) => {
  const { topics, courses, completedTopicIds, toggleTopicCompletion, trackPageVisit } = useElearn();

  const topic = topics.find((t) => t.id === topicId) || topics[0];
  const course = courses.find((c) => c.id === topic?.courseId) || courses[0];
  const isCompleted = completedTopicIds.includes(topic?.id);

  useEffect(() => {
    if (topic) {
      trackPageVisit(topic.title, `/elearn/topic?id=${topic.id}`);
    }
  }, [topic]);

  if (!topic) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
        <h3 className="text-lg font-bold text-slate-800">Konu bulunamadı.</h3>
        <button
          onClick={() => setCurrentView('elearn_catalog')}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg text-xs font-bold"
        >
          Derslere Dön
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Üst Başlık Şeridi */}
      <div className="bg-slate-900 text-white py-10 px-4">
        <div className="max-w-5xl mx-auto space-y-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <button onClick={() => setCurrentView('elearn_catalog')} className="hover:text-white">
              Dersler
            </button>
            <span>/</span>
            <button
              onClick={() => setCurrentView('course_detail', { id: course.id })}
              className="hover:text-white"
            >
              {course.title}
            </button>
            <span>/</span>
            <span className="text-teal-400 font-semibold">{topic.title}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-teal-400 font-bold uppercase tracking-wider">
                Modül Anlatımı
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
                {topic.title}
              </h1>
            </div>

            <button
              onClick={() => setCurrentView('quiz', { topicId: topic.id })}
              className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer shrink-0 flex items-center gap-1.5"
            >
              <FileCheck className="w-4 h-4" /> Konu Testini Çöz
            </button>
          </div>
        </div>
      </div>

      {/* İçerik Alanı */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-10 space-y-8">
          {/* Video Alanı: YouTube Video ID veya Yüklenen MP4/WebM Video */}
          {(topic.videoId || topic.videoFileUrl || topic.videoUrl) && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-rose-600" />
                  <span>
                    {topic.videoFileUrl
                      ? 'Yüklenen Video Anlatımı (MP4/WebM)'
                      : `Akademik Video Anlatımı ${topic.videoId ? `(YouTube ID: ${topic.videoId})` : ''}`}
                  </span>
                </div>
                {topic.videoId && (
                  <span className="px-2 py-0.5 bg-rose-50 text-rose-700 rounded text-[11px] font-mono">
                    ID: {topic.videoId}
                  </span>
                )}
              </div>
              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 shadow-inner">
                {topic.videoFileUrl ? (
                  <video
                    controls
                    controlsList="nodownload"
                    className="w-full h-full object-contain bg-black"
                    src={topic.videoFileUrl}
                  />
                ) : (
                  <iframe
                    className="w-full h-full border-0"
                    src={`https://www.youtube.com/embed/${topic.videoId || 'dQw4w9WgXcQ'}`}
                    title={topic.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                )}
              </div>
            </div>
          )}

          {/* Metin İçeriği */}
          <div className="prose prose-slate max-w-none text-slate-700 text-sm leading-relaxed space-y-4">
            <div dangerouslySetInnerHTML={{ __html: topic.contentHtml }} />
          </div>

          {/* PDF Materyali İndirme & Görüntüleme */}
          {topic.pdfFileUrl && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-rose-100 text-rose-700 rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">
                    {topic.pdfFileName || `${topic.title} – Çalışma Özeti & Ders Notu (PDF)`}
                  </div>
                  <div className="text-[11px] text-slate-500">Müfredat ve Ders Materyali • Resmi Belge</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={topic.pdfFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold text-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Önizle
                </a>
                <a
                  href={topic.pdfFileUrl}
                  download={topic.pdfFileName || `${topic.slug}_notlari.pdf`}
                  className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" /> PDF İndir
                </a>
              </div>
            </div>
          )}

          {/* Tamamlama Butonu & Navigasyon */}
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={() => toggleTopicCompletion(topic.id)}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                isCompleted
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {isCompleted ? 'Bu Konuyu Tamamladınız (İşaretlendi)' : 'Konuyu Tamamlandı Olarak İşaretle'}
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentView('course_detail', { id: course.id })}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl"
              >
                <ArrowLeft className="w-3.5 h-3.5 inline mr-1" /> Ders Listesi
              </button>
              <button
                onClick={() => setCurrentView('quiz', { topicId: topic.id })}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
              >
                Konu Testini Çöz <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
