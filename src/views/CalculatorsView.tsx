import React, { useState, useEffect } from 'react';
import { useElearn } from '../context/ElearnContext';
import {
  Calculator,
  DollarSign,
  GraduationCap,
  Award,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { scoreToLetter, formatTL } from '../utils/academicRules';

interface CalculatorsViewProps {
  setCurrentView: (view: string, params?: Record<string, any>) => void;
}

export const CalculatorsView: React.FC<CalculatorsViewProps> = ({ setCurrentView }) => {
  const { trackPageVisit, trackClick } = useElearn();
  const [activeTab, setActiveTab] = useState<'harc' | 'kredi' | 'not'>('harc');

  useEffect(() => {
    trackPageVisit('Akademik Hesaplama Araçları', '/calculators');
  }, [trackPageVisit]);

  // --- 1. HARÇ HESAPLAMA STATE ---
  const [facultyType, setFacultyType] = useState<'muhendislik' | 'iibf' | 'hukuk' | 'tip' | 'fen'>('muhendislik');
  const [educationType, setEducationType] = useState<'normal' | 'ikinci'>('normal');
  const [delayedTerms, setDelayedTerms] = useState<number>(1);
  const [extraAkts, setExtraAkts] = useState<number>(0);

  const baseFacultyFees = {
    muhendislik: 3750,
    iibf: 3200,
    hukuk: 4100,
    tip: 6500,
    fen: 3100,
  };

  const calculateHarc = () => {
    let base = baseFacultyFees[facultyType];
    if (educationType === 'ikinci') {
      base = base * 2.5; // İkinci öğretim katsayısı
    }
    // Uzatma dönemlerinde harç cezası (%50 artırımlı)
    const delayMultiplier = delayedTerms > 0 ? delayedTerms * 1.5 : 1;
    const termTuition = base * delayMultiplier;
    const aktsFee = extraAkts * 270;
    const total = termTuition + aktsFee;
    return { base, delayMultiplier, termTuition, aktsFee, total };
  };

  const harcResult = calculateHarc();

  // --- 2. KREDİ & BURS HESAPLAMA STATE ---
  const [scholarshipType, setScholarshipType] = useState<'kyk_kredi' | 'vakif_burs' | 'basari_burs'>('kyk_kredi');
  const [monthlyAmount, setMonthlyAmount] = useState<number>(2000);
  const [totalMonths, setTotalMonths] = useState<number>(48); // 4 yıl
  const [installmentMonths, setInstallmentMonths] = useState<number>(24); // 2 yıl geri ödeme
  const [includeScholarshipRepay, setIncludeScholarshipRepay] = useState<boolean>(true);

  const calculateKredi = () => {
    const principal = monthlyAmount * totalMonths;
    // Yurt İçi ÜFE / TÜFE endeks farkı yaklaşık %30 yasal katsayı
    const interest = principal * 0.35;
    const scholarshipObligation = includeScholarshipRepay ? 10000 : 0;
    const grandTotal = principal + interest + scholarshipObligation;
    const monthlyInstallment = grandTotal / installmentMonths;
    return { principal, interest, scholarshipObligation, grandTotal, monthlyInstallment };
  };

  const krediResult = calculateKredi();

  // --- 3. GEÇER NOT & ÇAN EĞRİSİ STATE ---
  const [vizeScore, setVizeScore] = useState<number>(65);
  const [vizeWeight, setVizeWeight] = useState<number>(40);
  const [finalScore, setFinalScore] = useState<number>(70);
  const [finalWeight, setFinalWeight] = useState<number>(60);
  const [homeworkScore, setHomeworkScore] = useState<number>(0);
  const [homeworkWeight, setHomeworkWeight] = useState<number>(0);
  const [classAverage, setClassAverage] = useState<number>(55);
  const [classStdDev, setClassStdDev] = useState<number>(15);

  const calculateGrade = () => {
    const rawAverage = (vizeScore * vizeWeight + finalScore * finalWeight + homeworkScore * homeworkWeight) / 100;
    const { letterGrade, gradePoint, passed } = scoreToLetter(vizeScore, finalScore);

    // Çan eğrisi T-skoru simülasyonu
    const zScore = (rawAverage - classAverage) / (classStdDev || 1);
    const tScore = Math.round(50 + 10 * zScore);

    let canLetterGrade = 'CC';
    if (tScore >= 70) canLetterGrade = 'AA';
    else if (tScore >= 65) canLetterGrade = 'BA';
    else if (tScore >= 60) canLetterGrade = 'BB';
    else if (tScore >= 55) canLetterGrade = 'CB';
    else if (tScore >= 45) canLetterGrade = 'CC';
    else if (tScore >= 40) canLetterGrade = 'DC';
    else if (tScore >= 35) canLetterGrade = 'DD';
    else if (tScore >= 30) canLetterGrade = 'FD';
    else canLetterGrade = 'FF';

    return { rawAverage, letterGrade, gradePoint, passed, tScore, canLetterGrade };
  };

  const gradeResult = calculateGrade();

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-bold">
              <Calculator className="w-4 h-4 text-indigo-400" />
              YÖK & Üniversite Mevzuatı Simülatörü
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              Akademik <span className="text-indigo-400">Hesaplama Araçları</span> Portali
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Dönemlik üniversite katkı payı harcınızı, KYK öğrenim kredisi ve burs geri ödeme taksit planınızı,
              vize-final ağırlıklı ham notunuzu ve çan eğrisi bağıl değerlendirme harf notunuzu anında hesaplayın.
            </p>
          </div>
        </div>

        {/* Tab Seçicileri */}
        <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
          <button
            onClick={() => {
              setActiveTab('harc');
              trackClick('BUTTON', 'Harç Hesaplama Sekmesi', 'tab-harc');
            }}
            className={`flex-1 min-w-[200px] py-3 px-5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'harc'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            1. Harç & Katkı Payı Hesaplama
          </button>

          <button
            onClick={() => {
              setActiveTab('kredi');
              trackClick('BUTTON', 'Kredi Burs Hesaplama Sekmesi', 'tab-kredi');
            }}
            className={`flex-1 min-w-[200px] py-3 px-5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'kredi'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            2. Kredi & Burs Geri Ödeme Hesaplama
          </button>

          <button
            onClick={() => {
              setActiveTab('not');
              trackClick('BUTTON', 'Geçer Not ve Çan Eğrisi Sekmesi', 'tab-not');
            }}
            className={`flex-1 min-w-[200px] py-3 px-5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'not'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Award className="w-4 h-4" />
            3. Geçer Not & Çan Eğrisi Hesaplayıcı
          </button>
        </div>

        {/* 1. SEKME: HARÇ HESAPLAMA */}
        {activeTab === 'harc' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900">Dönemlik Öğrenim Harcı Parametreleri</h3>
                <p className="text-xs text-slate-500">Fakülte, eğitim türü ve aşım sürelerini girerek dönemlik harç maliyetinizi hesaplayın.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Fakülte / Alan Türü</label>
                  <select
                    value={facultyType}
                    onChange={(e: any) => setFacultyType(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium text-slate-800 bg-white"
                  >
                    <option value="muhendislik">Mühendislik & Mimarlık Fakültesi (Temel: 3.750 TL)</option>
                    <option value="iibf">İktisadi ve İdari Bilimler Fakültesi (Temel: 3.200 TL)</option>
                    <option value="hukuk">Hukuk Fakültesi (Temel: 4.100 TL)</option>
                    <option value="tip">Tıp & Sağlık Bilimleri Fakültesi (Temel: 6.500 TL)</option>
                    <option value="fen">Fen - Edebiyat Fakültesi (Temel: 3.100 TL)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Öğretim Türü</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setEducationType('normal')}
                      className={`p-3 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                        educationType === 'normal'
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      I. Öğretim (Normal)
                    </button>
                    <button
                      type="button"
                      onClick={() => setEducationType('ikinci')}
                      className={`p-3 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                        educationType === 'ikinci'
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      II. Öğretim (İkinci Öğretim)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Azami Süreyi Aşan Gecikme Yarıyılı: <strong className="text-indigo-600 font-mono font-bold">{delayedTerms} Yarıyıl</strong>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="8"
                    step="1"
                    value={delayedTerms}
                    onChange={(e) => setDelayedTerms(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-1">
                    <span>0 (Normal Süre)</span>
                    <span>2 Yarıyıl (1 Yıl)</span>
                    <span>4 Yarıyıl (2 Yıl)</span>
                    <span>8 Yarıyıl (4 Yıl)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Alttan Alınan Fazladan Kredi / AKTS: <strong className="text-indigo-600 font-mono font-bold">{extraAkts} AKTS</strong>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    step="1"
                    value={extraAkts}
                    onChange={(e) => setExtraAkts(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-1">
                    <span>0 AKTS</span>
                    <span>15 AKTS</span>
                    <span>30 AKTS</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sonuç Özeti */}
            <div className="lg:col-span-5 bg-gradient-to-b from-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col justify-between space-y-6">
              <div>
                <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Tahakkuk Hesaplama Raporu</span>
                <h3 className="text-xl font-black text-white mt-1">Ödenecek Katkı Payı & Harç</h3>

                <div className="mt-6 space-y-3 text-xs">
                  <div className="flex justify-between py-2 border-b border-indigo-900/60 text-slate-300">
                    <span>Temel Dönemlik Harç:</span>
                    <span className="font-mono font-bold text-white">{formatTL(harcResult.base)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-indigo-900/60 text-slate-300">
                    <span>Gecikme / Uzatma Çarpanı:</span>
                    <span className="font-mono font-bold text-amber-400">{harcResult.delayMultiplier.toFixed(1)}x Katsayı</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-indigo-900/60 text-slate-300">
                    <span>Dönem Harç Bedeli:</span>
                    <span className="font-mono font-bold text-white">{formatTL(harcResult.termTuition)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-indigo-900/60 text-slate-300">
                    <span>Ek AKTS Kredi Bedeli:</span>
                    <span className="font-mono font-bold text-white">{formatTL(harcResult.aktsFee)}</span>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t-2 border-indigo-500/40">
                  <span className="text-xs text-indigo-300 font-semibold">Toplam Tahakkuk Eden Harç Tutarı</span>
                  <div className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono mt-1">
                    {formatTL(harcResult.total)}
                  </div>
                </div>
              </div>

              <div className="bg-indigo-900/40 p-4 rounded-2xl border border-indigo-800/60 text-[11px] text-indigo-200 space-y-1">
                <span className="font-bold flex items-center gap-1.5 text-white">
                  <HelpCircle className="w-3.5 h-3.5 text-indigo-400" /> Bilgilendirme:
                </span>
                <p>2547 Sayılı Kanun Madde 46 uyarınca program süresi aşımında harçlar %50 artırımlı uygulanır.</p>
              </div>
            </div>
          </div>
        )}

        {/* 2. SEKME: KREDİ & BURS HESAPLAMA */}
        {activeTab === 'kredi' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900">KYK Kredi & Burs Geri Ödeme Parametreleri</h3>
                <p className="text-xs text-slate-500">Alınan toplam burs/kredi süresi ve taksit seçeneklerine göre geri ödeme simülasyonu.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Öğrenim Desteği Türü</label>
                  <select
                    value={scholarshipType}
                    onChange={(e: any) => setScholarshipType(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium text-slate-800 bg-white"
                  >
                    <option value="kyk_kredi">KYK Öğrenim Kredisi (Geri Ödemeli)</option>
                    <option value="vakif_burs">Üniversite / Kurum Başarı Bursu (Şarta Bağlı Geri Alım)</option>
                    <option value="basari_burs">Yüksek Onur Bursu (10.000 TL Tahsisli)</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Aylık Alınan Tutar (TL)</label>
                    <input
                      type="number"
                      value={monthlyAmount}
                      onChange={(e) => setMonthlyAmount(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 font-mono font-bold text-sm text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Toplam Alınan Ay Sayısı</label>
                    <input
                      type="number"
                      value={totalMonths}
                      onChange={(e) => setTotalMonths(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 font-mono font-bold text-sm text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Geri Ödeme Taksit Süresi (Ay)</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[12, 24, 36].map((months) => (
                      <button
                        key={months}
                        type="button"
                        onClick={() => setInstallmentMonths(months)}
                        className={`py-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                          installmentMonths === months
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {months} Ay Taksit
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeScholarshipRepay}
                      onChange={(e) => setIncludeScholarshipRepay(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-bold text-slate-800">
                      10.000,00 TL Öğrenim Bursu Borcu Ekstra Tahakkuku Dahil Edilsin
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Kredi Sonuç Özeti */}
            <div className="lg:col-span-5 bg-gradient-to-b from-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col justify-between space-y-6">
              <div>
                <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Geri Ödeme Planı</span>
                <h3 className="text-xl font-black text-white mt-1">Borç ve Taksit Çizelgesi</h3>

                <div className="mt-6 space-y-3 text-xs">
                  <div className="flex justify-between py-2 border-b border-indigo-900/60 text-slate-300">
                    <span>Toplam Alınan Anapara:</span>
                    <span className="font-mono font-bold text-white">{formatTL(krediResult.principal)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-indigo-900/60 text-slate-300">
                    <span>Yurt İçi ÜFE Endeks Farkı:</span>
                    <span className="font-mono font-bold text-amber-400">{formatTL(krediResult.interest)}</span>
                  </div>
                  {includeScholarshipRepay && (
                    <div className="flex justify-between py-2 border-b border-indigo-900/60 text-slate-300">
                      <span>Burs İade Borcu:</span>
                      <span className="font-mono font-bold text-rose-400">{formatTL(krediResult.scholarshipObligation)}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 border-b border-indigo-900/60 text-slate-300">
                    <span>Toplam Geri Ödenecek:</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm">{formatTL(krediResult.grandTotal)}</span>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t-2 border-indigo-500/40">
                  <span className="text-xs text-indigo-300 font-semibold">Aylık Sabit Taksit Tutarı ({installmentMonths} Ay)</span>
                  <div className="text-3xl sm:text-4xl font-black text-teal-400 font-mono mt-1">
                    {formatTL(krediResult.monthlyInstallment)} / ay
                  </div>
                </div>
              </div>

              <div className="bg-indigo-900/40 p-4 rounded-2xl border border-indigo-800/60 text-[11px] text-indigo-200">
                Mezuniyet tarihinden itibaren 2 yıl sonra başlayan taksit ödemeleri Ziraat Bankası veya vergi dairelerine yapılabilmektedir.
              </div>
            </div>
          </div>
        )}

        {/* 3. SEKME: GEÇER NOT & ÇAN EĞRİSİ */}
        {activeTab === 'not' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900">Vize / Final ve Sınıf İstatistikleri</h3>
                <p className="text-xs text-slate-500">Notlarınızı ve ağırlık yüzdelerini girerek mutlak ve bağıl değerlendirme sonucunu görün.</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Vize Notu (0 - 100)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={vizeScore}
                      onChange={(e) => setVizeScore(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 font-mono font-bold text-sm text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Vize Ağırlığı (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={vizeWeight}
                      onChange={(e) => setVizeWeight(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 font-mono font-bold text-sm text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Final / Büt Notu (0 - 100)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={finalScore}
                      onChange={(e) => setFinalScore(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 font-mono font-bold text-sm text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Final Ağırlığı (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={finalWeight}
                      onChange={(e) => setFinalWeight(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 font-mono font-bold text-sm text-slate-900"
                    />
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <span className="text-xs font-bold text-slate-800 block">Çan Eğrisi (Bağıl Değerlendirme) Parametreleri</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Sınıf Ham Başarı Ortalaması (HBN)</label>
                      <input
                        type="number"
                        min="10"
                        max="90"
                        value={classAverage}
                        onChange={(e) => setClassAverage(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs text-slate-900 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Standart Sapma</label>
                      <input
                        type="number"
                        min="5"
                        max="30"
                        value={classStdDev}
                        onChange={(e) => setClassStdDev(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs text-slate-900 bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Not Sonuç Özeti */}
            <div className="lg:col-span-5 bg-gradient-to-b from-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col justify-between space-y-6">
              <div>
                <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Değerlendirme Sonucu</span>
                <h3 className="text-xl font-black text-white mt-1">Harf Notu & Durum Analizi</h3>

                <div className="mt-6 space-y-3 text-xs">
                  <div className="flex justify-between py-2 border-b border-indigo-900/60 text-slate-300">
                    <span>Ağırlıklı Ham Not Ortalaması:</span>
                    <span className="font-mono font-bold text-white">{gradeResult.rawAverage.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-indigo-900/60 text-slate-300">
                    <span>Mutlak Sistem Harf Notu:</span>
                    <span className="font-mono font-bold text-amber-400">{gradeResult.letterGrade} ({gradeResult.gradePoint.toFixed(2)})</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-indigo-900/60 text-slate-300">
                    <span>Bağıl Sistem T-Skoru:</span>
                    <span className="font-mono font-bold text-teal-300">{gradeResult.tScore} Puan</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-indigo-900/60 text-slate-300">
                    <span>Çan Eğrisi Harf Notu:</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm">{gradeResult.canLetterGrade}</span>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t-2 border-indigo-500/40">
                  <span className="text-xs text-indigo-300 font-semibold">Genel Başarı Durumu</span>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`px-4 py-2 rounded-xl font-black text-sm ${
                      gradeResult.passed
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-rose-500 text-white'
                    }`}>
                      {gradeResult.passed ? 'BAŞARILI (GEÇTİ)' : 'BAŞARISIZ (KALDI)'}
                    </span>
                    <span className="text-xs text-slate-300">
                      {gradeResult.passed ? 'Kredi ve AKTS kazanıldı.' : 'Bütünleme veya ders tekrarı gerekir.'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-indigo-900/40 p-4 rounded-2xl border border-indigo-800/60 text-[11px] text-indigo-200">
                Final baraj notu (genellikle 50) sağlanmadığında öğrenci ham ortalamaya bakılmaksızın doğrudan FF notu alır.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
