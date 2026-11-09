import React from 'react';
import { Phone, Award, ShieldCheck, Mail, Sparkles, BookOpen } from 'lucide-react';
import { CONSULTANTS_AND_STAFF, CONTACT_PHONE, CONTACT_EMAIL } from '../data/departmentsAndUniversities';

interface TeamSectionProps {
  onStartSimulation: () => void;
}

export const TeamSection: React.FC<TeamSectionProps> = ({ onStartSimulation }) => {
  return (
    <section id="koclar" className="py-20 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider">
            <Award className="w-3.5 h-3.5 text-amber-700" />
            <span>Akademik Danışma & İntibak Kurulu</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900">
            Eğitim Koçlarımız ve Uzman Akademik Kadromuz
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Prof. Dr. Murat DOĞAN başkanlığında, üniversite mezuniyeti önündeki engelleri kaldıran;
            eksik ders tespiti, af kanunları ve hızlandırılmış koçluk rehberleri.
          </p>
        </div>

        {/* Feature Split Showcase: Coaching in Action */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-50 rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs">
          <div className="lg:col-span-6 space-y-5">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
              Kişiselleştirilmiş Müfredat Koçluğu
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
              "Kaldığın dersleri yük olmaktan çıkarıyor, sadece eksik konularına odaklanıyoruz."
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Öğrenci profiline baktıktan sonra mezun olması için gereken müfredat özel olarak hazırlanır.
              Ders tekrarı ile seneler kaybetmek yerine, nokta atışı sınav stratejileri ile geçme notu ve
              üzerine ulaşmanız sağlanır.
            </p>

            <div className="space-y-2.5 text-xs text-slate-700 font-medium">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>YÖK mevzuatına uygun ders intibakı ve denklik planlaması</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>Geçmiş dönem harçları ve 10.000 TL burs borcu mali yapılandırması</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>Öğrenci işleri ve rektörlük diploma tescil süreç takibi</span>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={`tel:${CONTACT_PHONE.replace(/\s+/g, '')}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>Hemen Danışmanla Görüş: {CONTACT_PHONE}</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-md">
              <img
                src="/src/assets/images/academic_coaching_session_1794166033428.jpg"
                alt="Akademik Koçluk ve Transkript İnceleme Seansı"
                className="w-full h-72 sm:h-80 object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>

        {/* Team Grid: All 6 named staff members */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CONSULTANTS_AND_STAFF.map((member, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 text-amber-400 font-extrabold text-base flex items-center justify-center shadow-xs shrink-0 border border-slate-800">
                    {member.initials}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                      {member.name}
                    </h4>
                    <div className="text-xs font-semibold text-amber-700">{member.title}</div>
                    <div className="text-[11px] text-slate-400">{member.role}</div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{member.bio}</p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="font-medium">diplomatr.com</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Doğrulanmış Uzman
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
