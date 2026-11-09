import React, { useState } from 'react';
import { useElearn } from '../../context/ElearnContext';
import { RefreshCw, Shield, CheckCircle } from 'lucide-react';

export const AdminScoreboardTab: React.FC = () => {
  const { getTopScoreboard, recalculateScores } = useElearn();
  const [recalculated, setRecalculated] = useState(false);

  const scoreboard = getTopScoreboard();

  const handleRecalculate = () => {
    recalculateScores();
    setRecalculated(true);
    setTimeout(() => setRecalculated(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Skorboard & Başarı Sıralaması</h2>
          <p className="text-sm text-slate-500">
            Öğrenci sınav puanlarına göre otomatik hesaplanan sıralama tablosu ve KVKK maskeleme denetimi
          </p>
        </div>
        <button
          onClick={handleRecalculate}
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${recalculated ? 'animate-spin' : ''}`} />
          Sıralamayı Yeniden Hesapla
        </button>
      </div>

      {recalculated && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-2 text-sm">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          Tüm öğrenci puanları ve sıralamaları başarıyla güncellendi!
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-teal-600" />
            <span className="text-sm font-bold text-slate-700">
              KVKK Kapsamında Maskeli İsim Görünümü Denetimi
            </span>
          </div>
          <span className="text-xs text-slate-400">
            Ziyaretçiler ve öğrenciler yalnızca maskeli isimleri görebilir.
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Ders Adı</th>
                <th className="px-6 py-4">Gerçek İsim (Admin Görünümü)</th>
                <th className="px-6 py-4">KVKK Maskeli İsim (Halka Açık)</th>
                <th className="px-6 py-4">Sınav Sayısı</th>
                <th className="px-6 py-4">Toplam Puan</th>
                <th className="px-6 py-4">Başarı Oranı</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {scoreboard.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800">
                    <span className="px-2.5 py-1 bg-teal-50 text-teal-700 rounded-lg text-xs font-semibold mr-2">
                      {item.category}
                    </span>
                    {item.courseTitle}
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900">
                    {item.realName}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-mono font-semibold text-slate-700 border border-slate-200">
                      {item.maskedName}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-600">
                    {item.examCount} Sınav
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-base font-black text-teal-600">{item.totalPoints}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-emerald-600">%{item.successRate}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
