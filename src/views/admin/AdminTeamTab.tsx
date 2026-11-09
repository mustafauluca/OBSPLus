import React, { useState } from 'react';
import { useElearn } from '../../context/ElearnContext';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { TeamMember } from '../../types';

export const AdminTeamTab: React.FC = () => {
  const { teamMembers, saveTeamMember, deleteTeamMember } = useElearn();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState({
    fullName: '',
    roleTitle: '',
    biography: '',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
    education: '',
    specialties: '',
    sortOrder: 1,
    isActive: true,
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({
      fullName: '',
      roleTitle: '',
      biography: '',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
      education: '',
      specialties: '',
      sortOrder: teamMembers.length + 1,
      isActive: true,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (member: TeamMember) => {
    setEditingId(member.id);
    setForm({
      fullName: member.fullName,
      roleTitle: member.roleTitle,
      biography: member.biography || '',
      photoUrl: member.photoUrl || '',
      education: member.education || '',
      specialties: member.specialties || '',
      sortOrder: member.sortOrder,
      isActive: member.isActive,
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.roleTitle) return;

    saveTeamMember({
      ...(editingId ? { id: editingId } : {}),
      fullName: form.fullName,
      roleTitle: form.roleTitle,
      biography: form.biography,
      photoUrl: form.photoUrl,
      education: form.education,
      specialties: form.specialties,
      sortOrder: form.sortOrder,
      isActive: form.isActive,
    });

    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Eğitmen ve Akademik Kadro</h2>
          <p className="text-sm text-slate-500">
            Ana sayfada görüntülenen danışmanlar, eğitmenler ve akademik ekip üyelerini yönetin
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Yeni Eğitmen Ekle
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.map((member) => (
          <div
            key={member.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between hover:border-slate-300 transition-all text-center"
          >
            <div>
              <div className="relative w-24 h-24 mx-auto mb-4">
                <img
                  src={member.photoUrl}
                  alt={member.fullName}
                  className="w-full h-full rounded-full object-cover ring-4 ring-teal-50"
                />
                <span
                  className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${
                    member.isActive ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                />
              </div>

              <h3 className="font-bold text-slate-800 text-lg">{member.fullName}</h3>
              <p className="text-xs font-semibold text-teal-600 mb-2">{member.roleTitle}</p>
              <p className="text-slate-500 text-xs line-clamp-3 mb-4">{member.biography}</p>
              {member.specialties && (
                <div className="text-[11px] text-slate-400 bg-slate-50 p-2 rounded-xl">
                  {member.specialties}
                </div>
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">Sıra: {member.sortOrder}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(member)}
                  className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`"${member.fullName}" üyesini silmek istediğinize emin misiniz?`)) {
                      deleteTeamMember(member.id);
                    }
                  }}
                  className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 my-8">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              {editingId ? 'Eğitmeni Düzenle' : 'Yeni Eğitmen Ekle'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Ad Soyad</label>
                  <input
                    type="text"
                    required
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Unvan</label>
                  <input
                    type="text"
                    required
                    placeholder="Prof. Dr. / Uzman Eğitmen"
                    value={form.roleTitle}
                    onChange={(e) => setForm({ ...form, roleTitle: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Biyografi</label>
                <textarea
                  rows={3}
                  value={form.biography}
                  onChange={(e) => setForm({ ...form, biography: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Fotoğraf URL</label>
                <input
                  type="url"
                  value={form.photoUrl}
                  onChange={(e) => setForm({ ...form, photoUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Eğitim / Derece</label>
                  <input
                    type="text"
                    value={form.education}
                    onChange={(e) => setForm({ ...form, education: e.target.value })}
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
                <label className="block text-xs font-bold text-slate-600 mb-1">Uzmanlık Alanları</label>
                <input
                  type="text"
                  placeholder="PHP, MySQL, Güvenlik Mimarisi"
                  value={form.specialties}
                  onChange={(e) => setForm({ ...form, specialties: e.target.value })}
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
                  <option value={1}>Aktif</option>
                  <option value={0}>Pasif</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
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
