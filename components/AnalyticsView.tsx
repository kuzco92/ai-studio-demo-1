
import React from 'react';
import { Todo, Priority, Category } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
  AreaChart, Area
} from 'recharts';
import { AlertCircle } from 'lucide-react';

interface AnalyticsViewProps {
  todos: Todo[];
}

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ todos }) => {
  // 1. 카테고리별 비교 데이터 (완료 vs 미완료)
  const categoryComparison = Object.values(Category).map(cat => {
    const catTodos = todos.filter(t => t.category === cat);
    return {
      name: cat,
      completed: catTodos.filter(t => t.completed).length,
      pending: catTodos.filter(t => !t.completed).length,
      total: catTodos.length
    };
  });

  // 2. 우선순위 비중 (도넛 차트) - 데이터가 0인 것은 제외하여 겹침 방지
  const priorityData = Object.values(Priority)
    .map(p => ({
      name: p,
      value: todos.filter(t => t.priority === p).length
    }))
    .filter(item => item.value > 0);

  const PRIORITY_COLORS: Record<string, string> = {
    [Priority.HIGH]: '#ef4444',
    [Priority.MEDIUM]: '#f59e0b',
    [Priority.LOW]: '#10b981'
  };

  // 3. 주간 트렌드 (최근 7일)
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }));
    }
    return days;
  };

  const weeklyTrend = getLast7Days().map(dayLabel => {
    const count = todos.filter(t => {
      const d = new Date(t.createdAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
      return d === dayLabel;
    }).length;
    return { day: dayLabel, count };
  });

  const totalCompleted = todos.filter(t => t.completed).length;
  const completionRate = todos.length > 0 ? Math.round((totalCompleted / todos.length) * 100) : 0;

  if (todos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-slate-800/20 border-2 border-dashed border-slate-800 rounded-[3rem] animate-in fade-in zoom-in duration-500">
        <AlertCircle size={48} className="text-slate-700 mb-4" />
        <h3 className="text-xl font-bold text-slate-400">분석할 데이터가 없습니다.</h3>
        <p className="text-slate-600 mt-2">할 일을 먼저 등록해 보세요!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-800/40 border border-slate-700 p-6 rounded-3xl shadow-xl">
            <h4 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">종합 완료율</h4>
            <div className="text-5xl font-black text-indigo-400 tabular-nums">{completionRate}%</div>
            <div className="mt-6 h-3 w-full bg-slate-900 rounded-full overflow-hidden p-0.5">
              <div 
                className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
            <p className="mt-4 text-xs text-slate-500 font-medium">총 {todos.length}개의 태스크 중 {totalCompleted}개 완료</p>
          </div>
          
          <div className="bg-slate-800/40 border border-slate-700 p-6 rounded-3xl shadow-xl">
            <h4 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">가장 바쁜 분야</h4>
            {categoryComparison.sort((a, b) => b.total - a.total).slice(0, 1).map(cat => (
              <div key={cat.name}>
                <div className="text-2xl font-black text-white">{cat.name}</div>
                <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg text-[10px] font-bold">
                  {cat.total} TASKS ASSIGNED
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3 bg-slate-800/40 border border-slate-700 p-8 rounded-3xl shadow-xl">
          <h4 className="text-white text-lg font-bold mb-8 flex items-center gap-2">
            <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
            주간 활동 트렌드
          </h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyTrend}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} strokeOpacity={0.5} />
                <XAxis dataKey="day" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip 
                  cursor={{ stroke: '#6366f1', strokeWidth: 1 }}
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#6366f1" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorCount)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 카테고리 비교 분석 */}
        <div className="bg-slate-800/40 border border-slate-700 p-8 rounded-3xl shadow-xl">
          <h4 className="text-white text-lg font-bold mb-8 flex items-center gap-2">
            <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
            카테고리별 성과
          </h4>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryComparison} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} strokeOpacity={0.5} />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  stroke="#94a3b8" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  width={90}
                  tick={{fontWeight: 600}}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '16px' }}
                />
                <Legend iconType="circle" wrapperStyle={{paddingTop: '20px'}} />
                <Bar dataKey="completed" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} barSize={24} name="완료됨" />
                <Bar dataKey="pending" stackId="a" fill="#334155" radius={[0, 6, 6, 0]} barSize={24} name="진행중" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 우선순위 비중 분석 (겹침 방지 개선) */}
        <div className="bg-slate-800/40 border border-slate-700 p-8 rounded-3xl shadow-xl">
          <h4 className="text-white text-lg font-bold mb-8 flex items-center gap-2">
            <div className="w-1.5 h-6 bg-amber-500 rounded-full"></div>
            우선순위 분포
          </h4>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {priorityData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={PRIORITY_COLORS[entry.name as Priority]} 
                      style={{ filter: 'drop-shadow(0px 10px 10px rgba(0,0,0,0.2))' }}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '16px' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
