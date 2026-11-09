import React, { useState, useEffect } from 'react';
import { useElearn } from '../context/ElearnContext';
import { BookOpen, Search, ArrowRight, Layers, FileCheck } from 'lucide-react';

interface ElearnCatalogViewProps {
  setCurrentView: (view: string, params?: Record<string, any>) => void;
}

export const ElearnCatalogView: React.FC<ElearnCatalogViewProps> = ({ setCurrentView }) => {
  const { courses, topics, exams, trackPageVisit } = useElearn();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    trackPageVisit('E-LEARN Ders Kataloğu', '/elearn');
  }, []);

  const categories = Array.from(new Set(courses.map((c) => c.category)));

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || c.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-10">
      {/* Başlık Banner */}
      <div className="bg-slate-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="text-teal-400 text-xs font-bold uppercase tracking-wider">
            Akademik Müfredat ve Modüller
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            E-LEARN Eğitim Kataloğu
          </h1>
          <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
            Dilediğiniz dersi seçin; interaktif konu anlatımlarını tamamlayın, modül testlerini çözün ve vize sınavlarına katılarak derecenizi yükseltin.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Arama ve Kategori Filtresi */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Ders adı veya açıklamasında ara..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tüm Kategoriler
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Ders Kartları Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.length === 0 ? (
            <div className="col-span-3 text-center py-16 bg-white rounded-2xl border border-slate-200 text-slate-500 space-y-2">
              <BookOpen className="w-8 h-8 mx-auto text-slate-400" />
              <div className="font-bold text-sm text-slate-800">Aramanızla eşleşen ders bulunamadı.</div>
              <p className="text-xs">Farklı bir arama terimi deneyebilir veya kategoriyi sıfırlayabilirsiniz.</p>
            </div>
          ) : (
            filteredCourses.map((c) => {
              const courseTopics = topics.filter((t) => t.courseId === c.id);
              const courseExams = exams.filter((e) => e.courseId === c.id);

              return (
                <div
                  key={c.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col hover:shadow-md transition-shadow group"
                >
                  <div className="h-48 overflow-hidden relative">
                    <img
                      src={c.imageUrl}
                      alt={c.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold">
                      {c.category}
                    </span>
                    {courseExams.length > 0 && (
                      <span className="absolute top-3 right-3 px-2 py-1 rounded-md bg-amber-500 text-slate-950 text-[10px] font-extrabold flex items-center gap-1">
                        <FileCheck className="w-3 h-3" /> Vize Sınavı Aktif
                      </span>
                    )}
                  </div>

                  <div className="p-6 flex flex-col flex-grow space-y-3">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Layers className="w-3.5 h-3.5 text-teal-600" />
                      <span>{courseTopics.length} Konu Modülü</span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-base leading-snug">{c.title}</h3>

                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed flex-grow">
                      {c.description}
                    </p>

                    <div className="pt-4 border-t border-slate-100">
                      <button
                        onClick={() => setCurrentView('course_detail', { id: c.id })}
                        className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        Derse Başla & Konuları Gör <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
