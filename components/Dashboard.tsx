
import React, { useEffect, useState } from 'react';
import { Todo, Priority, Category } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getDailyInspiration } from '../services/geminiService';
import { Plus, BrainCircuit, Mic } from 'lucide-react';

interface DashboardProps {
  todos: Todo[];
  onQuickAdd: () => void;
  onVoiceAdd: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ todos, onQuickAdd, onVoiceAdd }) => {
  const [quote, setQuote] = useState("Loading Zen inspiration...");
  
  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const q = await getDailyInspiration(todos.filter(t => !t.completed).length);
        setQuote(q);
      } catch (e) {
        setQuote("Focus on the present moment, one task at a time.");
      }
    };
    fetchQuote();
  }, [todos.length]);

  const stats = [
    { label: 'Pending', value: todos.filter(t => !t.completed).length, color: 'text-indigo-400' },
    { label: 'Completed', value: todos.filter(t => t.completed).length, color: 'text-green-400' },
    { label: 'High Priority', value: todos.filter(t => t.priority === Priority.HIGH && !t.completed).length, color: 'text-red-400' },
  ];

  const categoryData = Object.values(Category).map(cat => ({
    name: cat,
    count: todos.filter(t => t.category === cat).length
  }));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-indigo-600 p-8 md:p-12">
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Good Day, Productivity Seeker</h2>
          <p className="text-indigo-100 text-lg italic font-light">"{quote}"</p>
          
          <div className="mt-8 flex flex-wrap gap-4">
            <button 
              onClick={onQuickAdd}
              className="px-6 py-3 bg-white text-indigo-600 font-semibold rounded-xl flex items-center gap-2 hover:bg-indigo-50 transition-colors shadow-lg"
            >
              <Plus size={20} /> Create New Task
            </button>
            <button 
              onClick={onVoiceAdd}
              className="px-6 py-3 bg-indigo-500/30 text-white font-semibold rounded-xl flex items-center gap-2 hover:bg-indigo-500/50 transition-colors backdrop-blur-sm border border-indigo-400/30"
            >
              <Mic size={20} /> Use Voice AI
            </button>
          </div>
        </div>
        <BrainCircuit className="absolute -right-12 -top-12 w-96 h-96 text-indigo-500/20 pointer-events-none" />
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-slate-800/40 border border-slate-700 p-6 rounded-2xl shadow-sm">
            <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">{stat.label}</p>
            <p className={`text-4xl font-bold mt-2 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="bg-slate-800/40 border border-slate-700 p-8 rounded-2xl">
        <h3 className="text-xl font-bold text-white mb-6">Task Distribution by Category</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '12px' }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#6366f1', '#10b981', '#f59e0b', '#ef4444'][index % 4]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
