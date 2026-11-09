import React, { useState } from 'react';
import { X, Send, FileText, CheckCircle2, UserCheck, ShieldCheck } from 'lucide-react';
import { Department, StudentProfile, TranscriptSubmission } from '../../types';
import { logAuditEvent } from '../admin/auditService';

interface TranscriptSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile;
  department: Department;
  onSubmit: (submission: TranscriptSubmission) => void;
}

export const TranscriptSubmissionModal: React.FC<TranscriptSubmissionModalProps> = ({
  isOpen,
  onClose,
  profile,
  department,
  onSubmit,
}) => {
  const [studentNote, setStudentNote] = useState('');
  const [isSent, setIsSent] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submission: TranscriptSubmission = {
      id: `sub-${Date.now()}`,
      studentId: String(profile.studentNumber || profile.studentNo || profile.id),
      studentName: profile.fullName,
      departmentName: department.name,
      submittedAt: new Date().toLocaleDateString('tr-TR') + ' ' + new Date().toLocaleTimeString('tr-TR'),
      studentNote: studentNote.trim() || 'Transkript ve dönem sonu notlarımın intibak ve mezuniyet koşullarına göre incelenmesini arz ederim.',
      status: 'pending',
    };

    logAuditEvent(
      'transcript_submit',
      { id: String(profile.userId || profile.id), name: profile.fullName, role: 'student' },
      `Öğrenci transkript inceleme ve onay talebi gönderdi (${department.name})`
    );

    onSubmit(submission);
    setIsSent(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-4">
        {/* Top Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-sm font-bold">Danışmana Transkript & İnceleme Gönder</h2>
              <p className="text-[11px] text-slate-400">Akademik Değerlendirme & İntibak Komisyonu</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!isSent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Öğrenci:</span>
                  <span className="font-bold text-slate-900">{profile.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Öğrenci No:</span>
                  <span className="font-mono font-bold text-amber-700">{profile.studentNumber || profile.studentNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Atanan Baş Danışman:</span>
                  <span className="font-semibold text-slate-900">{profile.assignedAdvisor || 'Danışman Atanmadı'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Mevcut GNO:</span>
                  <span className="font-bold text-emerald-700">{(profile.gpa ?? 0).toFixed(2)} / 4.00</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Danışmana İletmek İstediğiniz Not veya Açıklama:
                </label>
                <textarea
                  rows={4}
                  value={studentNote}
                  onChange={(e) => setStudentNote(e.target.value)}
                  placeholder="Örn: 3. ve 4. yarıyıl eksik derslerimi tamamladım. Transkriptimin intibak komisyonu tarafından incelenip onaylanmasını rica ederim."
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-amber-400 focus:outline-hidden resize-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <span>
                  Gönderilen transkript, güncel vize-final notlarınızla birlikte doğrudan Eğitim Danışmanınız ve
                  Yönetim Paneline aktarılacaktır.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4 text-amber-400" />
                  <span>Danışmana Gönder</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Transkriptiniz Başarıyla Danışmana İletildi
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Talebiniz {profile.assignedAdvisor} ve İntibak Komisyonu ekranına düşmüştür.
                İnceleme tamamlandığında OBS bildirim ekranınız güncellenecektir.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
              >
                Tamam
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
