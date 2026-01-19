
import React, { useMemo } from 'react';
import { Todo, Priority, Category } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, AreaChart, Area, Legend
} from 'recharts';
import { Target, TrendingUp, CheckCircle2, Clock, AlertCircle, BarChart3, PieChart as PieIcon, Layers, Activity, ListChecks } from 'lucide-react';

interface AnalyticsViewProps {
  todos: Todo[];
}

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ todos }) => {
  // 데이터 계산
  const total = todos.length;
  const completed = todos.filter(t => t.completed).length;
  const pending = total - completed;
  const highPriority = todos.filter(t => t.priority === Priority.HIGH && !t.completed).length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // 7일간의 생산성 트렌드 데이터
  const trendData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    return last7Days.map(dateStr => {
      const createdOnDay = todos.filter(t => new Date(t.createdAt).toISOString().split('T')[0] === dateStr).length;
      const completedOnDay = todos.filter(t => t.completed && new Date(t.createdAt).toISOString().split('T')[0] === dateStr).length;
      return {
        day: dateStr.split('-').slice(1).join('/'),
        created: createdOnDay,
        completed: completedOnDay
      };
    });
  }, [todos]);

  // 카테고리별 상세 달성률 및 상태 데이터
  const categoryStats = Object.values(Category).map(cat => {
    const catTodos = todos.filter(t => t.category === cat);
    const catCompleted = catTodos.filter(t => t.completed).length;
    const catPending = catTodos.length - catCompleted;
    const rate = catTodos.length > 0 ? Math.round((catCompleted / catTodos.length) * 100) : 0;
    return { name: cat, total: catTodos.length, completed: catCompleted, pending: catPending, rate };
  }).filter(c => c.total > 0);

  // 우선순위 분포 데이터
  const priorityData = Object.values(Priority).map(p => ({
    name: p,
    value: todos.filter(t => t.priority === p).length
  })).filter(item => item.value > 0);

  const PRIORITY_COLORS: Record<string, string> = {
    [Priority.HIGH]: '#f43f5e',   // rose-500
    [Priority.MEDIUM]: '#f59e0b', // amber-500
    [Priority.LOW]: '#10b981'     // emerald-500
  };

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 bg-slate-800/10 border-2 border-dashed border-slate-700 rounded-[3rem] animate-in fade-in zoom-in-95">
        <div className="p-6 bg-slate-800/50 rounded-full mb-6 text-slate-600">
          <Layers size={48} />
        </div>
        <h3 className="text-2xl font-bold text-slate-300">분석할 데이터가 없습니다</h3>
        <p className="text-slate-500 mt-2 text-center max-w-xs">할 일을 등록하고 완료하면 AI 기반의 심층 생산성 분석 리포트가 생성됩니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* 1. 상단 요약 지표 (KPI Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<Target className="text-indigo-400" />} 
          label="Overall Completion" 
          value={`${completionRate}%`} 
          desc="전체 작업 달성도"
          color="indigo"
        />
        <StatCard 
          icon={<CheckCircle2 className="text-emerald-400" />} 
          label="Done Tasks" 
          value={completed} 
          desc="완료된 목표들"
          color="emerald"
        />
        <StatCard 
          icon={<Clock className="text-amber-400" />} 
          label="Remaining" 
          value={pending} 
          desc="진행 중인 작업"
          color="amber"
        />
        <StatCard 
          icon={<AlertCircle className="text-rose-400" />} 
          label="Critical Items" 
          value={highPriority} 
          desc="미완료 긴급 태스크"
          color="rose"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 2. 생산성 트렌드 (Area Chart) */}
        <div className="lg:col-span-2 bg-slate-800/40 border border-slate-700/50 p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400"><Activity size={20} /></div>
              <h3 className="text-lg font-bold text-white">Productivity Trend</h3>
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-900/50 px-3 py-1 rounded-full border border-slate-700">Last 7 Days</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} strokeOpacity={0.2} />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '16px' }}
                />
                <Area type="monotone" dataKey="created" stroke="#6366f1" fillOpacity={1} fill="url(#colorCreated)" strokeWidth={3} name="신규 등록" />
                <Area type="monotone" dataKey="completed" stroke="#10b981" fillOpacity={1} fill="url(#colorCompleted)" strokeWidth={3} name="완료됨" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. 카테고리별 달성률 (Progress Bars) */}
        <div className="lg:col-span-1 bg-slate-800/40 border border-slate-700/50 p-8 rounded-[2.5rem] shadow-xl flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400"><BarChart3 size={20} /></div>
            <h3 className="text-lg font-bold text-white">Category Performance</h3>
          </div>
          <div className="flex-1 space-y-5 overflow-y-auto pr-2 custom-scrollbar">
            {categoryStats.map((cat) => (
              <div key={cat.name} className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                  <span className="text-slate-400">{cat.name}</span>
                  <span className="text-white">{cat.rate}%</span>
                </div>
                <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 rounded-full transition-all duration-1000" 
                    style={{ width: `${cat.rate}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                  <span>{cat.completed} 완료</span>
                  <span>총 {cat.total}개</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. 하단 상세 분석 (신규 레이아웃: 상태별 바 차트 + 우선순위 도넛 차트) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 4-1. 상태별 작업량 (Stacked Bar Chart) */}
        <div className="bg-slate-800/40 border border-slate-700/50 p-8 rounded-[2.5rem] shadow-xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400"><ListChecks size={20} /></div>
            <h3 className="text-lg font-bold text-white">Task Status Breakdown</h3>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryStats} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} strokeOpacity={0.2} />
                <XAxis type="number" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} width={80} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '16px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="completed" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} name="완료됨" barSize={20} />
                <Bar dataKey="pending" stackId="a" fill="#6366f1" radius={[0, 4, 4, 0]} name="진행 중" barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4-2. 우선순위 비중 (Donut Chart - 우측 배치) */}
        <div className="bg-slate-800/40 border border-slate-700/50 p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400"><PieIcon size={20} /></div>
            <h3 className="text-lg font-bold text-white">Priority Balance</h3>
          </div>
          <div className="flex items-center justify-around h-72">
            <div className="w-1/2 h-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    innerRadius="70%"
                    outerRadius="90%"
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                    label={false}
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.name as Priority]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '16px' }}
                    itemStyle={{ color: '#fff', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* 도넛 중앙 요약 */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <div className="text-3xl font-black text-white">{total}</div>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Total</div>
              </div>
            </div>

            {/* 범례 상세 리스트 */}
            <div className="w-1/2 space-y-3">
              {Object.values(Priority).map((pName) => {
                const data = priorityData.find(d => d.name === pName) || { value: 0 };
                const percentage = total > 0 ? Math.round((data.value / total) * 100) : 0;
                return (
                  <div key={pName} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/30 border border-slate-700/20">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PRIORITY_COLORS[pName] }} />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{pName}</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-bold text-white">{data.value}</span>
                      <span className="text-[10px] text-slate-500">{percentage}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 5. AI 인사이트 푸터 */}
      <div className="bg-indigo-600/10 border border-indigo-500/20 p-8 rounded-[3rem] flex items-center gap-6 group hover:bg-indigo-600/15 transition-all">
        <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform">
          <TrendingUp size={32} />
        </div>
        <div>
          <h4 className="text-indigo-400 font-bold text-sm uppercase tracking-widest mb-1">AI Productivity Coach</h4>
          <p className="text-slate-200 text-lg leading-relaxed font-medium">
            {completionRate >= 80 ? "압도적인 생산성입니다! 현재 페이스를 유지한다면 주간 목표 달성이 확실시됩니다." : 
             completionRate >= 50 ? "안정적인 흐름입니다. 중요한 작업 몇 가지만 더 마무리하면 완벽한 하루가 될 거예요." :
             "시작이 반입니다. 지금 바로 가장 간단한 작업 하나를 끝내고 기세를 타보세요!"}
          </p>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  desc: string;
  color: 'indigo' | 'emerald' | 'amber' | 'rose';
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, desc, color }) => {
  const colorMap = {
    indigo: 'hover:shadow-indigo-500/10',
    emerald: 'hover:shadow-emerald-500/10',
    amber: 'hover:shadow-amber-500/10',
    rose: 'hover:shadow-rose-500/10',
  };

  return (
    <div className={`bg-slate-800/40 border border-slate-700/50 p-6 rounded-[2rem] shadow-lg transition-all hover:scale-[1.02] ${colorMap[color]}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800">
          {icon}
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{label}</p>
        <p className="text-3xl font-black text-white tabular-nums">{value}</p>
        <p className="text-xs text-slate-500 font-medium">{desc}</p>
      </div>
    </div>
  );
};

export default AnalyticsView;
