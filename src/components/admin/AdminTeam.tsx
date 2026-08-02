import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Users, Phone, Mail } from 'lucide-react';

export const AdminTeam: React.FC = () => {
  const { team } = useStore();

  return (
    <div className="space-y-6">
      <div className="bg-[#181B26] border border-[#2B3042] p-4 rounded-2xl">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-[#2563EB]" />
          <span>টিম মেম্বারস (Team Management)</span>
        </h2>
        <p className="text-xs text-[#94A3B8]">কীনোমার্ট এডমিন ও সাপোর্ট টিমের তালিকা</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {team.map((member) => (
          <div
            key={member.id}
            className="bg-[#181B26] border border-[#2B3042] rounded-2xl p-5 space-y-3"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-extrabold text-white text-base">{member.name}</h3>
                <span className="text-xs bg-[#2563EB]/20 text-blue-300 px-2.5 py-0.5 rounded font-bold">
                  {member.role}
                </span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-[#CBD5E1] pt-2 border-t border-[#2B3042]">
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#A5DD28]" />
                <span>{member.phone}</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#A5DD28]" />
                <span>{member.email}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
