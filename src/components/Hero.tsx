import React from 'react';
import { GraduationCap, ArrowRight, ShieldCheck, CheckCircle2, Phone, Award, Users, BookOpen } from 'lucide-react';
import { CONTACT_PHONE } from '../data/departmentsAndUniversities';

interface HeroProps {
  onStartSimulation: () => void;
  onOpenConsultants: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartSimulation, onOpenConsultants }) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white pt-12 pb-20">
      {/* Decorative ambient subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Core Value Proposition */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              <Award className="w-4 h-4 text-amber-400" />
              <span>YÖK Öğrenci Affı & Erken Mezuniyet Rehberliği</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white text-balance">
              Eğitim Koçlarımız ve Danışmanlarımız ile{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-amber-400">
                Erken Mezun Olup Diplomanı
              </span>{' '}
              Gecikmeden Sene Uzatmadan Alabilirsin
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              Kaldığın eksik dersleri tespit ediyor, kaydın silinmişse güncel öğrenci affından
              yararlandırıyor, pasifsen kayıt yenilemeni planlıyoruz. Harç borcu, kredi ücretleri
              ve 10.000 TL burs geri ödemelerini hesaplayıp kişiye özel ders tamamlama koçluğu sunuyoruz.
            </p>

            {/* Value checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-sm text-slate-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Eksik dersler için garantili geçme notu ve intibak planlaması</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Geçmiş yıl harç borçları ve burs hesaplaması</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Öğrenci kimlik kartı ve resmi diploma şablonu</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Prof. Dr. Murat Doğan başkanlığında akademik heyet</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button
                onClick={onStartSimulation}
                className="px-6 py-3.5 text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 active:scale-98 rounded-xl transition-all shadow-lg shadow-amber-400/20 flex items-center gap-2 cursor-pointer"
              >
                <span>Mezuniyet & İntibak Planı Başlat</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href={`tel:${CONTACT_PHONE.replace(/\s+/g, '')}`}
                className="px-5 py-3.5 text-sm font-semibold text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-xl transition-all flex items-center gap-2"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>Hızlı Bilgi Hattı: {CONTACT_PHONE}</span>
              </a>
            </div>

            {/* Trust badge */}
            <div className="pt-2 flex items-center gap-3 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Resmi üniversite başharfleri monogramlı (AÜ, EAÜ, İÜ) güvenli OBS altyapısı</span>
            </div>
          </div>

          {/* Right Column: Visual Showcase */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden border border-slate-700/60 shadow-2xl bg-slate-800/50 backdrop-blur-xs">
              <img
                src="/src/assets/images/hero_academic_campus_1794166031742.jpg"
                alt="Üniversite Kampüs Kütüphanesi ve Mezuniyet"
                className="w-full h-80 sm:h-96 object-cover"
                referrerPolicy="no-referrer"
              />
              
              {/* Overlay card */}
              <div className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                      diplomatr.com / obs
                    </div>
                    <div className="text-sm font-bold text-white mt-0.5">
                      Dinamik Mezuniyet & Koçluk Sistemi
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 text-xs font-medium border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Aktif Danışmanlık</span>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                    <div className="font-bold text-amber-300 text-sm">14</div>
                    <div className="text-slate-400 text-[11px]">Bölüm Kataloğu</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                    <div className="font-bold text-amber-300 text-sm">%100</div>
                    <div className="text-slate-400 text-[11px]">Müfredat Uyumu</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                    <div className="font-bold text-amber-300 text-sm">10.000 TL</div>
                    <div className="text-slate-400 text-[11px]">Burs Analizi</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
