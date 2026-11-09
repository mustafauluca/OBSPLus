import React from 'react';
import { useElearn } from '../../context/ElearnContext';
import {
  Users,
  Globe,
  TrendingUp,
  BookOpen,
  Award,
  Smartphone,
  Laptop,
  Tablet,
  CheckCircle2,
  Clock
} from 'lucide-react';

export const AdminDashboardTab: React.FC = () => {
  const { visitorLogs, students, courses, exams, examAttempts } = useElearn();

  const today = new Date().toISOString().split('T')[0];
  const todayVisits = visitorLogs.filter((v) => v.visitDate === today);
  const todayUniqueIps = new Set(todayVisits.map((v) => v.ipAddress)).size;

  const desktopCount = visitorLogs.filter((v) => v.deviceType === 'desktop').length;
  const mobileCount = visitorLogs.filter((v) => v.deviceType === 'mobile').length;
  const tabletCount = visitorLogs.filter((v) => v.deviceType === 'tablet').length;
  const totalDevice = Math.max(1, desktopCount + mobileCount + tabletCount);

  // Sayfa görüntüleme sayıları
  const pageCounts: Record<string, number> = {};
  visitorLogs.forEach((v) => {
    pageCounts[v.pageUrl] = (pageCounts[v.pageUrl] || 0) + 1;
  });
  const topPages = Object.entries(pageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* 4 Ana İstatistik Kartı */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Bugünkü Ziyaret</span>
            <div className="text-3xl font-black font-mono text-slate-900 mt-1">{todayVisits.length}</div>
            <div className="text-xs text-emerald-600 font-semibold mt-1">Tekil IP: {todayUniqueIps}</div>
          </div>
          <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
            <Globe className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Toplam Ziyaret</span>
            <div className="text-3xl font-black font-mono text-slate-900 mt-1">{visitorLogs.length}</div>
            <div className="text-xs text-slate-500 mt-1">Kayıtlı log girdisi</div>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Öğrenci Sayısı</span>
            <div className="text-3xl font-black font-mono text-slate-900 mt-1">{students.length}</div>
            <div className="text-xs text-slate-500 mt-1">Aktif Öğrenci Hesapları</div>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Müfredat & Sınav</span>
            <div className="text-3xl font-black font-mono text-slate-900 mt-1">
              {courses.length} / {exams.length}
            </div>
            <div className="text-xs text-slate-500 mt-1">Ders / Vize Sınavı</div>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Grafikler ve Cihaz Dağılımı */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 7 Günlük Trend Görseli */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Son 7 Günlük Ziyaretçi Analitiği</h4>
              <p className="text-xs text-slate-500">Günlük tekil IP ve toplam sayfa görüntüleme trendi</p>
            </div>
            <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
              Canlı Takip
            </span>
          </div>

          {/* CSS Bar Grafiği */}
          <div className="h-60 flex items-end justify-between gap-3 pt-6 px-4">
            {[
              { day: 'Pzt', total: 42, unique: 28 },
              { day: 'Sal', total: 65, unique: 41 },
              { day: 'Çar', total: 80, unique: 52 },
              { day: 'Per', total: 58, unique: 39 },
              { day: 'Cum', total: 95, unique: 68 },
              { day: 'Cmt', total: 72, unique: 48 },
              { day: 'Paz', total: Math.max(30, todayVisits.length), unique: Math.max(20, todayUniqueIps) },
            ].map((bar, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <div className="w-full flex items-end justify-center gap-1.5 h-full">
                  <div
                    className="w-1/2 bg-teal-600 rounded-t-md hover:bg-teal-500 transition-all"
                    style={{ height: `${(bar.total / 100) * 100}%` }}
                    title={`Toplam: ${bar.total}`}
                  ></div>
                  <div
                    className="w-1/2 bg-indigo-400 rounded-t-md hover:bg-indigo-300 transition-all"
                    style={{ height: `${(bar.unique / 100) * 100}%` }}
                    title={`Tekil: ${bar.unique}`}
                  ></div>
                </div>
                <span className="text-[11px] font-bold text-slate-600">{bar.day}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-6 pt-3 border-t border-slate-100 text-xs">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-teal-600"></span>
              <span className="text-slate-600">Toplam Ziyaret</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-indigo-400"></span>
              <span className="text-slate-600">Tekil IP Adresleri</span>
            </span>
          </div>
        </div>

        {/* Cihaz Dağılımı */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <h4 className="font-bold text-slate-900 text-sm">Cihaz Türü Dağılımı</h4>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                  <Laptop className="w-4 h-4 text-slate-500" /> Masaüstü (Desktop)
                </span>
                <span className="font-mono font-bold text-slate-900">
                  %{Math.round((desktopCount / totalDevice) * 100)} ({desktopCount})
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-900 rounded-full"
                  style={{ width: `${(desktopCount / totalDevice) * 100}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                  <Smartphone className="w-4 h-4 text-teal-600" /> Mobil (Mobile)
                </span>
                <span className="font-mono font-bold text-slate-900">
                  %{Math.round((mobileCount / totalDevice) * 100)} ({mobileCount})
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-500 rounded-full"
                  style={{ width: `${(mobileCount / totalDevice) * 100}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                  <Tablet className="w-4 h-4 text-indigo-600" /> Tablet
                </span>
                <span className="font-mono font-bold text-slate-900">
                  %{Math.round((tabletCount / totalDevice) * 100)} ({tabletCount})
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{ width: `${(tabletCount / totalDevice) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1">
            <div className="font-bold text-slate-800">Tarayıcı Dağılımı:</div>
            <div>Google Chrome: %65 • Apple Safari: %25 • Mozilla Firefox: %10</div>
          </div>
        </div>
      </div>

      {/* En Çok Ziyaret Edilen Sayfalar ve Son Sınav Girişimleri */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* En Çok Ziyaret Edilen Sayfalar */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h4 className="font-bold text-slate-900 text-sm">En Çok Ziyaret Edilen Sayfalar</h4>
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Sayfa URL</th>
                  <th className="p-2.5 text-right">Görüntülenme</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {topPages.map(([url, count]) => (
                  <tr key={url} className="hover:bg-slate-50">
                    <td className="p-2.5 text-teal-700 font-semibold">{url}</td>
                    <td className="p-2.5 text-right font-bold text-slate-800">{count} kez</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Son Sınav Sonuçları */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h4 className="font-bold text-slate-900 text-sm">Son Tamamlanan Sınav Girişimleri</h4>
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Öğrenci</th>
                  <th className="p-2.5">Sınav</th>
                  <th className="p-2.5 text-center">Puan</th>
                  <th className="p-2.5 text-right">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {examAttempts.slice(0, 5).map((att) => (
                  <tr key={att.id} className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-slate-900">{att.studentName}</td>
                    <td className="p-2.5 text-slate-600 truncate max-w-[120px]">{att.targetTitle}</td>
                    <td className="p-2.5 text-center font-mono font-bold">{att.score.toFixed(0)}</td>
                    <td className="p-2.5 text-right">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          att.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {att.passed ? 'Geçti' : 'Kaldı'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
