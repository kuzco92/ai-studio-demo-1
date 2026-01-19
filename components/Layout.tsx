
import React from 'react';
import { LayoutDashboard, ListTodo, PieChart, Sparkles, MessageSquare } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'dashboard' | 'todos' | 'analytics';
  setActiveTab: (tab: 'dashboard' | 'todos' | 'analytics') => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  return (
    <div className="flex h-screen bg-[#0f172a] text-slate-200 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-20 md:w-64 flex flex-col border-r border-slate-800 bg-[#0f172a] transition-all">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="hidden md:block font-bold text-xl tracking-tight">ZenFlow <span className="text-indigo-500">AI</span></span>
        </div>

        <nav className="flex-1 mt-6 px-4 space-y-2">
          <SidebarItem 
            icon={<LayoutDashboard />} 
            label="Dashboard" 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />
          <SidebarItem 
            icon={<ListTodo />} 
            label="Tasks" 
            active={activeTab === 'todos'} 
            onClick={() => setActiveTab('todos')} 
          />
          <SidebarItem 
            icon={<PieChart />} 
            label="Analytics" 
            active={activeTab === 'analytics'} 
            onClick={() => setActiveTab('analytics')} 
          />
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="hidden md:flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white cursor-pointer transition-colors">
            <MessageSquare className="w-5 h-5" />
            <span className="text-sm font-medium">Support AI</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-slate-800 bg-[#0f172a]/50 backdrop-blur-md flex items-center justify-between px-8 z-10">
          <h1 className="text-lg font-semibold text-white capitalize">{activeTab}</h1>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">JD</div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-900/30">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
        active 
          ? 'bg-indigo-600/10 text-indigo-400 shadow-sm ring-1 ring-indigo-500/20' 
          : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
      }`}
    >
      <span className={`${active ? 'text-indigo-400' : 'text-slate-400'}`}>
        {React.cloneElement(icon as React.ReactElement, { size: 22 })}
      </span>
      <span className="hidden md:block font-medium text-sm">{label}</span>
    </button>
  );
};

export default Layout;
