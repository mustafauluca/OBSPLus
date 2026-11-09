import React from 'react';
import { useElearn } from '../context/ElearnContext';
import {
  BarChart3,
  Globe,
  LogIn,
  UserCheck,
  Users,
  BookOpen,
  Layers,
  HelpCircle,
  FileText,
  Award,
  Trophy,
  Users2,
  Phone,
  Sliders,
  LogOut,
  ArrowUpRight,
  ShieldCheck,
  FolderCode,
  MousePointer,
  FileArchive,
  GraduationCap
} from 'lucide-react';

interface AdminLayoutProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  children: React.ReactNode;
  setCurrentView: (view: string) => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  setCurrentTab,
  children,
  setCurrentView,
}) => {
  const { logoutAdmin, students } = useElearn();

  const handleLogout = () => {
    logoutAdmin();
    setCurrentView('home');
  };

  const pendingPhotosCount = students.filter((s) => s.photoStatus === 'pending').length;

  const navItems = [
    { id: 'dashboard', label: 'Genel Bakış & İstatistik', icon: BarChart3, group: 'İstatistik' },
    { id: 'clicks', label: 'Canlı Tıklama Takibi', icon: MousePointer, group: 'İstatistik' },
    { id: 'visitors', label: 'IP Ziyaret Logları', icon: Globe, group: 'İstatistik' },
    { id: 'login_logs', label: 'Öğrenci Giriş Logları', icon: LogIn, group: 'İstatistik' },
    { id: 'register_logs', label: 'Öğrenci Kayıt Logları', icon: UserCheck, group: 'İstatistik' },

    { id: 'students', label: 'Öğrenci & Şifre Yönetimi', icon: Users, group: 'Eğitim & Sınav', badge: pendingPhotosCount > 0 ? `${pendingPhotosCount} Foto` : undefined },
    { id: 'past_exams', label: 'Çıkmış Sorular (Upload)', icon: FileArchive, group: 'Eğitim & Sınav' },
    { id: 'courses', label: 'Ders Yönetimi', icon: BookOpen, group: 'Eğitim & Sınav' },
    { id: 'topics', label: 'Konu & Video/PDF Yönetimi', icon: Layers, group: 'Eğitim & Sınav' },
    { id: 'questions', label: 'Soru Havuzu', icon: HelpCircle, group: 'Eğitim & Sınav' },
    { id: 'exams', label: 'Vize Sınavları', icon: FileText, group: 'Eğitim & Sınav' },
    { id: 'results', label: 'Sınav Sonuçları', icon: Award, group: 'Eğitim & Sınav' },
    { id: 'scoreboard', label: 'Skorboard Yönetimi', icon: Trophy, group: 'Eğitim & Sınav' },

    { id: 'team', label: 'Ekip & Heyet Yönetimi', icon: Users2, group: 'Sistem' },
    { id: 'contact', label: 'İletişim Bilgileri', icon: Phone, group: 'Sistem' },
    { id: 'settings', label: 'Site & KVKK Ayarları', icon: Sliders, group: 'Sistem' },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500 text-slate-950 font-black flex items-center justify-center text-sm">
              <ShieldCheck className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">E-LEARN ADMIN</div>
              <div className="text-[10px] text-teal-400 font-semibold">Yönetim ve Denetim</div>
            </div>
          </div>
        </div>

        <nav className="p-3 space-y-1 flex-grow overflow-y-auto max-h-[calc(100vh-140px)]">
          {navItems.map((item, index) => {
            const showGroupHeader = index === 0 || navItems[index - 1].group !== item.group;
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <React.Fragment key={item.id}>
                {showGroupHeader && (
                  <div className="text-[10px] uppercase font-bold text-slate-500 px-3 pt-3 pb-1 tracking-wider">
                    {item.group}
                  </div>
                )}
                <button
                  onClick={() => setCurrentTab(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-teal-600 text-white font-bold shadow-sm'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </button>
              </React.Fragment>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs">
          <div>
            <div className="font-bold text-white">Yönetici (Süper Admin)</div>
            <div className="text-[10px] text-slate-500">admin@elearn.edu.tr</div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-rose-400 hover:bg-rose-950/50 rounded-lg transition-colors"
            title="Oturumu Kapat"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Admin Main Content */}
      <div className="flex-grow flex flex-col min-w-0">
        {/* Üst Başlık Çubuğu */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-slate-900">
              {navItems.find((n) => n.id === currentTab)?.label || 'Yönetim Paneli'}
            </h2>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <button
              onClick={() => setCurrentView('php_distribution')}
              className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 font-bold border border-amber-200 hover:bg-amber-100 flex items-center gap-1.5 cursor-pointer"
            >
              <FolderCode className="w-3.5 h-3.5 text-amber-600" /> PHP Dağıtım Paketi
            </button>
            <button
              onClick={() => setCurrentView('home')}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold flex items-center gap-1 cursor-pointer"
            >
              Siteyi Aç <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        <main className="p-6 flex-grow">{children}</main>
      </div>
    </div>
  );
};
