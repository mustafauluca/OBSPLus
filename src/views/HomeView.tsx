import React, { useEffect, useState } from 'react';
import { useElearn } from '../context/ElearnContext';
import {
  GraduationCap,
  Trophy,
  Award,
  Sparkles,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Send,
  ArrowRight,
  ShieldCheck,
  Calculator,
  CreditCard,
  Calendar,
  Clock,
  ChevronRight,
  UserCheck,
  FileCheck2,
  Banknote
} from 'lucide-react';
import { INITIAL_UNIVERSITIES, DEPARTMENTS, CONSULTANTS_AND_STAFF } from '../data/departmentsAndUniversities';

interface HomeViewProps {
  setCurrentView: (view: string, params?: Record<string, any>) => void;
  onOpenRegister: () => void;
  onOpenLogin: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  setCurrentView,
  onOpenRegister,
  onOpenLogin,
}) => {
  const {
    getTopScoreboard,
    students,
    contactSettings,
    trackPageVisit,
    currentStudent,
    siteSettings
  } = useElearn();

  useEffect(() => {
    trackPageVisit('OBS TR Ana Sayfa - Hızlı Mezuniyet Portalı', '/');
  }, []);

  const scoreboard = getTopScoreboard();

  // Quick Simulator state in Hero
  const [selectedUni, setSelectedUni] = useState(INITIAL_UNIVERSITIES[0]?.id || 'uni-au');
  const [selectedDept, setSelectedDept] = useState(DEPARTMENTS[0]?.id || 'tibbi-dokumantasyon');
  const [selectedClass, setSelectedClass] = useState('3. Sınıf');

  // Contact form state
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSuccess(true);
    setContactName('');
    setContactPhone('');
    setContactEmail('');
    setContactMessage('');
    setTimeout(() => setContactSuccess(false), 5000);
  };

  const currentUniObj = INITIAL_UNIVERSITIES.find((u) => u.id === selectedUni) || INITIAL_UNIVERSITIES[0];
  const currentDeptObj = DEPARTMENTS.find((d) => d.id === selectedDept) || DEPARTMENTS[0];

  return (
    <div className="space-y-16">
      {/* 1. HERO ALANI - RESMİ MOTİVASYON VE HIZLI MEZUNİYET SLOGANI */}
      <section className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white py-16 sm:py-24 px-4 overflow-hidden border-b border-slate-800">
        {/* Arka plan süslemeleri */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        <div className="absolute top-10 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Sol Kolon: Başlık ve Açıklama */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              YÖK MÜFREDAT UYUMLU DANIŞMANLIK & HIZLI MEZUNİYET
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] text-white">
                Diplomanı Geciktirme, <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200">
                  Mezuniyetini Geciktirme!
                </span>
              </h1>
              <p className="text-xl sm:text-2xl font-black text-teal-300 tracking-tight pt-1">
                Hemen Mezun Ol, Hemen Diplomanı Al, İş Hayatına Atıl!
              </p>
            </div>

            <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
              Üniversite kaydınız, eksik AKTS kredileriniz, alttan kalan dersleriniz ve pasif harç borçlarınız kariyerinizi durdurmasın. Akademik danışmanlarımızla transkriptinizi anında simüle edin; hızlandırılmış yaz okulu planlaması ile diplomanızı ve öğrenci kimliğinizi erkenden teslim alın.
            </p>

            {/* Hızlı Avantaj Maddeleri */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Öğrenci No Sormadan Anında İntibak</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200 font-medium">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Harç & Burs Borcu Yapılandırması</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200 font-medium">
                <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Resmi Diploma & Kimlik Kartı (PDF)</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-4">
              {currentStudent ? (
                <button
                  onClick={() => setCurrentView('obs')}
                  className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-xl flex items-center gap-2 transition-transform hover:scale-[1.02] cursor-pointer"
                >
                  <GraduationCap className="w-5 h-5 text-slate-950" />
                  OBS Panelime Git ({currentStudent.firstName} {currentStudent.lastName})
                </button>
              ) : (
                <>
                  <button
                    onClick={onOpenRegister}
                    className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-xl flex items-center gap-2 transition-transform hover:scale-[1.02] cursor-pointer"
                  >
                    <GraduationCap className="w-5 h-5 text-slate-950" />
                    Hemen Kayıt Ol & Mezuniyet Planını Başlat
                  </button>
                  <button
                    onClick={onOpenLogin}
                    className="px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-sm font-bold transition-all cursor-pointer"
                  >
                    OBS Öğrenci Girişi
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Sağ Kolon: Hızlı İntibak & Erken Mezuniyet Başlatıcı Kartı */}
          <div className="lg:col-span-5">
            <div className="bg-slate-900/90 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-md space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-white">Hızlı İntibak & Mezuniyet Başlatıcı</h3>
                    <p className="text-[11px] text-slate-400">Öğrenci no gerekmez • Otomatik ders ataması</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black border border-emerald-500/30">
                  AKTİF
                </span>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Kayıtlı Olduğunuz Üniversite</label>
                  <select
                    value={selectedUni}
                    onChange={(e) => setSelectedUni(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    {INITIAL_UNIVERSITIES.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Bölüm / Lisans & Ön Lisans</label>
                  <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Mevcut Seviyeniz</label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="1. Sınıf">1. Sınıf (Yeni Başlayan)</option>
                    <option value="2. Sınıf">2. Sınıf</option>
                    <option value="3. Sınıf">3. Sınıf (Mezuniyete Yakın)</option>
                    <option value="4. Sınıf">4. Sınıf (Son Dönem / Mezun Adayı)</option>
                  </select>
                </div>

                {/* Dinamik Tahmini Özet */}
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Müfredat Toplamı:</span>
                    <strong className="text-white font-mono">{currentDeptObj.totalAkts} AKTS ({currentDeptObj.totalSemesters} Dönem)</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Hızlandırılmış Erken Mezuniyet:</span>
                    <strong className="text-amber-400 font-bold">2026 Yaz Okulu ile Mümkün</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Dönem Başı Harç Standardı:</span>
                    <strong className="text-teal-400 font-mono">{currentDeptObj.termFee.toLocaleString('tr-TR')} ₺</strong>
                  </div>
                </div>

                <button
                  onClick={onOpenRegister}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer text-sm"
                >
                  <span>Transkriptimi Oluştur & İntibakı Başlat</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                <span>YÖK Af Kanunları ve Üniversite Senato Kararlarına Uygun</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ERKEN MEZUNİYET & DİPLOMA SÜRECİ (4 ADIM) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-black uppercase tracking-wider border border-amber-200">
            Kariyerini Bekletme
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            4 Adımda Hızlı Mezuniyet & Resmi Diploma
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Sistemimiz kayıt anında eksik derslerinizi, alttan kalanları ve harç borçlarınızı hesaplar, danışmanınızla birlikte en kısa sürede diplomanıza ulaşmanızı sağlar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Adım 1 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative space-y-3 hover:border-amber-400 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 font-black flex items-center justify-center text-base">
              1
            </div>
            <h4 className="font-bold text-slate-900 text-base">Üniversite & Bölüm İntibakı</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Öğrenci numarası aramadan sadece üniversitenizi ve bölümünüzü seçin. Transkriptiniz, geçer ve sınırda notlarınız anında oluşturulur.
            </p>
            <div className="pt-2 text-[11px] text-amber-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Anında AKTS Taraması
            </div>
          </div>

          {/* Adım 2 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative space-y-3 hover:border-amber-400 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 font-black flex items-center justify-center text-base">
              2
            </div>
            <h4 className="font-bold text-slate-900 text-base">Danışman & Not Simülasyonu</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Kaldığınız dersler için vize-final barajlarını simüle edin, danışmanınızın belirlediği hızlandırılmış yaz okulu planıyla eksikleri tamamlayın.
            </p>
            <div className="pt-2 text-[11px] text-teal-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Yaz Okulu 2026 Planı
            </div>
          </div>

          {/* Adım 3 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative space-y-3 hover:border-amber-400 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-800 font-black flex items-center justify-center text-base">
              3
            </div>
            <h4 className="font-bold text-slate-900 text-base">Harç & Kredi Borcu Çözümü</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Geciken dönem harçları, eksik ders kredileri ve burs borçları net olarak dökülür. Resmi IBAN üzerinden danışmanlık kapsamında kapatılır.
            </p>
            <div className="pt-2 text-[11px] text-indigo-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Güvenli IBAN & Dekont Yükleme
            </div>
          </div>

          {/* Adım 4 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative space-y-3 hover:border-amber-400 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 font-black flex items-center justify-center text-base">
              4
            </div>
            <h4 className="font-bold text-slate-900 text-base">Resmi Diploma & Kimlik Kartı</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Mezuniyet şartlarını sağlayarak rektörlük onaylı resmi mezuniyet belgesi ve öğrenci kimlik kartınızı PDF olarak anında indirin, işe başlayın!
            </p>
            <div className="pt-2 text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> PDF İndir & İş Hayatına Atıl
            </div>
          </div>
        </div>
      </section>

      {/* 3. MEZUNİYET MOTİVASYON VE HESAPLAMA ARAÇLARI ÇUBUĞU */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 rounded-3xl p-8 sm:p-10 text-slate-950 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="px-3 py-1 rounded-full bg-slate-950 text-amber-300 text-xs font-black uppercase tracking-wider inline-flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Mezuniyet Hesaplayıcıları
            </span>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
              Kaç Kredin Eksik? Ne Zaman Mezun Olabilirsin?
            </h3>
            <p className="text-slate-900 text-sm font-medium leading-relaxed">
              Harç borcu dökümü, kredi burs yapılandırması, geçme notu ve af simülatörlerimiz ile mezuniyet tarihinizi netleştirin.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setCurrentView('calculators')}
              className="px-6 py-3.5 bg-slate-950 hover:bg-slate-900 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg flex items-center gap-2 transition-transform hover:scale-105 cursor-pointer"
            >
              <Calculator className="w-4 h-4 text-amber-400" />
              Hesaplama Araçlarına Git
            </button>
            <button
              onClick={onOpenRegister}
              className="px-6 py-3.5 bg-white hover:bg-slate-100 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md transition-transform hover:scale-105 cursor-pointer"
            >
              Kayıt Ol & Planı Al
            </button>
          </div>
        </div>
      </section>

      {/* 4. AKADEMİK BAŞDANIŞMANLAR & HUKUKİ HEYET */}
      <section id="danismanlar" className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-black uppercase tracking-wider border border-teal-200">
            Uzman Akademik Heyet
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Erken Mezuniyet & İntibak Danışmanlarımız
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Ders intibakı, YÖK af mevzuatı, harç yapılandırması ve hızlandırılmış sınav stratejilerinde yanınızda olan akademik danışman kadromuz.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CONSULTANTS_AND_STAFF.map((staff, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center gap-4">
                <img
                  src={staff.avatar}
                  alt={staff.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500 shadow-xs group-hover:scale-105 transition-transform"
                />
                <div>
                  <h4 className="font-bold text-slate-900 text-base">{staff.name}</h4>
                  <div className="text-xs text-amber-600 font-bold mt-0.5">{staff.role}</div>
                  <div className="text-[11px] text-slate-500">{staff.title}</div>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {staff.bio}
              </p>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5" /> Danışmanlık Randevusu Açık
                </span>
                <button
                  onClick={onOpenRegister}
                  className="text-amber-600 hover:text-amber-700 font-bold hover:underline"
                >
                  Danışman Talep Et →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. DERS BAZLI SKORBOARD (CANLI BAŞARI LİSTESİ) */}
      <section id="skorboard" className="bg-slate-100 py-16 px-4">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-black uppercase tracking-wider border border-amber-200 inline-flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-amber-600" /> Sınav Başarı Sıralaması
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Ders Bazlı Skorboard (Liderler Tablosu)
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Öğrencilerimizin online sınav puanları ve başarı yüzdeleri. Kişisel veriler KVKK ilkeleri uyarınca maskelenerek gösterilir.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {scoreboard.map((sb) => (
              <div
                key={sb.courseId}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative flex flex-col justify-between space-y-4 hover:border-amber-400 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{sb.category}</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px]">
                    #1 Lider
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{sb.courseTitle}</h4>
                  <div className="flex items-center gap-3 mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                    <div className="w-10 h-10 rounded-full bg-slate-900 text-amber-400 font-bold flex items-center justify-center text-sm font-mono shrink-0">
                      {sb.maskedName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{sb.maskedName}</div>
                      <div className="text-[11px] text-slate-500 font-medium">{sb.examCount} Sınav Tamamlandı</div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Toplam Puan</span>
                    <div className="text-lg font-black font-mono text-teal-600">{sb.totalPoints}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Başarı Oranı</span>
                    <div className="text-lg font-black font-mono text-emerald-600">%{sb.successRate}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. İLETİŞİM & DANIŞMANLIK FORMU */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5 space-y-6">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-black uppercase tracking-wider border border-amber-500/30">
              7/24 Öğrenci Danışmanlık
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              Mezuniyet Yol Haritanız İçin Bize Ulaşın
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Transkript intibakı, af başvurusu, harç yapılandırma ve yaz okulu ders kayıtlarında akademik rehberlerimiz size özel çalışma hazırlar.
            </p>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-bold text-white text-sm">{contactSettings.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-teal-400 shrink-0" />
                <span>{contactSettings.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
                <span>{contactSettings.address}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{contactSettings.workingHours}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-slate-950 p-6 sm:p-8 rounded-2xl border border-slate-800">
            <h4 className="font-bold text-base text-white mb-4">Ücretsiz Mezuniyet & Af Danışmanlığı Talebi</h4>
            {contactSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Talebiniz başarıyla iletildi! Danışmanımız en kısa sürede telefonla irtibata geçecektir.</span>
              </div>
            )}

            <form onSubmit={handleContactSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Adınız Soyadınız *</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Ad Soyad"
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Telefon Numaranız *</label>
                  <input
                    type="tel"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="0541 914 12 48"
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">E-Posta Adresiniz</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="ornek@ogrenci.edu.tr"
                  className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Durumunuz / Sorunuz</label>
                <textarea
                  rows={3}
                  required
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="Örn: 3. sınıftayım, 4 alttan dersim var. Yaz okuluyla 2026'da diplomamı alabilir miyim?"
                  className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-amber-500 focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-colors text-sm"
              >
                <Send className="w-4 h-4" />
                <span>Danışman Talebini Gönder</span>
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};
