import React from 'react';
import { GraduationCap, Phone, UserCheck, ShieldCheck, Sparkles, BookOpen } from 'lucide-react';
import { CONTACT_PHONE } from '../data/departmentsAndUniversities';

interface HeaderProps {
  onStartSimulation: () => void;
  onOpenObs: () => void;
  onOpenAdmin: () => void;
  currentView: 'home' | 'obs' | 'admin';
  setCurrentView: (view: 'home' | 'obs' | 'admin') => void;
  hasActiveStudent: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onStartSimulation,
  onOpenObs,
  onOpenAdmin,
  currentView,
  setCurrentView,
  hasActiveStudent,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top micro announcement bar */}
      <div className="bg-slate-900 text-slate-200 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-amber-400">YÖK & Üniversite Mevzuatı Uyumlu:</span>
            <span>Öğrenci affı, pasif kayıt yenileme ve erken mezuniyet danışmanlığı</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href={`tel:${CONTACT_PHONE.replace(/\s+/g, '')}`}
              className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-medium">{CONTACT_PHONE}</span>
            </a>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">Prof. Dr. Murat DOĞAN & Danışman Ekibi</span>
          </div>
        </div>
      </div>

      {/* Main 3-zone Header Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setCurrentView('home')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-amber-400 shadow-sm group-hover:bg-slate-800 transition-colors">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
                diplomatr<span className="text-amber-600">.com</span>
              </div>
              <div className="text-[11px] font-medium text-slate-500 tracking-wide">
                ÖBS & Erken Mezuniyet Danışmanlığı
              </div>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => setCurrentView('home')}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
              currentView === 'home' ? 'text-slate-900 font-semibold' : ''
            }`}
          >
            Ana Sayfa
          </button>
          <a
            href="#koclar"
            onClick={(e) => {
              if (currentView !== 'home') {
                e.preventDefault();
                setCurrentView('home');
                setTimeout(() => {
                  document.getElementById('koclar')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }
            }}
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
          >
            Eğitim Koçlarımız
          </a>
          <a
            href="#bolumler"
            onClick={(e) => {
              if (currentView !== 'home') {
                e.preventDefault();
                setCurrentView('home');
                setTimeout(() => {
                  document.getElementById('bolumler')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }
            }}
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
          >
            Bölümler (Ön Lisans & Lisans)
          </a>
          <button
            onClick={onStartSimulation}
            className="text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Mezuniyet & İntibak Planı
          </button>
          <a
            href="#iletisim"
            onClick={(e) => {
              if (currentView !== 'home') {
                e.preventDefault();
                setCurrentView('home');
                setTimeout(() => {
                  document.getElementById('iletisim')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }
            }}
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
          >
            İletişim
          </a>
        </nav>

        {/* Zone 3: Actions requested specifically: BAŞVUR, Öğrenci Girişi, Akademisyen Girişi */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenAdmin}
            className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              currentView === 'admin'
                ? 'bg-slate-100 text-slate-900 border-slate-300'
                : 'text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
            <span>Akademisyen Girişi</span>
          </button>

          <button
            onClick={onOpenObs}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              currentView === 'obs'
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : hasActiveStudent
                ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Öğrenci Girişi</span>
            {hasActiveStudent && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 ml-0.5" title="Aktif Profil" />
            )}
          </button>

          <button
            onClick={onStartSimulation}
            className="px-4 py-2 text-xs font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-700 active:scale-98 transition-all shadow-xs whitespace-nowrap shrink-0 flex items-center gap-1.5 uppercase tracking-wider"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>BAŞVUR</span>
          </button>
        </div>
      </div>
    </header>
  );
};
