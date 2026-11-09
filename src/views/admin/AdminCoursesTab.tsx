import React, { useState } from 'react';
import { useElearn } from '../../context/ElearnContext';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Course } from '../../types';

export const AdminCoursesTab: React.FC = () => {
  const { courses, saveCourse, deleteCourse } = useElearn();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    title: '',
    category: 'Yazılım',
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
    sortOrder: 1,
    isActive: true,
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({
      title: '',
      category: 'Yazılım',
      description: '',
      imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
      sortOrder: courses.length + 1,
      isActive: true,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (course: Course) => {
    setEditingId(course.id);
    setForm({
      title: course.title,
      category: course.category,
      description: course.description,
      imageUrl: course.imageUrl,
      sortOrder: course.sortOrder,
      isActive: course.isActive,
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) return;

    saveCourse({
      ...(editingId ? { id: editingId } : {}),
      title: form.title,
      category: form.category,
      description: form.description,
      imageUrl: form.imageUrl,
      sortOrder: form.sortOrder,
      isActive: form.isActive,
      slug: form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    });

    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Ders Yönetimi</h2>
          <p className="text-sm text-slate-500">
            Mevcut derslerin sıralaması, aktif/pasif durumları ve müfredat içeriklerini düzenleyin
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Yeni Ders Ekle
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:border-slate-300 transition-all"
          >
            <div className="relative h-44 overflow-hidden bg-slate-100">
              <img
                src={course.imageUrl}
                alt={course.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md text-white text-xs font-semibold rounded-full">
                  Sıra: {course.sortOrder}
                </span>
                <span
                  className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                    course.isActive
                      ? 'bg-emerald-500/90 text-white'
                      : 'bg-rose-500/90 text-white'
                  }`}
                >
                  {course.isActive ? 'Aktif' : 'Pasif'}
                </span>
              </div>
              <div className="absolute bottom-3 left-3">
                <span className="px-2.5 py-1 bg-teal-600/90 text-white text-xs font-semibold rounded-lg backdrop-blur-md">
                  {course.category}
                </span>
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-lg mb-2">{course.title}</h3>
                <p className="text-slate-500 text-sm line-clamp-3 mb-4">{course.description}</p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono">ID: #{course.id}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(course)}
                    className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                    title="Düzenle"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`"${course.title}" dersini silmek istediğinize emin misiniz?`)) {
                        deleteCourse(course.id);
                      }
                    }}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              {editingId ? 'Dersi Düzenle' : 'Yeni Ders Tanımla'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Ders Adı</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Kategori</label>
                  <input
                    type="text"
                    required
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Sıralama</label>
                  <input
                    type="number"
                    min="1"
                    value={form.sortOrder}
                    onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Açıklama</label>
                <textarea
                  rows={3}
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Görsel URL</label>
                <input
                  type="url"
                  required
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Durum</label>
                <select
                  value={form.isActive ? 1 : 0}
                  onChange={(e) => setForm({ ...form, isActive: Number(e.target.value) === 1 })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
                >
                  <option value={1}>Aktif (Öğrencilere Görünür)</option>
                  <option value={0}>Pasif (Gizli)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm cursor-pointer"
                >
                  {editingId ? 'Güncelle' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
