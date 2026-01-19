
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { UserPlus, Users, Trash2, ShieldCheck, User as UserIcon } from 'lucide-react';

interface AdminPanelProps {
  users: User[];
  onAddUser: (user: User) => void;
  onDeleteUser: (username: string) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ users, onAddUser, onDeleteUser }) => {
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newPassword) return;
    
    if (users.find(u => u.username === newUsername)) {
      alert("User already exists!");
      return;
    }

    onAddUser({
      username: newUsername,
      password: newPassword,
      role: UserRole.USER,
      createdAt: Date.now()
    });
    setNewUsername('');
    setNewPassword('');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section className="bg-slate-800/40 border border-slate-700 p-8 rounded-3xl">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <UserPlus className="text-indigo-400" size={24} /> Create New User
        </h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input 
            type="text"
            placeholder="Username"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            className="bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
          <input 
            type="password"
            placeholder="Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
          <button 
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl px-6 py-3 transition-all shadow-lg"
          >
            Register User
          </button>
        </form>
      </section>

      <section className="bg-slate-800/40 border border-slate-700 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-slate-700 flex items-center gap-2">
          <Users className="text-indigo-400" size={20} />
          <h3 className="text-lg font-bold text-white">Registered Users</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-900/30 text-slate-500 text-[10px] uppercase tracking-widest font-bold">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users.map(user => (
                <tr key={user.username} className="hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                        <UserIcon size={14} className="text-slate-300" />
                      </div>
                      <span className="font-semibold text-slate-200">{user.username}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      user.role === UserRole.ADMIN 
                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
                        : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {user.role !== UserRole.ADMIN && (
                      <button 
                        onClick={() => onDeleteUser(user.username)}
                        className="p-2 text-slate-500 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AdminPanel;
