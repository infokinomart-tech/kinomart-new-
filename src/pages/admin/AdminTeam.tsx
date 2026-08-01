import React from 'react';
import { Users, ShieldCheck, UserPlus, Key } from 'lucide-react';

export const AdminTeam: React.FC = () => {
  const teamMembers = [
    {
      id: '1',
      name: 'Super Admin (কীনোমার্ট)',
      username: 'Kinomart',
      role: 'Super Admin',
      status: 'Active',
      permissions: 'Full Access (Orders, Products, Settings, CAPI)'
    },
    {
      id: '2',
      name: 'Order Manager 1',
      username: 'OrderManager1',
      role: 'Manager',
      status: 'Active',
      permissions: 'Order Status & Call Status Updates'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-[#181F30] border border-[#27324A] p-5 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-white">টিম ও পারমিশন ম্যানেজমেন্ট</h2>
          <p className="text-xs text-gray-400">এডমিন প্যানেল এক্সেস ও মেম্বার তালিকা</p>
        </div>

        <button
          onClick={() => alert('নতুন এডমিন মেম্বার যোগ করার সুবিধা শীঘ্রই আসছে')}
          className="px-4 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>মেম্বার যোগ করুন</span>
        </button>
      </div>

      <div className="bg-[#181F30] border border-[#27324A] rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs text-gray-300">
          <thead className="bg-[#111827] text-gray-400 uppercase font-semibold text-[11px] border-b border-[#27324A]">
            <tr>
              <th className="py-3 px-4">নাম</th>
              <th className="py-3 px-4">ইউজারনেম (ID)</th>
              <th className="py-3 px-4">রোল (Role)</th>
              <th className="py-3 px-4">পারমিশন</th>
              <th className="py-3 px-4">স্ট্যাটাস</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#27324A]">
            {teamMembers.map(m => (
              <tr key={m.id} className="hover:bg-[#1E293B]/60 transition-colors">
                <td className="py-3.5 px-4 font-bold text-white flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  <span>{m.name}</span>
                </td>
                <td className="py-3.5 px-4 text-blue-300 font-mono">{m.username}</td>
                <td className="py-3.5 px-4 font-semibold text-gray-200">{m.role}</td>
                <td className="py-3.5 px-4 text-gray-400">{m.permissions}</td>
                <td className="py-3.5 px-4">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                    {m.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
