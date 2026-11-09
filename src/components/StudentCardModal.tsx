import React from 'react';
import { X, Printer, Download, CreditCard, ShieldCheck, QrCode } from 'lucide-react';
import { Department, StudentProfile, University } from '../types';
import { exportElementToPdf } from '../utils/pdfExport';
import { logAuditEvent } from '../modules/admin/auditService';

interface StudentCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile;
  university: University;
  department: Department;
}

export const StudentCardModal: React.FC<StudentCardModalProps> = ({
  isOpen,
  onClose,
  profile,
  university,
  department,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Modal Top Bar */}
        <div className="no-print bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-bold">Öğrenci Kimlik Kartı (sablon_kimlik.html)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                const sNum = profile.studentNumber || profile.studentNo;
                logAuditEvent(
                  'id_card_download',
                  { id: String(profile.userId || profile.id), name: profile.fullName, role: 'student' },
                  `Öğrenci kimlik kartı PDF olarak indirildi (${sNum})`
                );
                await exportElementToPdf('student-id-card', `Ogrenci_Kimlik_${sNum}`, {
                  orientation: 'landscape',
                  format: [85.6, 53.98],
                });
              }}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PDF İndir</span>
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

        {/* Printable Card Area */}
        <div className="p-6 sm:p-8 bg-slate-100 flex flex-col items-center justify-center">
          {/* Card Wrapper (Standard ISO CR-80 PVC Card Aspect Ratio 85.6mm x 53.98mm) */}
          <div
            id="student-id-card"
            className="w-full max-w-[440px] aspect-[1.586] rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white p-5 shadow-2xl border border-slate-700 relative overflow-hidden flex flex-col justify-between"
          >
            {/* Background subtle guilloche lines */}
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />
            <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />

            {/* Card Header: Uni Monogram & Title */}
            <div className="relative flex items-center justify-between pb-3 border-b border-slate-700/80">
              <div className="flex items-center gap-3">
                {/* Monogram Badge */}
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black font-serif text-xl flex items-center justify-center shadow-md shrink-0 border border-amber-300">
                  {university.code}
                </div>
                <div>
                  <div className="text-xs font-black tracking-wide uppercase text-white truncate max-w-[200px]">
                    {university.name}
                  </div>
                  <div className="text-[10px] text-amber-400 font-semibold tracking-wider uppercase">
                    Öğrenci Bilgi Sistemi Kimlik Kartı
                  </div>
                </div>
              </div>

              {/* Smart Card Chip */}
              <div className="w-9 h-7 rounded-md bg-gradient-to-br from-amber-200 via-amber-300 to-amber-500 border border-amber-400/80 shadow-xs flex items-center justify-center">
                <div className="w-full h-[1px] bg-amber-600/60 my-auto" />
              </div>
            </div>

            {/* Card Center: Photo and Details */}
            <div className="relative grid grid-cols-12 gap-3.5 items-center my-auto py-1">
              {/* Photo Box */}
              <div className="col-span-4 flex flex-col items-center">
                <div className="relative w-22 h-26 rounded-xl overflow-hidden border-2 border-amber-400 shadow-md bg-slate-800">
                  <img
                    src={profile.avatarUrl}
                    alt={profile.fullName}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {/* Hologram security watermark tag */}
                  <div className="absolute bottom-0 inset-x-0 bg-amber-500/80 text-[8px] font-extrabold text-slate-950 text-center py-0.5 tracking-widest uppercase">
                    TESCİLLİ
                  </div>
                </div>
              </div>

              {/* Data Fields */}
              <div className="col-span-8 space-y-1 text-slate-200">
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-slate-400">Adı Soyadı</div>
                  <div className="text-sm font-bold text-white tracking-wide truncate">
                    {profile.fullName}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-[9px] uppercase tracking-wider text-slate-400">Öğrenci No</div>
                    <div className="text-xs font-mono font-bold text-amber-300">
                      {profile.studentNumber}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] uppercase tracking-wider text-slate-400">T.C. Kimlik No</div>
                    <div className="text-xs font-mono font-medium text-slate-300">
                      {profile.tcNo}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-[9px] uppercase tracking-wider text-slate-400">Bölüm / Program</div>
                  <div className="text-xs font-semibold text-slate-100 truncate">
                    {department.name}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div>
                    <span className="text-slate-400">Kan:</span>{' '}
                    <span className="font-bold text-red-400">{profile.bloodType}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Kayıt:</span>{' '}
                    <span className="font-mono text-slate-300">{profile.registrationDate || profile.createdAt?.substring(0, 10)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Footer: Barcode & Security Strip */}
            <div className="relative pt-2 border-t border-slate-700/80 flex items-center justify-between">
              {/* Barcode Mock */}
              <div className="flex flex-col">
                <div className="flex items-center gap-[2px] h-4">
                  <div className="w-[2px] h-full bg-white" />
                  <div className="w-[1px] h-full bg-white" />
                  <div className="w-[3px] h-full bg-white" />
                  <div className="w-[1px] h-full bg-white" />
                  <div className="w-[4px] h-full bg-white" />
                  <div className="w-[2px] h-full bg-white" />
                  <div className="w-[1px] h-full bg-white" />
                  <div className="w-[3px] h-full bg-white" />
                  <div className="w-[2px] h-full bg-white" />
                  <div className="w-[1px] h-full bg-white" />
                  <div className="w-[3px] h-full bg-white" />
                  <div className="w-[2px] h-full bg-white" />
                  <div className="w-[4px] h-full bg-white" />
                  <div className="w-[1px] h-full bg-white" />
                  <div className="w-[2px] h-full bg-white" />
                  <div className="w-[3px] h-full bg-white" />
                </div>
                <div className="text-[8px] font-mono text-slate-400 tracking-widest mt-0.5">
                  *{profile.studentNumber}*
                </div>
              </div>

              {/* Security seal info */}
              <div className="flex items-center gap-1.5 text-right">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <div className="text-[9px] font-semibold text-slate-300 leading-tight">
                  <div>YÖK-OBS</div>
                  <div className="text-slate-400">E-Doğrulanabilir</div>
                </div>
              </div>
            </div>
          </div>

          <div className="no-print mt-4 text-center text-xs text-slate-500">
            Kimlik kartı ISO CR-80 standart PVC ölçülerindedir. Yazdırıp doğrudan kart basımında kullanabilirsiniz.
          </div>
        </div>
      </div>
    </div>
  );
};
