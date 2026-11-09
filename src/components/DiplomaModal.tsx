import React, { useState } from 'react';
import { X, Printer, Download, Award, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Department, StudentProfile, University } from '../types';
import { exportElementToPdf } from '../utils/pdfExport';
import { logAuditEvent } from '../modules/admin/auditService';

interface DiplomaModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile;
  university: University;
  department: Department;
}

export const DiplomaModal: React.FC<DiplomaModalProps> = ({
  isOpen,
  onClose,
  profile,
  university,
  department,
}) => {
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const sNum = profile.studentNumber || profile.studentNo || '202610101';
  const uId = String(profile.userId || profile.id);

  const handleDownloadPdf = async () => {
    setIsExporting(true);
    logAuditEvent(
      'diploma_download',
      { id: uId, name: profile.fullName, role: 'student' },
      `Resmi üniversite diploması PDF olarak indirildi (${sNum} - ${university.code})`
    );

    await exportElementToPdf('university-diploma', `Resmi_Universite_Diplomasi_${sNum}`, {
      orientation: 'landscape',
      format: 'a4',
    });
    setIsExporting(false);
  };

  const degreeTitle = department.type.includes('Ön Lisans')
    ? 'ÖN LİSANS DİPLOMASI'
    : 'LİSANS DİPLOMASI';

  const honorDegree = (profile.gpa ?? 0) >= 3.5
    ? 'YÜKSEK ŞEREF DERECESİ'
    : (profile.gpa ?? 0) >= 3.0
    ? 'ŞEREF DERECESİ'
    : 'BAŞARI DERECESİ';

  const diplomaNo = profile.diplomaNumber || `DIP-${university.code}-${sNum.slice(-6)}`;
  const graduationDate = profile.graduationDate || '08 KASIM 2026';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-4">
        {/* Modal Top Bar */}
        <div className="no-print bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span className="text-sm font-bold">
              Resmi Üniversite Diploması ({university.code} - sablon_diploma.html)
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'PDF Hazırlanıyor...' : 'PDF Olarak İndir'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
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

        {/* Printable Luxury Academic Diploma Area */}
        <div className="p-4 sm:p-8 bg-stone-100 flex justify-center">
          {/* A4 Landscape Diploma Canvas */}
          <div
            id="university-diploma"
            className="w-full max-w-[840px] aspect-[1.414] bg-[#fdfbf7] text-slate-900 p-8 sm:p-12 shadow-2xl relative border-[12px] border-double border-[#855827]/70 flex flex-col justify-between select-text"
            style={{
              backgroundImage: `radial-gradient(#8558270a 1px, transparent 1px)`,
              backgroundSize: '20px 20px',
            }}
          >
            {/* Ornate Inner Corner Borders */}
            <div className="absolute top-2 left-2 w-12 h-12 border-t-2 border-l-2 border-[#855827]/60 pointer-events-none" />
            <div className="absolute top-2 right-2 w-12 h-12 border-t-2 border-r-2 border-[#855827]/60 pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-12 h-12 border-b-2 border-l-2 border-[#855827]/60 pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-12 h-12 border-b-2 border-r-2 border-[#855827]/60 pointer-events-none" />

            {/* University Monogram & Header */}
            <div className="text-center space-y-1 relative z-10">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full border-2 border-[#855827] bg-[#fbf7ee] text-[#855827] font-serif font-black text-2xl shadow-inner mb-1">
                {university.code}
              </div>
              <div className="text-xs uppercase tracking-[0.3em] text-[#855827] font-semibold">
                TÜRKİYE CUMHURİYETİ
              </div>
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 tracking-wider uppercase">
                {university.name}
              </h1>
              <div className="text-xs font-serif italic text-slate-600">
                {department.faculty}
              </div>
            </div>

            {/* Diploma Degree Title */}
            <div className="text-center my-2 relative z-10">
              <div className="inline-block py-1 px-8 border-y-2 border-[#855827]/50 text-sm sm:text-base font-serif font-bold tracking-[0.25em] text-[#855827] uppercase">
                {degreeTitle}
              </div>
            </div>

            {/* Student Name & Conferral Statement */}
            <div className="text-center space-y-3 px-4 relative z-10">
              <div className="text-xs text-slate-600 font-serif italic">
                Üniversitemiz yetkili kurulları kararıyla gerekli tüm akademik yükümlülükleri ve AKTS kredisini tamamlayan
              </div>

              <div className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-wide underline decoration-[#855827]/40 underline-offset-8">
                {profile.fullName.toLocaleUpperCase('tr-TR')}
              </div>

              <div className="text-xs sm:text-sm text-slate-800 font-serif max-w-xl mx-auto leading-relaxed pt-1">
                Üniversitemiz <span className="font-semibold text-slate-950">{department.name}</span> programından{' '}
                <span className="font-semibold text-[#855827]">{honorDegree}</span> ile başarıyla mezun olmuş ve
                kendisine yasaların tanıdığı tüm hak ve yetkiler tevcih edilmiştir.
              </div>
            </div>

            {/* Academic Metrics Strip */}
            <div className="flex items-center justify-center gap-6 sm:gap-10 text-xs font-serif text-slate-700 py-1 border-t border-b border-[#855827]/20 relative z-10">
              <div>
                <span className="text-slate-500">T.C. Kimlik No:</span>{' '}
                <span className="font-mono font-bold text-slate-800">{profile.tcNo}</span>
              </div>
              <div>
                <span className="text-slate-500">Öğrenci No:</span>{' '}
                <span className="font-mono font-bold text-slate-800">{profile.studentNumber}</span>
              </div>
              <div>
                <span className="text-slate-500">GNO (Ortalama):</span>{' '}
                <span className="font-mono font-bold text-[#855827]">{profile.gpa.toFixed(2)} / 4.00</span>
              </div>
              <div>
                <span className="text-slate-500">Mezuniyet Tarihi:</span>{' '}
                <span className="font-bold text-slate-800">{graduationDate}</span>
              </div>
            </div>

            {/* Bottom Row: Official Seal and Signatures */}
            <div className="grid grid-cols-3 items-end pt-2 relative z-10">
              {/* Dean Signature */}
              <div className="text-center">
                <div className="font-serif italic text-sm text-slate-700 font-semibold h-10 flex items-center justify-center font-['Playfair_Display']">
                  {university.deanName.split(' ')[1]} {university.deanName.split(' ')[2]}
                </div>
                <div className="w-32 mx-auto border-t border-slate-500/60 pt-1">
                  <div className="text-xs font-bold text-slate-900 uppercase">{university.deanName}</div>
                  <div className="text-[10px] text-slate-600 font-serif">Fakülte Dekanı / Müdür</div>
                </div>
              </div>

              {/* Center Embossed Gold Seal */}
              <div className="flex flex-col items-center justify-center">
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden shadow-lg border-2 border-[#855827]/40 bg-white">
                  <img
                    src="/src/assets/images/gold_diploma_seal_1794166031422.jpg"
                    alt="Resmi Üniversite Altın Mührü"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="text-[9px] font-mono text-[#855827] mt-1 font-semibold tracking-wider">
                  {diplomaNo}
                </div>
              </div>

              {/* Rector Signature */}
              <div className="text-center">
                <div className="font-serif italic text-sm text-slate-700 font-semibold h-10 flex items-center justify-center font-['Playfair_Display']">
                  {university.rectorName.split(' ')[1]} {university.rectorName.split(' ')[2]}
                </div>
                <div className="w-32 mx-auto border-t border-slate-500/60 pt-1">
                  <div className="text-xs font-bold text-slate-900 uppercase">{university.rectorName}</div>
                  <div className="text-[10px] text-slate-600 font-serif">Üniversite Rektörü</div>
                </div>
              </div>
            </div>

            {/* Bottom e-Devlet Barkod & Verification Note */}
            <div className="text-[9px] text-slate-400 font-mono flex items-center justify-between pt-1 border-t border-[#855827]/10">
              <span>YÖKSİS & e-Devlet Barkod Doğrulama No: {profile.studentNumber}-TR</span>
              <span>diplomatr.com / obs Tescil Onaylı</span>
            </div>
          </div>
        </div>

        <div className="no-print p-4 bg-white border-t border-slate-200 text-center text-xs text-slate-600">
          Bu diploma şablonu ({university.code}), YÖK standartlarında resmi mezuniyet belgesi ve transkript tamamlaması
          esas alınarak hazırlanmıştır.
        </div>
      </div>
    </div>
  );
};
