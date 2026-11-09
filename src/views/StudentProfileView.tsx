import React, { useEffect } from 'react';
import { useElearn } from '../context/ElearnContext';
import {
  User,
  Award,
  Trophy,
  CheckCircle2,
  Clock,
  BookOpen,
  Mail,
  Phone,
  FileCheck,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { calculateStudentRank } from '../utils/elearn-logic';

interface StudentProfileViewProps {
  setCurrentView: (view: string, params?: Record<string, any>) => void;
  onOpenLogin: () => void;
}

export const StudentProfileView: React.FC<StudentProfileViewProps> = ({
  setCurrentView,
  onOpenLogin,
}) => {
  const { currentStudent, courses, topics, examAttempts, students, completedTopicIds, trackPageVisit } = useElearn();

  useEffect(() => {
    trackPageVisit('Öğrenci Profilim', '/elearn/profile');
  }, []);

  const student = currentStudent || students[0];

  const studentAttempts = examAttempts.filter((a) => a.studentId === student.id);
  const allScores = students.map((s) => s.totalScore);
  const rank = calculateStudentRank(student.totalScore, allScores);

  return (
    <div className="space-y-10">
      {/* Üst Profil Şeridi */}
      <div className="bg-slate-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-teal-600 text-white font-black text-2xl flex items-center justify-center border-2 border-teal-400 shadow-md">
              {student.firstName.charAt(0)}{student.lastName.charAt(0)}
            </div>
            <div className="space-y-1">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-teal-400 text-xs font-mono font-bold border border-slate-700">
                Öğrenci No: {student.studentNo}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                {student.firstName} {student.lastName}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-teal-400" /> {student.email}</span>
                {student.phone && (
                  <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-teal-400" /> {student.phone}</span>
                )}
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" /> KVKK Onaylı Hesap
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentView('elearn_catalog')}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <BookOpen className="w-4 h-4" /> Eğitim Kataloğuna Git
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
        {/* 4 İstatistik Kartı */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs text-center space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Toplam Puan</span>
            <div className="text-3xl font-black font-mono text-teal-600">{student.totalScore}</div>
            <span className="text-xs text-emerald-600 font-semibold flex items-center justify-center gap-1">
              <Trophy className="w-3.5 h-3.5" /> Başarı Derecesi
            </span>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs text-center space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Genel Sıralama</span>
            <div className="text-3xl font-black font-mono text-amber-500">#{rank}</div>
            <span className="text-xs text-slate-500">{students.length} Kayıtlı Öğrenci Arasında</span>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs text-center space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Girilen Sınavlar</span>
            <div className="text-3xl font-black font-mono text-slate-900">{studentAttempts.length}</div>
            <span className="text-xs text-slate-500">Quiz & Vize Girişimi</span>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs text-center space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Sertifika Durumu</span>
            <div className="text-2xl font-black font-mono text-indigo-600">
              {student.totalScore >= 100 ? 'Hak Edildi' : 'Devam Ediyor'}
            </div>
            <span className="text-xs text-slate-500">
              {student.totalScore >= 100 ? 'Akademik Başarı Belgesi' : 'Min 100 Puan Gerekir'}
            </span>
          </div>
        </div>

        {/* 2 Kolon: Ders İlerlemeleri & Sınav Geçmişi */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sol Kolon: Ders İlerlemeleri */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Award className="w-4 h-4 text-teal-600" />
                  <span>Ders Bazlı Tamamlanma Durumu</span>
                </h4>
                <span className="text-xs text-slate-500">{courses.length} Ders</span>
              </div>

              <div className="space-y-5">
                {courses.map((course) => {
                  const courseTopics = topics.filter((t) => t.courseId === course.id);
                  const completedInCourse = courseTopics.filter((t) =>
                    completedTopicIds.includes(t.id)
                  ).length;
                  const totalInCourse = Math.max(1, courseTopics.length);
                  const percentage = Math.round((completedInCourse / totalInCourse) * 100);

                  return (
                    <div key={course.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800">{course.title}</span>
                        <span className="font-mono font-bold text-teal-600">%{percentage}</span>
                      </div>

                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-teal-500 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                        <span>{completedInCourse} / {totalInCourse} Konu Tamamlandı</span>
                        <button
                          onClick={() => setCurrentView('course_detail', { id: course.id })}
                          className="text-teal-600 hover:underline font-semibold"
                        >
                          Derse Git →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sağ Kolon: Sınav Geçmişi */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Sınav ve Test Geçmişi ({studentAttempts.length})</span>
                </h4>
                <span className="text-xs text-slate-500">Tamamlanan oturumlar</span>
              </div>

              {studentAttempts.length === 0 ? (
                <div className="text-center py-12 text-slate-500 space-y-3">
                  <FileCheck className="w-8 h-8 mx-auto text-slate-400" />
                  <div className="text-xs font-semibold">Henüz katıldığınız bir sınav bulunmamaktadır.</div>
                  <button
                    onClick={() => setCurrentView('elearn_catalog')}
                    className="px-4 py-2 bg-teal-600 text-white font-bold text-xs rounded-lg"
                  >
                    Ders Kataloğuna Git
                  </button>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Sınav / Modül</th>
                        <th className="p-3">Tür</th>
                        <th className="p-3 text-center">Puan</th>
                        <th className="p-3 text-center">Durum</th>
                        <th className="p-3 text-right">Detay</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {studentAttempts.map((att) => (
                        <tr key={att.id} className="hover:bg-slate-50">
                          <td className="p-3">
                            <div className="font-bold text-slate-900">{att.targetTitle}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{att.completedAt}</div>
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                att.examType === 'exam'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {att.examType === 'exam' ? 'Vize' : 'Quiz'}
                            </span>
                          </td>
                          <td className="p-3 text-center font-mono font-bold text-sm">
                            {att.score.toFixed(1)}
                          </td>
                          <td className="p-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                att.passed
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {att.passed ? 'Geçti' : 'Kaldı'}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => setCurrentView('result', { attemptId: att.id })}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold text-[11px]"
                            >
                              İncele
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
