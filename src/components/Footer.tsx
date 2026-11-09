import React from 'react';
import { useElearn } from '../context/ElearnContext';
import { GraduationCap, MapPin, Phone, Mail, Clock, ShieldCheck, Award } from 'lucide-react';

interface FooterProps {
  onOpenKvkk: () => void;
  setCurrentView: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenKvkk, setCurrentView }) => {
  const { contactSettings, siteSettings } = useElearn();

  return (
    <footer className="bg-slate-950 text-white mt-auto pt-14 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 mb-12">
          {/* Logo & Hakkımızda */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 flex items-center justify-center font-bold text-lg shadow-md">
                <GraduationCap className="w-6 h-6 text-slate-950" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-white flex items-center gap-1">
                  OBS<span className="text-amber-400">TR</span>
                </span>
                <span className="text-[10px] text-amber-300 font-semibold block">Hızlı Mezuniyet & Danışmanlık Portalı</span>
              </div>
            </div>
            <p className="text-amber-200/90 text-xs font-semibold italic border-l-2 border-amber-400 pl-3">
              "Diplomanı Geciktirme, Mezuniyetini Geciktirme! Hemen Mezun Ol, Hemen Diplomanı Al, İş Hayatına Atıl!"
            </p>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              {siteSettings.aboutSummary || 'Üniversite öğrencilerimizin eksik AKTS, alttan ders ve harç borçlarını danışmanlarımız eşliğinde yapılandırarak en erken tarihte resmi mezuniyet belgesi ve diplomasına kavuşmasını sağlıyoruz.'}
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 text-xs font-semibold border border-teal-500/20">
                <ShieldCheck className="w-3.5 h-3.5" /> 6698 Sayılı KVKK Uyumlu Altyapı
              </span>
            </div>
          </div>

          {/* Hızlı Menü */}
          <div className="lg:col-span-2 space-y-3">
            <h6 className="text-xs uppercase font-extrabold text-amber-400 tracking-wider">Hızlı Erişim</h6>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => setCurrentView('home')} className="hover:text-white transition-colors cursor-pointer">
                  Ana Sayfa
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('obs')} className="hover:text-amber-300 transition-colors font-medium cursor-pointer">
                  OBS Öğrenci Portalı
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('calculators')} className="hover:text-white transition-colors cursor-pointer">
                  Harç & Kredi Hesaplama
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('past_exams')} className="hover:text-white transition-colors cursor-pointer">
                  Çıkmış Sorular & Arşiv
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('admin_login')} className="hover:text-white transition-colors cursor-pointer">
                  Yönetici Girişi
                </button>
              </li>
            </ul>
          </div>

          {/* İletişim Bilgileri */}
          <div className="lg:col-span-3 space-y-3">
            <h6 className="text-xs uppercase font-extrabold text-amber-400 tracking-wider">İletişim & Danışmanlık</h6>
            <div className="space-y-2 text-xs text-slate-400">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{contactSettings.address}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-semibold text-slate-200">{contactSettings.phone}</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{contactSettings.email}</span>
              </p>
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{contactSettings.workingHours}</span>
              </p>
            </div>
          </div>

          {/* KVKK & Mezuniyet Güvencesi */}
          <div className="lg:col-span-3 space-y-3">
            <h6 className="text-xs uppercase font-extrabold text-amber-400 tracking-wider">Mezuniyet & Hukuk Güvencesi</h6>
            <p className="text-slate-400 text-xs leading-relaxed">
              Tüm transkript, intibak ve mezuniyet işlemleri YÖK mevzuatı, üniversite senato kararları ve resmi af kanunları doğrultusunda yürütülür.
            </p>
            <button
              onClick={onOpenKvkk}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              KVKK Aydınlatma Metnini İncele
            </button>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>{siteSettings.footerText || '© 2026 OBS TR – Öğrenci Bilgi Sistemi & Hızlı Mezuniyet Portalı. Tüm hakları saklıdır.'}</div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Türkiye Saati: {new Date().toLocaleDateString('tr-TR')} (Europe/Istanbul)</span>
            <span>•</span>
            <span className="text-amber-400/80 font-semibold flex items-center gap-1">
              <Award className="w-3.5 h-3.5" /> Resmi Diploma & Mezuniyet Tescilli
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
