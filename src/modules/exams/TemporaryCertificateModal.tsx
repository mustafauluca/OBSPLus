import React, { useState } from 'react';
import { X, Award, Printer, Download, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Department, StudentProfile, University, ExamAttempt } from '../../types';
import { exportElementToPdf } from '../../utils/pdfExport';
import { logAuditEvent } from '../admin/auditService';

interface TemporaryCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile;
  university: University;
  department: Department;
  attempt?: ExamAttempt;
}

export const TemporaryCertificateModal: React.FC<TemporaryCertificateModalProps> = ({
  isOpen,
  onClose,
  profile,
  university,
  department,
  attempt,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen) return null;

  const sNum = profile.studentNumber || profile.studentNo || '202610101';
  const certNumber = attempt?.certificateNumber || `GMB-${university.code}-${sNum.slice(-6)}`;
  const certDate = attempt?.attemptDate || '08.11.2026';

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    logAuditEvent(
      'diploma_download',
      { id: String(profile.userId || profile.id), name: profile.fullName, role: 'student' },
      `Geçici Mezuniyet Belgesi PDF olarak indirildi (${certNumber})`
    );

    await exportElementToPdf('temporary-certificate-canvas', `Gecici_Mezuniyet_Belgesi_${sNum}`, {
      orientation: 'portrait',
      format: 'a4',
    });
    setIsDownloading(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-4">
        {/* Top bar */}
        <div className="no-print bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span className="text-sm font-bold">T.C. Geçici Mezuniyet Belgesi</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? 'PDF Hazırlanıyor...' : 'PDF Olarak İndir'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Yazdır</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate document container */}
        <div className="p-4 sm:p-8 bg-stone-100 flex justify-center">
          <div
            id="temporary-certificate-canvas"
            className="w-full max-w-[620px] bg-white text-slate-900 p-8 sm:p-10 shadow-xl border-4 border-slate-800 relative select-text"
          >
            {/* Watermark / Header */}
            <div className="text-center pb-4 border-b-2 border-slate-800">
              <div className="text-xs uppercase tracking-widest text-slate-600 font-semibold">
                TÜRKİYE CUMHURİYETİ
              </div>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-slate-800 bg-slate-50 text-slate-900 font-serif font-black text-xl my-1">
                {university.code}
              </div>
              <h2 className="text-base sm:text-lg font-bold uppercase tracking-wider">
                {university.name}
              </h2>
              <div className="text-xs text-slate-600 font-serif italic">
                {department.faculty} - Öğrenci İşleri Daire Başkanlığı
              </div>
            </div>

            {/* Document Title */}
            <div className="text-center my-6">
              <h1 className="text-lg sm:text-xl font-bold tracking-widest text-slate-950 underline underline-offset-4 uppercase">
                GEÇİCİ MEZUNİYET BELGESİ
              </h1>
              <div className="text-[11px] text-slate-500 mt-1">
                (Asıl diploma tanzim edilene kadar yasal geçerliliğe sahiptir)
              </div>
            </div>

            {/* Content Details */}
            <div className="space-y-4 text-xs sm:text-sm text-slate-800 leading-relaxed font-serif">
              <p>
                Aşağıda açık kimlik bilgileri yazılı bulunan öğrencimiz, üniversitemiz yetkili kurullarının
                belirlediği tüm müfredat derslerini, zorunlu AKTS kredilerini ve intibak/bitirme sınavı
                yükümlülüklerini başarıyla tamamlayarak mezun olmaya hak kazanmıştır.
              </p>

              <div className="my-4 bg-slate-50 border border-slate-300 rounded-lg p-3.5 space-y-2 font-sans text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-500">Adı Soyadı:</span>{' '}
                    <span className="font-bold text-slate-950">{profile.fullName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">T.C. Kimlik No:</span>{' '}
                    <span className="font-mono font-bold text-slate-950">{profile.tcNo}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-500">Öğrenci Numarası:</span>{' '}
                    <span className="font-mono font-bold text-amber-700">{profile.studentNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Genel Not Ortalaması:</span>{' '}
                    <span className="font-bold text-emerald-700">{profile.gpa.toFixed(2)} / 4.00</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-500">Program / Bölüm:</span>{' '}
                  <span className="font-semibold text-slate-950">{department.name} ({department.type})</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-500">Belge Seri No:</span>{' '}
                    <span className="font-mono font-semibold text-slate-700">{certNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Tanzim Tarihi:</span>{' '}
                    <span className="font-semibold text-slate-700">{certDate}</span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-600 italic">
                İşbu geçici mezuniyet belgesi, ilgilinin talebi üzerine resmi makamlara ibraz edilmek
                üzere elektronik imzalı ve karekod doğrulamalı olarak tanzim olunmuştur.
              </p>
            </div>

            {/* Signature Block */}
            <div className="mt-8 pt-4 border-t border-slate-300 grid grid-cols-2 items-end">
              <div className="space-y-1">
                <div className="w-16 h-16 border border-slate-300 rounded-md p-1 bg-white">
                  <div className="w-full h-full bg-slate-900 flex items-center justify-center text-[9px] text-white font-mono text-center">
                    KAREKOD<br />YÖKSİS
                  </div>
                </div>
                <div className="text-[9px] text-slate-500 font-mono">
                  Doğrulama Kodu: {profile.studentNumber}-OK
                </div>
              </div>

              <div className="text-center space-y-1">
                <div className="font-serif italic text-sm text-slate-700 font-bold">
                  {university.rectorName}
                </div>
                <div className="text-xs font-semibold text-slate-900 uppercase">
                  Rektör / Genel Sekreter
                </div>
                <div className="text-[10px] text-slate-500">
                  Elektronik İmzalıdır
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="no-print p-4 bg-white border-t border-slate-200 text-center text-xs text-slate-500">
          Bu belge 2547 sayılı Yükseköğretim Kanunu uyarınca asıl diploma düzenleninceye kadar resmi geçerliliğe sahiptir.
        </div>
      </div>
    </div>
  );
};
