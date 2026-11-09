import React, { useState } from 'react';
import { BookOpen, GraduationCap, ChevronRight, Sparkles, Clock, Award } from 'lucide-react';
import { Department } from '../types';

interface DepartmentsSectionProps {
  departments: Department[];
  onSelectDepartmentForSimulation: (departmentId: string) => void;
}

export const DepartmentsSection: React.FC<DepartmentsSectionProps> = ({
  departments,
  onSelectDepartmentForSimulation,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'associate' | 'bachelor'>('all');

  const associateDepts = departments.filter(d => d.type === '2 Yıllık (Ön Lisans)');
  const bachelorDepts = departments.filter(d => d.type === '4 Yıllık (Lisans)');

  const displayedDepts =
    activeTab === 'associate'
      ? associateDepts
      : activeTab === 'bachelor'
      ? bachelorDepts
      : departments;

  return (
    <section id="bolumler" className="py-20 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-bold uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5 text-blue-700" />
              <span>14 Program Kataloğu</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900">
              Müfredat ve Mezuniyet İntibak Bölümleri
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Ön lisans ve lisans programlarında güncel YÖK ders planları, AKTS kredi dağılımları ve
              bitirme tez konuları sisteme entegre edilmiştir.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-slate-200 text-xs font-semibold self-start md:self-end">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tümü ({departments.length})
            </button>
            <button
              onClick={() => setActiveTab('associate')}
              className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'associate'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              2 Yıllık Ön Lisans ({associateDepts.length})
            </button>
            <button
              onClick={() => setActiveTab('bachelor')}
              className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'bachelor'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              4 Yıllık Lisans ({bachelorDepts.length})
            </button>
          </div>
        </div>

        {/* Department Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedDepts.map((dept) => (
            <div
              key={dept.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md hover:border-amber-400/80 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-md ${
                      dept.type.includes('Ön Lisans')
                        ? 'bg-sky-50 text-sky-800 border border-sky-200'
                        : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                    }`}
                  >
                    {dept.type}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-500">
                    {dept.totalAkts} AKTS
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                    {dept.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">{dept.faculty}</p>
                </div>

                {/* Sample courses preview */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Örnek Müfredat Dersleri:
                  </div>
                  <div className="text-xs text-slate-700 space-y-1">
                    {dept.courses.slice(0, 3).map((c) => (
                      <div key={c.code} className="flex items-center gap-1.5 truncate">
                        <span className="font-mono text-[11px] font-semibold text-slate-400">
                          {c.code}
                        </span>
                        <span className="truncate">{c.name}</span>
                      </div>
                    ))}
                    {dept.courses.length > 3 && (
                      <div className="text-[11px] text-amber-700 font-medium">
                        + {dept.courses.length - 3} ders daha mevcut
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6 mt-4 border-t border-slate-100">
                <button
                  onClick={() => onSelectDepartmentForSimulation(dept.id)}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-amber-400 hover:text-slate-950 text-slate-800 text-xs font-bold transition-all flex items-center justify-center gap-2 group-hover:bg-amber-400 group-hover:text-slate-950 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Mezuniyet Başvurusu Yap</span>
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
