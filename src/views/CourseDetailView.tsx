import React, { useEffect } from 'react';
import { useElearn } from '../context/ElearnContext';
import {
  BookOpen,
  CheckCircle2,
  Circle,
  FileCheck,
  FileText,
  Clock,
  Award,
  ArrowRight,
  Layers,
  GraduationCap
} from 'lucide-react';

interface CourseDetailViewProps {
  courseId: number;
  setCurrentView: (view: string, params?: Record<string, any>) => void;
}

export const CourseDetailView: React.FC<CourseDetailViewProps> = ({
  courseId,
  setCurrentView,
}) => {
  const { courses, topics, exams, completedTopicIds, trackPageVisit } = useElearn();

  const course = courses.find((c) => c.id === courseId) || courses[0];
  const courseTopics = topics.filter((t) => t.courseId === course.id);
  const courseExam = exams.find((e) => e.courseId === course.id);

  useEffect(() => {
    if (course) {
      trackPageVisit(course.title, `/elearn/course?id=${course.id}`);
    }
  }, [course]);

  if (!course) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
        <h3 className="text-lg font-bold text-slate-800">Ders bulunamadı.</h3>
        <button
          onClick={() => setCurrentView('elearn_catalog')}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg text-xs font-bold"
        >
          Kataloğa Dön
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Üst Ders Başlık Şeridi */}
      <div className="bg-slate-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <button onClick={() => setCurrentView('home')} className="hover:text-white">
              Ana Sayfa
            </button>
            <span>/</span>
            <button onClick={() => setCurrentView('elearn_catalog')} className="hover:text-white">
              Dersler
            </button>
            <span>/</span>
            <span className="text-teal-400 font-semibold">{course.title}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 space-y-3">
              <span className="px-2.5 py-1 rounded bg-teal-500/20 text-teal-300 font-bold text-xs border border-teal-500/30">
                {course.category}
              </span>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">{course.title}</h1>
              <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
                {course.description}
              </p>
            </div>

            {courseExam && (
              <div className="lg:col-span-4 lg:text-right">
                <button
                  onClick={() => setCurrentView('exam', { examId: courseExam.id })}
                  className="px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <FileCheck className="w-4 h-4" /> Vize Sınavına Gir
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Konu Listesi ve Yan Kartlar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sol: Konu Listesi */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <Layers className="w-4 h-4 text-teal-600" />
                  <span>Ders Konu Modülleri ({courseTopics.length})</span>
                </div>
                <span className="text-xs text-slate-500">Konu anlatımı ve test soruları</span>
              </div>

              <div className="divide-y divide-slate-100">
                {courseTopics.map((topic, index) => {
                  const isDone = completedTopicIds.includes(topic.id);

                  return (
                    <div
                      key={topic.id}
                      className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                    >
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                            isDone
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-100 text-slate-600 group-hover:bg-teal-50 group-hover:text-teal-700'
                          }`}
                        >
                          {isDone ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                        </div>

                        <div className="space-y-1">
                          <h4 className="font-bold text-slate-900 text-sm leading-snug">
                            {topic.title}
                          </h4>
                          <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
                            {topic.shortSummary}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                        <button
                          onClick={() => setCurrentView('topic', { topicId: topic.id })}
                          className="flex-1 sm:flex-none px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                        >
                          Anlatımı Oku
                        </button>
                        <button
                          onClick={() => setCurrentView('quiz', { topicId: topic.id })}
                          className="flex-1 sm:flex-none px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          Testi Çöz
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sağ: Vize Sınavı & Ders Bilgisi */}
          <div className="lg:col-span-4 space-y-6">
            {courseExam && (
              <div className="bg-gradient-to-br from-amber-50 to-amber-100/60 p-6 rounded-2xl border border-amber-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-amber-900 font-extrabold text-xs uppercase tracking-wider">
                  <Award className="w-4 h-4" /> Resmi Vize Sınavı
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-base">{courseExam.title}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{courseExam.description}</p>
                </div>

                <div className="space-y-2 pt-2 text-xs text-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-amber-700" /> Sınav Süresi:
                    </span>
                    <strong className="font-mono">{courseExam.durationMinutes} Dakika</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-600">
                      <FileCheck className="w-3.5 h-3.5 text-amber-700" /> Geçme Notu:
                    </span>
                    <strong className="font-mono text-emerald-700">{courseExam.passingGrade} / 100</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-600">
                      <GraduationCap className="w-3.5 h-3.5 text-amber-700" /> Soru Sayısı:
                    </span>
                    <strong className="font-mono">{courseExam.questionCount} Soru (Havuzdan)</strong>
                  </div>
                </div>

                <button
                  onClick={() => setCurrentView('exam', { examId: courseExam.id })}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  Sınava Başla <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Ders Materyalleri */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-teal-600" /> Ders Materyalleri
              </h5>
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-800">Ders İzlencesi ve Konu Özeti</div>
                    <div className="text-[10px] text-slate-500">PDF Dokümanı • 1.4 MB</div>
                  </div>
                  <span className="px-2 py-1 bg-white border border-slate-200 text-slate-700 font-bold text-[10px] rounded-lg">
                    İndir
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-800">Soru Çözüm Rehberi</div>
                    <div className="text-[10px] text-slate-500">PDF Dokümanı • 2.1 MB</div>
                  </div>
                  <span className="px-2 py-1 bg-white border border-slate-200 text-slate-700 font-bold text-[10px] rounded-lg">
                    İndir
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
