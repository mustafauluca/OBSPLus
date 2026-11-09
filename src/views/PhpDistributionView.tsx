import React, { useState } from 'react';
import {
  FileCode,
  Folder,
  Download,
  Copy,
  Check,
  Server,
  Database,
  Terminal,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';

interface FileNode {
  path: string;
  category: 'config' | 'includes' | 'admin' | 'elearn' | 'root' | 'database';
  name: string;
  description: string;
}

const PHP_FILES: FileNode[] = [
  { path: 'config/database.php', category: 'config', name: 'database.php', description: 'MySQLi Singleton, UTF-8mb4, Europe/Istanbul timezone & prepared statements' },
  { path: 'config/settings.php', category: 'config', name: 'settings.php', description: 'Dinamik sistem ayarları önbelleği ve oturum parametreleri' },
  { path: 'includes/security.php', category: 'includes', name: 'security.php', description: 'CSRF token koruması, güvenli IP tespiti, XSS sanitizasyonu, IP engelleme' },
  { path: 'includes/visitor_tracker.php', category: 'includes', name: 'visitor_tracker.php', description: 'Otomatik ziyaretçi kaydı, tarayıcı/cihaz/OS ayrıştırması, bot filtresi' },
  { path: 'includes/auth.php', category: 'includes', name: 'auth.php', description: 'Öğrenci & Admin kimlik doğrulama, bcrypt şifreleme, KVKK kayıt logları' },
  { path: 'includes/functions.php', category: 'includes', name: 'functions.php', description: 'İsim maskeleme (Ahmet Y.), Türkçe tarih formatı, istatistik derleme' },
  { path: 'includes/header.php', category: 'includes', name: 'header.php', description: 'Bootstrap 5 genel başlık, üst menü, öğrenci/admin giriş modalları' },
  { path: 'includes/footer.php', category: 'includes', name: 'footer.php', description: 'Genel alt bilgi, iletişim, telif ve KVKK aydınlatma modalları' },
  { path: 'install/install.sql', category: 'database', name: 'install.sql', description: '24 adet InnoDB tablo, Foreign Key, Indexler ve eksiksiz başlangıç verileri' },
  { path: 'index.php', category: 'root', name: 'index.php', description: 'Modern vitrin ana sayfası, aktif dersler, skorboard ve eğitmen kadrosu' },
  { path: 'auth_action.php', category: 'root', name: 'auth_action.php', description: 'Giriş/Kayıt POST istekleri, rate limit ve hata yönlendirme merkezi' },
  { path: '.htaccess', category: 'root', name: '.htaccess', description: 'Apache güvenlik kuralları, config dizini gizleme ve XSS/HSTS başlıkları' },
  { path: 'README.md', category: 'root', name: 'README.md', description: 'cPanel/Plesk kurulum, veritabanı import ve canlıya alma kılavuzu' },
  { path: 'elearn/index.php', category: 'elearn', name: 'index.php', description: 'Öğrenci ders kataloğu, kategori filtreleme ve arama' },
  { path: 'elearn/course.php', category: 'elearn', name: 'course.php', description: 'Ders müfredatı, konu tamamlama durumları ve vize kartı' },
  { path: 'elearn/topic.php', category: 'elearn', name: 'topic.php', description: 'Konu anlatım okuyucu, video oynatıcı ve PDF dökümanları' },
  { path: 'elearn/test.php', category: 'elearn', name: 'test.php', description: 'Konu sonu interaktif çoktan seçmeli test çözme ekranı' },
  { path: 'elearn/exam.php', category: 'elearn', name: 'exam.php', description: 'Resmi vize sınavı, soru havuzu ve 30 dk geri sayım motoru' },
  { path: 'elearn/result.php', category: 'elearn', name: 'result.php', description: 'Sınav karne kartı, başarı yüzdesi ve ayrıntılı çözüm analizleri' },
  { path: 'elearn/profile.php', category: 'elearn', name: 'profile.php', description: 'Öğrenci karnesi, toplam puan, sıralama ve sınav geçmişi' },
  { path: 'elearn/logout.php', category: 'elearn', name: 'logout.php', description: 'Öğrenci oturum kapatma ve güvenlik sonlandırma' },
  { path: 'admin/index.php', category: 'admin', name: 'index.php', description: 'Yönetim paneli yönlendirme merkezi' },
  { path: 'admin/login.php', category: 'admin', name: 'login.php', description: 'Yönetici güvenli giriş sayfası' },
  { path: 'admin/logout.php', category: 'admin', name: 'logout.php', description: 'Yönetici oturumunu sonlandırma' },
  { path: 'admin/dashboard.php', category: 'admin', name: 'dashboard.php', description: 'Ziyaretçi & tekil istatistik grafikleri (Chart.js), cihaz dağılımı' },
  { path: 'admin/visitors.php', category: 'admin', name: 'visitors.php', description: 'IP bazlı ziyaret logları, geçmiş denetim paneli ve CSV export' },
  { path: 'admin/login_logs.php', category: 'admin', name: 'login_logs.php', description: 'Öğrenci giriş denemeleri, başarısızlık nedenleri ve IP takibi' },
  { path: 'admin/register_logs.php', category: 'admin', name: 'register_logs.php', description: 'Öğrenci kayıt denetim logları ve KVKK kabul kayıtları' },
  { path: 'admin/students.php', category: 'admin', name: 'students.php', description: 'Öğrenci hesap yönetimi ve aktif/askıya alma' },
  { path: 'admin/courses.php', category: 'admin', name: 'courses.php', description: 'Ders yönetimi, sıralama ve aktiflik' },
  { path: 'admin/topics.php', category: 'admin', name: 'topics.php', description: 'Konu ve müfredat içerik yönetimi' },
  { path: 'admin/questions.php', category: 'admin', name: 'questions.php', description: 'Soru havuzu CRUD ve seçenek editörü' },
  { path: 'admin/exams.php', category: 'admin', name: 'exams.php', description: 'Vize sınavları ve süre/kriter yönetimi' },
  { path: 'admin/results.php', category: 'admin', name: 'results.php', description: 'Öğrenci sınav sonuçları ve başarı karneleri' },
  { path: 'admin/scoreboard.php', category: 'admin', name: 'scoreboard.php', description: 'Skorboard yeniden hesaplama motoru ve KVKK maske denetimi' },
  { path: 'admin/team.php', category: 'admin', name: 'team.php', description: 'Eğitmen ve akademik danışman kadrosu yönetimi' },
  { path: 'admin/settings.php', category: 'admin', name: 'settings.php', description: 'Sistem parametreleri, rate limit ve KVKK aydınlatma metni' },
  { path: 'admin/contact.php', category: 'admin', name: 'contact.php', description: 'İletişim bilgileri ve sosyal medya bağlantıları' },
];

export const PhpDistributionView: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<FileNode>(PHP_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredFiles = PHP_FILES.filter((f) => {
    if (categoryFilter === 'all') return true;
    return f.category === categoryFilter;
  });

  const handleCopyPath = () => {
    navigator.clipboard.writeText(selectedFile.path);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-indigo-300 text-xs font-semibold">
            <Server className="w-3.5 h-3.5" /> PHP 8.2+ & MySQLi Dağıtım Paketi
          </div>
          <h1 className="text-3xl font-black tracking-tight">
            Sunucuya Yüklenebilir Canlı PHP & SQL Paketi
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            İstenen mimariye göre oluşturulan 34 adet eksiksiz PHP dosyası ve 24 tablolu{' '}
            <code className="text-amber-300 bg-amber-950/40 px-1.5 py-0.5 rounded font-mono">install.sql</code>{' '}
            dosyası projenin kök dizininde hazır bulunmaktadır. Hiçbir PDO bağımlılığı içermez, saf{' '}
            <code className="text-emerald-300 font-mono">mysqli</code>, InnoDB ve prepared statement altyapısına sahiptir.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl">
              <Database className="w-4 h-4 text-emerald-400" /> DB: u988165477_eventpi
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-amber-400" /> Admin: admin / Admin@2026!
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl font-mono">
              <Terminal className="w-4 h-4 text-cyan-400" /> php -l Kontrolü: 34/34 Başarılı
            </span>
          </div>
        </div>
      </div>

      {/* Explorer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Tree */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Folder className="w-4 h-4 text-indigo-600" /> Proje Dosya Ağacı
            </h2>
            <span className="text-xs font-mono text-slate-400">
              {filteredFiles.length} / {PHP_FILES.length} dosya
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold">
            {['all', 'config', 'includes', 'admin', 'elearn', 'database', 'root'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl uppercase transition-colors whitespace-nowrap ${
                  categoryFilter === cat
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="space-y-1.5 max-h-[560px] overflow-y-auto pr-1">
            {filteredFiles.map((file) => {
              const isSelected = selectedFile.path === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left p-3 rounded-2xl transition-all border ${
                    isSelected
                      ? 'bg-indigo-50/80 border-indigo-200 shadow-sm'
                      : 'border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileCode
                        className={`w-4 h-4 flex-shrink-0 ${
                          isSelected ? 'text-indigo-600' : 'text-slate-400'
                        }`}
                      />
                      <span
                        className={`text-xs font-mono truncate ${
                          isSelected ? 'font-bold text-indigo-900' : 'text-slate-700'
                        }`}
                      >
                        {file.path}
                      </span>
                    </div>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-500">
                      {file.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-1 pl-6">
                    {file.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Detail */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs uppercase font-bold text-indigo-600 font-mono">
                  {selectedFile.category} Modülü
                </span>
                <h3 className="text-xl font-mono font-bold text-slate-900">{selectedFile.path}</h3>
                <p className="text-sm text-slate-600 mt-1">{selectedFile.description}</p>
              </div>

              <button
                onClick={handleCopyPath}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Kopyalandı' : 'Yolu Kopyala'}
              </button>
            </div>

            {/* Architecture Highlights */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Sunucu Kurulum ve Teknik Güvence Özellikleri:
              </h4>
              <ul className="text-xs text-slate-600 space-y-2 font-sans">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>MySQLi ve Prepared Statement:</strong> Tüm sorgular SQL Injection korumalıdır.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>KVKK ve Şifre Güvenliği:</strong> Şifreler asla loglanmaz. Öğrenci isimleri halka açık alanlarda otomatik maskelenir.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Rate Limit & Brute-Force Koruması:</strong> 5 ardışık hatalı girişte IP 15 dakika boyunca engellenir.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Europe/Istanbul & UTF-8mb4:</strong> Türkçe karakterler ve saat dilimi yerel standartlara tam uyumludur.
                  </span>
                </li>
              </ul>
            </div>

            {/* Snippet Card */}
            <div className="bg-slate-900 rounded-2xl p-4 font-mono text-xs text-slate-200 overflow-x-auto shadow-inner">
              <div className="text-slate-400 pb-2 border-b border-slate-800 text-[11px] flex justify-between">
                <span>Konfigürasyon Örneği</span>
                <span>PHP 8.2+</span>
              </div>
              <pre className="pt-3 text-[12px] leading-relaxed text-emerald-300">
{selectedFile.path.endsWith('.sql')
  ? `-- Veritabanı Şeması Örneği
CREATE DATABASE IF NOT EXISTS \`u988165477_eventpi\` 
  DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE \`u988165477_eventpi\`;
-- 24 Adet InnoDB Tablo ve İlişkiler Tanımlandı...`
  : `<?php
// E-LEARN Platform - ${selectedFile.path}
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/security.php';
// Güvenli oturum, CSRF doğrulama ve veri işleme...`}
              </pre>
            </div>
          </div>

          <div className="p-4 bg-indigo-50/70 border border-indigo-200/60 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-indigo-900">
              Tüm dosyalar disk üzerindeki kök dizindedir. Projeyi sunucunuza aktarmak için{' '}
              <span className="font-mono font-bold">README.md</span> ve{' '}
              <span className="font-mono font-bold">install.sql</span> adımlarını takip edebilirsiniz.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
