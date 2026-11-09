import React, { useState } from 'react';
import { useElearn } from '../context/ElearnContext';
import {
  GraduationCap,
  BookOpen,
  Trophy,
  Users,
  Phone,
  Lock,
  User,
  LogOut,
  FolderCode,
  Menu,
  X,
  FileText,
  Calculator,
  CreditCard,
  Award,
  Globe,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string, params?: Record<string, any>) => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onOpenIdCard?: () => void;
  onOpenDiploma?: () => void;
  onOpenVisitorIp?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  onOpenLogin,
  onOpenRegister,
  onOpenIdCard,
  onOpenDiploma,
  onOpenVisitorIp,
}) => {
  const { currentStudent, logoutStudent, isAdminLoggedIn, contactSettings, visitorIp } = useElearn();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Üst Bilgi Şeridi */}
      <div className="bg-slate-950 text-slate-300 text-xs py-1.5 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-amber-400 font-bold">
              <Sparkles className="w-3.5 h-3.5" /> Diplomanı Geciktirme, Mezuniyetini Geciktirme! Hemen Mezun Ol!
            </span>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="text-slate-400 hidden sm:inline flex items-center gap-1">
              <Phone className="w-3 h-3 text-teal-400" /> Danışman Hattı: {contactSettings.phone}
            </span>
            <span className="text-slate-600 hidden md:inline">|</span>
            <button
              onClick={onOpenVisitorIp}
              className="text-slate-400 hover:text-slate-200 hidden md:inline-flex items-center gap-1 cursor-pointer transition-colors"
              title="IP ve Tıklama Takibi Bilgisi"
            >
              <Globe className="w-3 h-3 text-sky-400" /> IP: {visitorIp}
            </button>
          </div>

          <div className="flex items-center gap-4 text-xs">
            {isAdminLoggedIn ? (
              <button
                onClick={() => setCurrentView('admin_dashboard')}
                className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Lock className="w-3 h-3" /> Yönetim Paneli Açık
              </button>
            ) : (
              <button
                onClick={() => setCurrentView('admin_login')}
                className="text-slate-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Lock className="w-3 h-3" /> Yönetici Girişi
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Ana Gezinme Çubuğu */}
      <nav className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => setCurrentView('home')}
            className="flex items-center gap-2.5 text-left focus:outline-none cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 flex items-center justify-center font-black text-xl shadow-md border border-amber-300/40">
              <GraduationCap className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white flex items-center gap-1">
                OBS<span className="text-amber-400">TR</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 font-mono font-bold ml-1">E-AKADEMİ</span>
              </span>
              <span className="block text-[10px] text-slate-400 -mt-1 font-medium">Öğrenci Bilgi & Sınav Portali</span>
            </div>
          </button>

          {/* Masaüstü Linkler */}
          <div className="hidden lg:flex items-center gap-5 text-sm font-semibold">
            <button
              onClick={() => setCurrentView('home')}
              className={`transition-colors cursor-pointer ${currentView === 'home' ? 'text-amber-400 font-bold' : 'text-slate-300 hover:text-white'}`}
            >
              Ana Sayfa
            </button>
            <button
              onClick={() => setCurrentView('obs')}
              className={`transition-colors flex items-center gap-1.5 cursor-pointer ${currentView === 'obs' ? 'text-amber-400 font-bold' : 'text-slate-300 hover:text-white'}`}
            >
              <GraduationCap className="w-4 h-4 text-amber-400" />
              OBS Portalı
            </button>
            <button
              onClick={() => setCurrentView('calculators')}
              className={`transition-colors flex items-center gap-1.5 cursor-pointer ${currentView === 'calculators' ? 'text-amber-400 font-bold' : 'text-slate-300 hover:text-white'}`}
            >
              <Calculator className="w-4 h-4 text-amber-400" />
              Erken Mezuniyet & Harç Hesaplama
            </button>
            <button
              onClick={() => setCurrentView('past_exams')}
              className={`transition-colors flex items-center gap-1.5 cursor-pointer ${currentView === 'past_exams' ? 'text-amber-400 font-bold' : 'text-slate-300 hover:text-white'}`}
            >
              <FileText className="w-4 h-4 text-blue-400" />
              Çıkmış Sorular & Arşiv
            </button>
            <button
              onClick={() => {
                setCurrentView('home');
                setTimeout(() => {
                  document.getElementById('danismanlar')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Users className="w-4 h-4 text-teal-400" />
              Akademik Danışmanlar
            </button>
            <button
              onClick={() => {
                setCurrentView('home');
                setTimeout(() => {
                  document.getElementById('skorboard')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              Skorboard
            </button>
          </div>

          {/* Sağ Butonlar */}
          <div className="hidden md:flex items-center gap-2.5">
            {currentStudent ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentView('obs')}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs border border-amber-500/30 flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <GraduationCap className="w-4 h-4 text-amber-400" />
                  OBS Panelim ({currentStudent.firstName})
                </button>

                {onOpenIdCard && (
                  <button
                    onClick={onOpenIdCard}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 cursor-pointer"
                    title="Öğrenci Kimlik Kartını Aç"
                  >
                    <CreditCard className="w-4 h-4 text-amber-400" />
                  </button>
                )}

                {onOpenDiploma && (
                  <button
                    onClick={onOpenDiploma}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 cursor-pointer"
                    title="Resmi Diplomayı Aç"
                  >
                    <Award className="w-4 h-4 text-emerald-400" />
                  </button>
                )}

                <button
                  onClick={logoutStudent}
                  className="p-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/50 cursor-pointer"
                  title="Oturumu Kapat"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenLogin}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-colors cursor-pointer"
                >
                  Öğrenci Girişi
                </button>
                <button
                  onClick={onOpenRegister}
                  className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-colors cursor-pointer"
                >
                  Kayıt Ol
                </button>
              </div>
            )}
          </div>

          {/* Mobil Menü Butonu */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-400 hover:text-white cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobil Menü Açılır Panel */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 py-4 space-y-3">
            <button
              onClick={() => { setCurrentView('home'); setMobileMenuOpen(false); }}
              className="block w-full text-left py-1.5 text-slate-300 hover:text-amber-400 font-semibold"
            >
              Ana Sayfa
            </button>
            <button
              onClick={() => { setCurrentView('obs'); setMobileMenuOpen(false); }}
              className="block w-full text-left py-1.5 text-amber-400 font-bold flex items-center gap-2"
            >
              <GraduationCap className="w-4 h-4" /> OBS Portalı (Öğrenci Bilgi Sistemi)
            </button>
            <button
              onClick={() => { setCurrentView('calculators'); setMobileMenuOpen(false); }}
              className="block w-full text-left py-1.5 text-slate-300 hover:text-amber-400 font-semibold flex items-center gap-2"
            >
              <Calculator className="w-4 h-4 text-amber-400" /> Erken Mezuniyet & Harç Hesaplama
            </button>
            <button
              onClick={() => { setCurrentView('past_exams'); setMobileMenuOpen(false); }}
              className="block w-full text-left py-1.5 text-slate-300 hover:text-amber-400 font-semibold flex items-center gap-2"
            >
              <FileText className="w-4 h-4 text-blue-400" /> Çıkmış Sorular & Arşiv
            </button>
            <button
              onClick={() => {
                setCurrentView('home');
                setMobileMenuOpen(false);
                setTimeout(() => {
                  document.getElementById('danismanlar')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="block w-full text-left py-1.5 text-slate-300 hover:text-amber-400 font-semibold flex items-center gap-2"
            >
              <Users className="w-4 h-4 text-teal-400" /> Akademik Danışmanlar
            </button>
            <button
              onClick={() => {
                setCurrentView('home');
                setMobileMenuOpen(false);
                setTimeout(() => {
                  document.getElementById('skorboard')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="block w-full text-left py-1.5 text-slate-300 hover:text-amber-400 font-semibold flex items-center gap-2"
            >
              <Trophy className="w-4 h-4 text-amber-400" /> Sınav Sıralaması (Skorboard)
            </button>

            <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
              {currentStudent ? (
                <>
                  <button
                    onClick={() => { setCurrentView('obs'); setMobileMenuOpen(false); }}
                    className="w-full py-2 bg-amber-500 rounded-xl text-slate-950 text-xs font-black text-center"
                  >
                    OBS Portalım ({currentStudent.firstName})
                  </button>
                  {onOpenIdCard && (
                    <button
                      onClick={() => { onOpenIdCard(); setMobileMenuOpen(false); }}
                      className="w-full py-2 bg-slate-800 rounded-xl text-slate-200 text-xs font-bold text-center"
                    >
                      Öğrenci Kimlik Kartı
                    </button>
                  )}
                  {onOpenDiploma && (
                    <button
                      onClick={() => { onOpenDiploma(); setMobileMenuOpen(false); }}
                      className="w-full py-2 bg-slate-800 rounded-xl text-slate-200 text-xs font-bold text-center"
                    >
                      Resmi Diploma
                    </button>
                  )}
                  <button
                    onClick={() => { logoutStudent(); setMobileMenuOpen(false); }}
                    className="w-full py-2 bg-red-950 text-red-300 rounded-xl text-xs font-bold text-center"
                  >
                    Çıkış Yap
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => { onOpenLogin(); setMobileMenuOpen(false); }}
                    className="w-full py-2 bg-slate-800 rounded-xl text-white text-xs font-semibold"
                  >
                    Öğrenci Girişi
                  </button>
                  <button
                    onClick={() => { onOpenRegister(); setMobileMenuOpen(false); }}
                    className="w-full py-2 bg-amber-500 rounded-xl text-slate-950 text-xs font-black"
                  >
                    Kayıt Ol (Zorunlu Telefon)
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
};
