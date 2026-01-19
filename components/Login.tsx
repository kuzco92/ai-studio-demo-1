
import React, { useState } from 'react';
import { Sparkles, Lock, User as UserIcon, LogIn } from 'lucide-react';

interface LoginProps {
  onLogin: (id: string, pw: string) => boolean;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onLogin(id, pw)) {
      setError(false);
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0f172a]">
      <div className="w-full max-w-md animate-in zoom-in-95 duration-500">
        <div className="text-center mb-8">
          <div className="inline-flex bg-indigo-600 p-4 rounded-3xl shadow-2xl shadow-indigo-500/40 mb-6">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">ZenFlow <span className="text-indigo-500">AI</span></h1>
          <p className="text-slate-500 mt-2 font-medium">Smart Task Management Suite</p>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/50 p-8 rounded-[2.5rem] backdrop-blur-xl shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Username</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="text"
                  value={id}
                  onChange={(e) => { setId(e.target.value); setError(false); }}
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all placeholder:text-slate-700"
                  placeholder="admin"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="password"
                  value={pw}
                  onChange={(e) => { setPw(e.target.value); setError(false); }}
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all placeholder:text-slate-700"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-xs font-semibold text-center animate-bounce">
                Invalid credentials. Please try again.
              </p>
            )}

            <button 
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20 group active:scale-[0.98]"
            >
              <LogIn size={20} /> Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
