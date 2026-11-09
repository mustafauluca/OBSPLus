import React, { useState, useEffect } from 'react';
import { useElearn } from '../context/ElearnContext';
import { Clock, Award, CheckCircle, AlertTriangle, Send } from 'lucide-react';
import { evaluateExamAnswers } from '../utils/elearn-logic';

interface ExamViewProps {
  examId: number;
  setCurrentView: (view: string, params?: Record<string, any>) => void;
}

export const ExamView: React.FC<ExamViewProps> = ({ examId, setCurrentView }) => {
  const { exams, courses, questions, submitExamAttempt, currentStudent, trackPageVisit } = useElearn();

  const exam = exams.find((e) => e.id === examId) || exams[0];
  const course = courses.find((c) => c.id === exam?.courseId) || courses[0];

  // Sınav sorularını havuzdan çek (Ders soruları)
  const examPool = questions.filter((q) => q.courseId === exam?.courseId);
  const examQuestions = examPool.length > 0 ? examPool : questions.slice(0, exam?.questionCount || 4);

  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>((exam?.durationMinutes || 30) * 60);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  useEffect(() => {
    trackPageVisit(`${exam?.title || 'Vize Sınavı'}`, `/elearn/exam?id=${examId}`);
  }, [examId]);

  useEffect(() => {
    if (timeLeft <= 0 && !isSubmitted) {
      handleExamSubmit();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isSubmitted]);

  const handleSelectOption = (questionId: number, optionKey: string) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionKey }));
  };

  const handleExamSubmit = () => {
    if (isSubmitted) return;
    setIsSubmitted(true);

    const questionAnswers = examQuestions.map((q) => {
      const correctOpt = q.options.find((o) => o.isCorrect)?.optionKey || 'A';
      return {
        questionId: q.id,
        points: q.points,
        correctOptionKey: correctOpt,
        selectedOptionKey: selectedAnswers[q.id],
      };
    });

    const summary = evaluateExamAnswers(questionAnswers, exam?.passingGrade || 50);

    const detailedAnswers = examQuestions.map((q) => {
      const chosenKey = selectedAnswers[q.id];
      const chosenOpt = q.options.find((o) => o.optionKey === chosenKey);
      const correctOpt = q.options.find((o) => o.isCorrect);

      return {
        questionId: q.id,
        questionText: q.questionText,
        chosenKey,
        chosenText: chosenOpt?.optionText,
        correctKey: correctOpt?.optionKey || 'A',
        correctText: correctOpt?.optionText || '',
        isCorrect: chosenKey === (correctOpt?.optionKey || 'A'),
        explanation: q.explanation,
      };
    });

    const attemptId = submitExamAttempt({
      studentId: currentStudent?.id || 1,
      studentNo: currentStudent?.studentNo || '202610101',
      studentName: currentStudent ? `${currentStudent.firstName} ${currentStudent.lastName}` : 'Ahmet Yılmaz',
      examType: 'exam',
      targetId: exam.id,
      targetTitle: exam.title,
      score: summary.scorePercentage,
      correctCount: summary.correctCount,
      wrongCount: summary.wrongCount,
      emptyCount: summary.emptyCount,
      passed: summary.passed,
      answers: detailedAnswers,
    });

    setCurrentView('result', { attemptId });
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="space-y-8 pb-16">
      {/* Sınav Başlığı ve Kalan Süre */}
      <div className="bg-slate-900 text-white py-8 px-4 sticky top-16 z-30 shadow-md">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 text-[10px] font-black uppercase">
                Resmi Vize Sınavı
              </span>
              <span className="text-xs text-slate-400">{course.title}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white mt-1">{exam.title}</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono font-bold flex items-center gap-2 shadow-inner">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>
                Kalan Süre: <strong className="text-white text-sm">{minutes < 10 ? '0' : ''}{minutes}:{seconds < 10 ? '0' : ''}{seconds}</strong>
              </span>
            </div>

            <button
              onClick={handleExamSubmit}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" /> Sınavı Bitir
            </button>
          </div>
        </div>
      </div>

      {/* Soru Formu */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Bilgilendirme Kartı */}
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-700" />
            <span>Geçme Notu: <strong>{exam.passingGrade} / 100</strong> • Toplam Soru: <strong>{examQuestions.length}</strong></span>
          </div>
          <span className="font-semibold">Cevaplanan: {Object.keys(selectedAnswers).length} / {examQuestions.length}</span>
        </div>

        {examQuestions.map((q, index) => {
          const selectedKey = selectedAnswers[q.id];

          return (
            <div
              key={q.id}
              className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-xs">
                  Soru {index + 1} / {examQuestions.length}
                </span>
                <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                  {q.points} Puan
                </span>
              </div>

              <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
                {q.questionText}
              </h3>

              <div className="space-y-2.5 pt-2">
                {q.options.map((opt) => {
                  const isSelected = selectedKey === opt.optionKey;

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelectOption(q.id, opt.optionKey)}
                      className={`w-full p-3.5 rounded-xl text-left text-xs font-medium border flex items-center gap-3 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50/70 text-amber-950 shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 font-mono ${
                          isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {opt.optionKey}
                      </span>
                      <span className="leading-relaxed flex-grow">{opt.optionText}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center space-y-3">
          <h4 className="font-bold text-slate-800 text-sm">Vize Sınavını Tamamlamak Üzeresiniz</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Vize sınavı sonucunuz öğrenci dosyanıza ve başarı sıralamasına kaydedilecektir. Onaylıyor musunuz?
          </p>
          <button
            onClick={handleExamSubmit}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-colors cursor-pointer inline-flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" /> Vize Sınavını Gönder ve Sonucu Gör
          </button>
        </div>
      </div>
    </div>
  );
};
