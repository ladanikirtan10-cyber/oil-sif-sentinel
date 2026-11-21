import React, { useState, useEffect } from 'react';
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
        <h2 className="text-xl font-black text-slate-900 tracking-tight">User Administration & Enterprise Audit Trail</h2>
        <p className="text-xs text-slate-500 mt-0.5 font-medium">
          Role-Based Access Control (RBAC) management and immutable chronological audit logs for all safety operations.
        </p>
      </div>

      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
            activeTab === 'users' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Authorized Users & Roles ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
            activeTab === 'audit' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          System Audit Trail Logs
        </button>
      </div>

      {activeTab === 'users' ? (
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] text-slate-500 uppercase font-bold bg-slate-50">
                  <th className="p-3">Official Name</th>
                  <th className="p-3">Email Address</th>
                  <th className="p-3">RBAC Role</th>
                  <th className="p-3">Primary Asset Site</th>
                  <th className="p-3">Department</th>
                  <th className="p-3 text-center">Account Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80">
                    <td className="p-3 font-bold text-slate-900">{u.full_name}</td>
                    <td className="p-3 text-slate-600 font-mono text-[11px] font-medium">{u.email}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 border border-blue-200 text-blue-700">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3 text-slate-700 font-medium">{u.site}</td>
                    <td className="p-3 text-slate-500 font-medium">{u.department}</td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
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
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] text-slate-500 uppercase font-bold bg-slate-50">
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Actor / User</th>
                  <th className="p-3">Safety Action</th>
                  <th className="p-3">Target Entity</th>
                  <th className="p-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/80">
                    <td className="p-3 text-slate-500 text-[11px] whitespace-nowrap font-medium">
                      {new Date(l.created_at).toLocaleString()}
                    </td>
                    <td className="p-3 font-mono text-blue-600 font-bold">{l.user_email}</td>
                    <td className="p-3 font-bold text-amber-800">{l.action}</td>
                    <td className="p-3 text-slate-800 font-mono text-[11px] font-bold">{l.entity_id || '-'}</td>
                    <td className="p-3 text-slate-500 text-[11px] max-w-xs truncate font-mono">
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
