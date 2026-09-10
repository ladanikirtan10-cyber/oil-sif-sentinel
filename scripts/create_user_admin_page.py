content = """import React, { useState, useEffect } from 'react';
import { Users, History, Shield, CheckCircle2, UserCheck, Key } from 'lucide-react';
import { api } from '../services/api';

export const UserManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'audit'>('users');
  const [users, setUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'users') {
        const u = await api.getUsers();
        setUsers(u);
      } else {
        const l = await api.getAuditLogs();
        setLogs(l);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">User Administration & Enterprise Audit Trail</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Role-Based Access Control (RBAC) management and immutable chronological audit logs for all safety operations.
        </p>
      </div>

      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
            activeTab === 'users' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Authorized Users & Roles ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
            activeTab === 'audit' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          System Audit Trail Logs
        </button>
      </div>

      {activeTab === 'users' ? (
        <div className="p-4 rounded-xl bg-[#0C1222] border border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase">
                  <th className="p-3">Official Name</th>
                  <th className="p-3">Email Address</th>
                  <th className="p-3">RBAC Role</th>
                  <th className="p-3">Primary Asset Site</th>
                  <th className="p-3">Department</th>
                  <th className="p-3 text-center">Account Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-900/40">
                    <td className="p-3 font-bold text-white">{u.full_name}</td>
                    <td className="p-3 text-slate-300 font-mono text-[11px]">{u.email}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900 border border-slate-700 text-sky-400">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3 text-slate-300">{u.site}</td>
                    <td className="p-3 text-slate-400">{u.department}</td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-500/40">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-[#0C1222] border border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase">
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Actor / User</th>
                  <th className="p-3">Safety Action</th>
                  <th className="p-3">Target Entity</th>
                  <th className="p-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {logs.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-900/40">
                    <td className="p-3 text-slate-400 text-[11px] whitespace-nowrap">
                      {new Date(l.created_at).toLocaleString()}
                    </td>
                    <td className="p-3 font-mono text-sky-400">{l.user_email}</td>
                    <td className="p-3 font-bold text-amber-400">{l.action}</td>
                    <td className="p-3 text-white font-mono text-[11px]">{l.entity_id || '-'}</td>
                    <td className="p-3 text-slate-400 text-[11px] max-w-xs truncate">
                      {JSON.stringify(l.details || {})}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
"""

with open('frontend/src/pages/UserManagementPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Created UserManagementPage.tsx')
