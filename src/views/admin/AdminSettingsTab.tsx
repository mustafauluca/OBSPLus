import React, { useState } from 'react';
import { useElearn } from '../../context/ElearnContext';
import { Save, ShieldAlert, CheckCircle, Database, Lock, Clock } from 'lucide-react';

export const AdminSettingsTab: React.FC = () => {
  const { siteSettings, updateSiteSettings } = useElearn();
  const [formData, setFormData] = useState({
    siteName: siteSettings.siteName || 'E-LEARN Platform',
    siteTitle: siteSettings.siteTitle || 'E-LEARN – Öğrenci Eğitim Platformu',
    siteDescription: siteSettings.siteDescription || 'Diplomanı Geciktirme, Mezuniyetini Geciktirme! Hemen Mezun Ol, Hemen Diplomanı Al, İş Hayatına Atıl!',
    heroHeadline: siteSettings.heroHeadline || 'Diplomanı Geciktirme, Mezuniyetini Geciktirme! Hemen Mezun Ol, Hemen Diplomanı Al, İş Hayatına Atıl!',
    aboutSummary: siteSettings.aboutSummary || 'Öğrenciler için geliştirilmiş erken mezuniyet ve OBS platformu',
    footerText: siteSettings.footerText || '© 2026 OBS TR – Hızlı Mezuniyet & Danışmanlık Portalı. Tüm hakları saklıdır.',
    kvkkText: siteSettings.kvkkText || '6698 sayılı Kişisel Verilerin Korunması Kanunu uyarınca...',
    rateLimitMaxAttempts: siteSettings.rateLimitMaxAttempts || 5,
    rateLimitBlockMinutes: siteSettings.rateLimitBlockMinutes || 15,
    dataRetentionDays: siteSettings.dataRetentionDays || 90,
    bankName: siteSettings.bankName || 'T.C. Ziraat Bankası A.Ş.',
    iban: siteSettings.iban || 'TR32 0001 0002 0003 0004 0005 06',
    accountHolder: siteSettings.accountHolder || 'DiplomaTR Üniversite Akademik Koçluk ve Danışmanlık Hizmetleri A.Ş.',
    paymentInstructions: siteSettings.paymentInstructions || 'Ödeme açıklamasına Öğrenci Numaranızı ve Ad Soyadınızı mutlaka yazınız.',
  });

  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSiteSettings(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Sistem, Banka / IBAN ve Güvenlik Ayarları</h2>
          <p className="text-sm text-slate-500">
            Öğrenci ödeme ekranında gösterilen resmi Banka IBAN bilgileri, slogan ve KVKK parametreleri
          </p>
        </div>
        {saved && (
          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
            <CheckCircle className="w-4 h-4" /> Ayarlar Kaydedildi!
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* BANKA & IBAN BİLGİLERİ */}
        <div className="bg-white p-6 rounded-2xl border-2 border-amber-500/40 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            Resmi Üniversite / Danışmanlık Banka & IBAN Tanımları (Öğrenci Ödeme Ekranı)
          </h3>
          <p className="text-xs text-slate-500">
            Bu bilgiler OBS panelinde "Hızlandırılmış Erken Mezuniyet & Bekleyen Ödeme" sekmesinde öğrencilere doğrudan sunulur.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Banka Adı</label>
              <input
                type="text"
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                placeholder="Örn: T.C. Ziraat Bankası A.Ş."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Hesap Sahibi / Alıcı Ünvanı</label>
              <input
                type="text"
                value={formData.accountHolder}
                onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
                placeholder="Örn: DiplomaTR Üniversite Akademik Koçluk A.Ş."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">IBAN Numarası (TR ile başlayan 26 karakter)</label>
            <input
              type="text"
              value={formData.iban}
              onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
              placeholder="TR00 0000 0000 0000 0000 0000 00"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-mono font-bold text-slate-900 focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Ödeme Talimatı & Havale Notu</label>
            <textarea
              rows={2}
              value={formData.paymentInstructions}
              onChange={(e) => setFormData({ ...formData, paymentInstructions: e.target.value })}
              placeholder="Havale/EFT açıklama alanına Öğrenci No ve Ad Soyad yazılmalıdır..."
              className="w-full px-4 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* GENEL PLATFORM & SLOGAN */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
            <Database className="w-4 h-4 text-teal-600" /> Platform & Mezuniyet Sloganı
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Ana Slogan & Hero Başlığı</label>
            <input
              type="text"
              value={formData.heroHeadline}
              onChange={(e) => setFormData({ ...formData, heroHeadline: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-amber-700 focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Site Başlığı</label>
            <input
              type="text"
              value={formData.siteTitle}
              onChange={(e) => setFormData({ ...formData, siteTitle: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Site Açıklaması (Meta Description)</label>
            <textarea
              rows={2}
              value={formData.siteDescription}
              onChange={(e) => setFormData({ ...formData, siteDescription: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-500" /> Güvenlik, Rate Limit & KVKK Saklama Politikası
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Maksimum Hatalı Giriş Sayısı (Rate Limit)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="number"
                  min="3"
                  max="20"
                  value={formData.rateLimitMaxAttempts}
                  onChange={(e) => setFormData({ ...formData, rateLimitMaxAttempts: Number(e.target.value) })}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Bu sayı aşıldığında IP geçici olarak engellenir.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                IP Engelleme Süresi (Dakika)
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="number"
                  min="5"
                  max="1440"
                  value={formData.rateLimitBlockMinutes}
                  onChange={(e) => setFormData({ ...formData, rateLimitBlockMinutes: Number(e.target.value) })}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Engellenen IP'nin bekleme süresi.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Log Saklama Süresi (Gün - KVKK Politikası)
              </label>
              <div className="relative">
                <Database className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="number"
                  min="30"
                  max="365"
                  value={formData.dataRetentionDays}
                  onChange={(e) => setFormData({ ...formData, dataRetentionDays: Number(e.target.value) })}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Bu süreden eski loglar otomatik temizlenir.</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              KVKK Aydınlatma Metni (Öğrenci Kayıt Formunda Gösterilir)
            </label>
            <textarea
              rows={6}
              value={formData.kvkkText}
              onChange={(e) => setFormData({ ...formData, kvkkText: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 font-sans"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-md cursor-pointer"
          >
            <Save className="w-4 h-4" /> Değişiklikleri Kaydet
          </button>
        </div>
      </form>
    </div>
  );
};
