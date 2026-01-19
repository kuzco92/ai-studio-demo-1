
import React from 'react';
import { Todo, Priority, Category } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Sector, 
  AreaChart, Area
} from 'recharts';

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

  // 2. 우선순위 비중 (도넛 차트)
  const priorityData = Object.values(Priority).map(p => ({
    name: p,
    value: todos.filter(t => t.priority === p).length
  }));

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

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-800/40 border border-slate-700 p-6 rounded-3xl">
            <h4 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">종합 완료율</h4>
            <div className="text-4xl font-black text-indigo-400">{completionRate}%</div>
            <div className="mt-4 h-2 w-full bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500" style={{ width: `${completionRate}%` }}></div>
            </div>
            <p className="mt-4 text-xs text-slate-400">총 {todos.length}개의 태스크 중 {totalCompleted}개 완료</p>
          </div>
          
          <div className="bg-slate-800/40 border border-slate-700 p-6 rounded-3xl">
            <h4 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-4">가장 바쁜 카테고리</h4>
            {categoryComparison.sort((a, b) => b.total - a.total).slice(0, 1).map(cat => (
              <div key={cat.name}>
                <div className="text-2xl font-bold text-white">{cat.name}</div>
                <p className="text-xs text-slate-400 mt-1">{cat.total}개의 할 일이 할당됨</p>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3 bg-slate-800/40 border border-slate-700 p-8 rounded-3xl">
          <h4 className="text-white text-lg font-bold mb-6">주간 활동 트렌드</h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyTrend}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '12px' }}
                />
                <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 카테고리 비교 분석 */}
        <div className="bg-slate-800/40 border border-slate-700 p-8 rounded-3xl">
          <h4 className="text-white text-lg font-bold mb-6">카테고리별 성과 비교</h4>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryComparison} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={10} hide />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} width={80} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '12px' }}
                />
                <Bar dataKey="completed" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} barSize={20} name="완료" />
                <Bar dataKey="pending" stackId="a" fill="#334155" radius={[0, 4, 4, 0]} barSize={20} name="진행중" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 우선순위 비중 분석 */}
        <div className="bg-slate-800/40 border border-slate-700 p-8 rounded-3xl">
          <h4 className="text-white text-lg font-bold mb-6">우선순위 집중도</h4>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.name as Priority]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
