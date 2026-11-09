import React from 'react';
import { useElearn } from '../context/ElearnContext';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award,
  ArrowRight,
  RotateCcw,
  BookOpen,
  User,
  Lightbulb
} from 'lucide-react';

interface ResultViewProps {
  attemptId: number;
  setCurrentView: (view: string, params?: Record<string, any>) => void;
}

export const ResultView: React.FC<ResultViewProps> = ({ attemptId, setCurrentView }) => {
  const { examAttempts, currentStudent } = useElearn();

  const attempt = examAttempts.find((a) => a.id === attemptId) || examAttempts[0];

  if (!attempt) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
        <h3 className="text-lg font-bold text-slate-800">Sınav sonucu bulunamadı.</h3>
        <button
          onClick={() => setCurrentView('elearn_catalog')}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg text-xs font-bold"
        >
          Derslere Dön
        </button>
      </div>
    );
  }

  const passed = attempt.passed;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Sonuç Başlık Kartı */}
      <div
        className={`p-8 rounded-3xl border shadow-sm text-center space-y-4 ${
          passed
            ? 'bg-gradient-to-b from-emerald-50 via-white to-white border-emerald-200'
            : 'bg-gradient-to-b from-rose-50 via-white to-white border-rose-200'
        }`}
      >
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
            passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
          }`}
        >
          {passed ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Başarılı (Sınavı Geçtiniz)
            </>
          ) : (
            <>
              <XCircle className="w-4 h-4 text-rose-600" /> Başarısız (Geçme Notunun Altında)
            </>
          )}
        </span>

        <div>
          <div className="text-xs text-slate-500 font-semibold">{attempt.targetTitle}</div>
          <div
            className={`text-5xl sm:text-6xl font-black font-mono tracking-tight mt-1 ${
              passed ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {attempt.score.toFixed(1)}
            <span className="text-lg text-slate-400 font-normal"> / 100</span>
          </div>
        </div>

        {/* 3 İstatistik Kutusu */}
        <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto pt-2">
          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl text-center">
            <div className="text-xl font-bold font-mono text-emerald-700">{attempt.correctCount}</div>
            <div className="text-[11px] font-semibold text-emerald-900 mt-0.5">Doğru Cevap</div>
          </div>
          <div className="p-3 bg-rose-50 border border-rose-100 rounded-2xl text-center">
            <div className="text-xl font-bold font-mono text-rose-700">{attempt.wrongCount}</div>
            <div className="text-[11px] font-semibold text-rose-900 mt-0.5">Yanlış Cevap</div>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-center">
            <div className="text-xl font-bold font-mono text-slate-700">{attempt.emptyCount}</div>
            <div className="text-[11px] font-semibold text-slate-600 mt-0.5">Boş Bırakılan</div>
          </div>
        </div>
      </div>

      {/* Soru Bazlı Cevap Analizi */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <Award className="w-4 h-4 text-teal-600" />
            <span>Madde ve Soru Cevap Analizi</span>
          </div>
          <span className="text-xs text-slate-500">{(attempt.answers || []).length} Soru Değerlendirildi</span>
        </div>

        <div className="space-y-4">
          {(attempt.answers || []).map((ans, idx) => {
            const isCorrect = ans.isCorrect;

            return (
              <div
                key={idx}
                className={`p-5 rounded-2xl border space-y-3 ${
                  isCorrect
                    ? 'border-emerald-200 bg-emerald-50/40'
                    : 'border-rose-200 bg-rose-50/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Soru {idx + 1}:</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isCorrect
                        ? 'bg-emerald-100 text-emerald-800'
                        : ans.chosenKey
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {isCorrect ? '✓ Doğru' : ans.chosenKey ? '✕ Yanlış' : '- Boş'}
                  </span>
                </div>

                <h4 className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed">
                  {ans.questionText}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <span className="text-slate-500 text-[11px] block">Sizin Cevabınız:</span>
                    <strong className={isCorrect ? 'text-emerald-700 font-mono' : 'text-rose-700 font-mono'}>
                      {ans.chosenKey ? `${ans.chosenKey}) ${ans.chosenText || ''}` : 'Cevap verilmedi'}
                    </strong>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-emerald-200">
                    <span className="text-emerald-600 text-[11px] block font-semibold">Doğru Seçenek:</span>
                    <strong className="text-emerald-800 font-mono">
                      {ans.correctKey}) {ans.correctText}
                    </strong>
                  </div>
                </div>

                {ans.explanation && (
                  <div className="p-3 rounded-xl bg-white/80 border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>
                      <strong>Açıklama:</strong> {ans.explanation}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Aksiyon Butonları */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <button
          onClick={() => setCurrentView('elearn_catalog')}
          className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer"
        >
          <BookOpen className="w-4 h-4" /> Eğitim Kataloğuna Dön
        </button>

        <button
          onClick={() => setCurrentView('student_profile')}
          className="w-full sm:w-auto px-6 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer"
        >
          <User className="w-4 h-4" /> Öğrenci Profilimi Görüntüle <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
