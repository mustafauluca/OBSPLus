import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, Clock, Award, ChevronRight, ChevronLeft, ShieldCheck } from 'lucide-react';
import { GRADUATION_EXAM, saveExamAttempt } from './examService';
import { ExamAttempt, StudentProfile } from '../../types';
import { logAuditEvent } from '../admin/auditService';

interface ExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile;
  onExamPassed: (attempt: ExamAttempt) => void;
}

export const ExamModal: React.FC<ExamModalProps> = ({
  isOpen,
  onClose,
  profile,
  onExamPassed,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qId: string]: number }>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes

  useEffect(() => {
    if (!isOpen) {
      setCurrentIndex(0);
      setSelectedAnswers({});
      setIsCompleted(false);
      setTimeLeft(900);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const questions = GRADUATION_EXAM.questions || [];
  const currentQuestion = questions[currentIndex] || { id: 'q1', text: '', options: [], correctIndex: 0 };
  const totalQuestions = questions.length;
  const passScore = GRADUATION_EXAM.passScore || 60;

  const handleSelectOption = (optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionIndex,
    }));
  };

  const handleSubmitExam = () => {
    let correctCount = 0;
    questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        correctCount++;
      }
    });

    const calculatedScore = Math.round((correctCount / totalQuestions) * 100);
    const passed = calculatedScore >= passScore;
    setScore(calculatedScore);
    setIsCompleted(true);

    const attempt: ExamAttempt = {
      id: `attempt-${Date.now()}`,
      studentId: profile.id,
      studentName: profile.fullName,
      examId: String(GRADUATION_EXAM.id),
      examTitle: GRADUATION_EXAM.title,
      score: calculatedScore,
      passed,
      attemptDate: new Date().toLocaleDateString('tr-TR'),
      certificateNumber: passed ? `GMB-YOK-${Math.floor(100000 + Math.random() * 900000)}` : undefined,
    };

    saveExamAttempt(attempt);

    logAuditEvent(
      'exam_submit',
      { id: profile.userId, name: profile.fullName, role: 'student' },
      `YÖK Bitirme Yeterlilik Sınavı tamamlandı. Puan: ${calculatedScore} / 100 - Sonuç: ${passed ? 'BAŞARILI (Geçici Belge Hak Edildi)' : 'BAŞARISIZ'}`
    );

    if (passed) {
      onExamPassed(attempt);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-4">
        {/* Top Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Award className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-sm font-bold">{GRADUATION_EXAM.title}</h2>
              <div className="text-[11px] text-slate-400">Baraj Notu: {GRADUATION_EXAM.passScore} Puan</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isCompleted && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-amber-300 font-mono text-xs font-bold border border-slate-700">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
                </span>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {!isCompleted ? (
            <div>
              {/* Question Progress Indicator */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 text-xs text-slate-500">
                <span className="font-semibold text-slate-700">
                  Soru {currentIndex + 1} / {totalQuestions}
                </span>
                <div className="flex items-center gap-1">
                  {questions.map((q: any, idx: number) => (
                    <div
                      key={q.id}
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        selectedAnswers[q.id] !== undefined
                          ? 'bg-amber-500 text-slate-950'
                          : idx === currentIndex
                          ? 'bg-slate-900 text-white ring-2 ring-amber-400'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {idx + 1}
                    </div>
                  ))}
                </div>
              </div>

              {/* Question Prompt */}
              <div className="min-h-[90px] mb-6">
                <h3 className="text-base font-semibold text-slate-900 leading-snug">
                  {currentQuestion.text}
                </h3>
              </div>

              {/* Options */}
              <div className="space-y-3 mb-8">
                {currentQuestion.options.map((option: string, optIdx: number) => {
                  const isSelected = selectedAnswers[currentQuestion.id] === optIdx;
                  const letter = String.fromCharCode(65 + optIdx); // A, B, C, D
                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handleSelectOption(optIdx)}
                      className={`w-full p-4 rounded-xl border text-left text-sm transition-all flex items-start gap-3 cursor-pointer ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50/70 text-slate-900 ring-2 ring-amber-400/50 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {letter}
                      </span>
                      <span className="font-medium leading-relaxed">{option}</span>
                    </button>
                  );
                })}
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((prev) => prev - 1)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Önceki Soru</span>
                </button>

                {currentIndex < totalQuestions - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((prev) => prev + 1)}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Sonraki Soru</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmitExam}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Sınavı Bitir ve Notlandır</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Exam Result View */
            <div className="text-center py-6 space-y-5">
              <div
                className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center ${
                  score >= passScore
                    ? 'bg-emerald-100 text-emerald-600 ring-8 ring-emerald-50'
                    : 'bg-red-100 text-red-600 ring-8 ring-red-50'
                }`}
              >
                {score >= passScore ? (
                  <Award className="w-10 h-10" />
                ) : (
                  <AlertCircle className="w-10 h-10" />
                )}
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {score >= passScore
                    ? 'Tebrikler! Sınavı Başarıyla Geçtiniz'
                    : 'Sınav Barajı Aşılamadı'}
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  {score >= passScore
                    ? 'YÖK Bitirme ve İntibak Yeterlilik şartlarını sağladınız. Geçici Mezuniyet Belgeniz tanzim edildi.'
                    : 'Geçme barajı en az 60 puandır. Tekrar sınava katılabilir veya danışmanınızla görüşebilirsiniz.'}
                </p>
              </div>

              <div className="inline-flex items-center gap-6 px-6 py-3 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <div className="text-[11px] text-slate-500 uppercase tracking-wider">Sınav Puanınız</div>
                  <div className="text-2xl font-black font-mono text-slate-900">{score} / 100</div>
                </div>
                <div className="w-[1px] h-8 bg-slate-200" />
                <div>
                  <div className="text-[11px] text-slate-500 uppercase tracking-wider">Durum</div>
                  <div
                    className={`text-sm font-bold uppercase ${
                      score >= passScore ? 'text-emerald-600' : 'text-red-600'
                    }`}
                  >
                    {score >= passScore ? 'BAŞARILI' : 'BAŞARISIZ'}
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  OBS Paneline Dön
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
