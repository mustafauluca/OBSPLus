import React, { useState, useEffect } from 'react';
import { useElearn } from '../context/ElearnContext';
import { Clock, CheckCircle, AlertCircle, ArrowLeft, Send } from 'lucide-react';
import { evaluateExamAnswers } from '../utils/elearn-logic';

interface QuizViewProps {
  topicId: number;
  setCurrentView: (view: string, params?: Record<string, any>) => void;
}

export const QuizView: React.FC<QuizViewProps> = ({ topicId, setCurrentView }) => {
  const { topics, questions, submitExamAttempt, currentStudent, trackPageVisit } = useElearn();

  const topic = topics.find((t) => t.id === topicId) || topics[0];
  // Bu konuya ait veya derse ait soruları getir
  const quizQuestions = questions.filter((q) => q.topicId === topic?.id);
  const activeQuestions = quizQuestions.length > 0 ? quizQuestions : questions.slice(0, 3);

  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(15 * 60); // 15 dakika
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  useEffect(() => {
    trackPageVisit(`${topic?.title || 'Konu'} Testi`, `/elearn/test?topic_id=${topicId}`);
  }, [topicId]);

  // Geri sayım sayacı
  useEffect(() => {
    if (timeLeft <= 0 && !isSubmitted) {
      handleQuizSubmit();
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

  const handleQuizSubmit = () => {
    if (isSubmitted) return;
    setIsSubmitted(true);

    const questionAnswers = activeQuestions.map((q) => {
      const correctOpt = q.options.find((o) => o.isCorrect)?.optionKey || 'A';
      return {
        questionId: q.id,
        points: q.points,
        correctOptionKey: correctOpt,
        selectedOptionKey: selectedAnswers[q.id],
      };
    });

    const summary = evaluateExamAnswers(questionAnswers, 50);

    const detailedAnswers = activeQuestions.map((q) => {
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
      examType: 'quiz',
      targetId: topic.id,
      targetTitle: `${topic.title} Konu Testi`,
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
      {/* Sınav Başlık ve Zamanlayıcı */}
      <div className="bg-slate-900 text-white py-8 px-4 sticky top-16 z-30 shadow-md">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold text-teal-400 uppercase tracking-wider">
              {topic.title}
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white mt-0.5">Konu Değerlendirme Testi</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono font-bold flex items-center gap-2 shadow-inner">
              <Clock className="w-4 h-4 text-rose-400" />
              <span>
                Kalan Süre: <strong className="text-white text-sm">{minutes < 10 ? '0' : ''}{minutes}:{seconds < 10 ? '0' : ''}{seconds}</strong>
              </span>
            </div>

            <button
              onClick={handleQuizSubmit}
              className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" /> Testi Bitir
            </button>
          </div>
        </div>
      </div>

      {/* Sorular Listesi */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        {activeQuestions.map((q, index) => {
          const selectedKey = selectedAnswers[q.id];

          return (
            <div
              key={q.id}
              className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-xs">
                  Soru {index + 1} / {activeQuestions.length}
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
                          ? 'border-teal-500 bg-teal-50/80 text-teal-950 shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 font-mono ${
                          isSelected ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'
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

        {/* Testi Tamamla Kutusu */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center space-y-3">
          <h4 className="font-bold text-slate-800 text-sm">Cevaplarınızı Tamamladınız mı?</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Testi gönderdikten sonra anlık karneniz hesaplanacak, doğru ve yanlış cevaplarınız açıklamaları ile birlikte sunulacaktır.
          </p>
          <button
            onClick={handleQuizSubmit}
            className="px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer inline-flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" /> Testi Bitir ve Değerlendir
          </button>
        </div>
      </div>
    </div>
  );
};
