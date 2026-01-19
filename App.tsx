
import React, { useState, useEffect, useRef } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import TodoItem from './components/TodoItem';
import AnalyticsView from './components/AnalyticsView';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';
import { Todo, Priority, Category, User, UserRole } from './types';
import { refineTask, encode, decode, decodeAudioData } from './services/geminiService';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { Sparkles, Loader2, Mic, X, Plus, Save, PenLine, Zap } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'todos' | 'analytics' | 'admin'>('dashboard');
  const [addMode, setAddMode] = useState<'AI' | 'Normal'>('AI');
  const [todos, setTodos] = useState<Todo[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [quickInput, setQuickInput] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  
  // Voice API Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Initialization & Auth
  useEffect(() => {
    const savedUsers = localStorage.getItem('zenflow_users');
    let initialUsers: User[] = [];
    if (savedUsers) {
      initialUsers = JSON.parse(savedUsers);
    } else {
      initialUsers = [{
        username: 'admin',
        password: 'admin',
        role: UserRole.ADMIN,
        createdAt: Date.now()
      }];
      localStorage.setItem('zenflow_users', JSON.stringify(initialUsers));
    }
    setUsers(initialUsers);

    const session = localStorage.getItem('zenflow_session');
    if (session) {
      const user = initialUsers.find(u => u.username === session);
      if (user) setCurrentUser(user);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      const saved = localStorage.getItem(`zenflow_todos_${currentUser.username}`);
      setTodos(saved ? JSON.parse(saved) : []);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`zenflow_todos_${currentUser.username}`, JSON.stringify(todos));
    }
  }, [todos, currentUser]);

  useEffect(() => {
    localStorage.setItem('zenflow_users', JSON.stringify(users));
  }, [users]);

  const handleLogin = (id: string, pw: string) => {
    const user = users.find(u => u.username === id && u.password === pw);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('zenflow_session', user.username);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('zenflow_session');
    setActiveTab('dashboard');
  };

  const handleAddUser = (user: User) => {
    setUsers(prev => [...prev, user]);
  };

  const handleDeleteUser = (username: string) => {
    if (username === 'admin') return;
    setUsers(prev => prev.filter(u => u.username !== username));
    localStorage.removeItem(`zenflow_todos_${username}`);
  };

  const handleToggleTodo = (id: string) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleDeleteTodo = (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  const handlePriorityToggle = (id: string, current: Priority) => {
    const priorities = [Priority.LOW, Priority.MEDIUM, Priority.HIGH];
    const next = priorities[(priorities.indexOf(current) + 1) % priorities.length];
    setTodos(prev => prev.map(t => t.id === id ? { ...t, priority: next } : t));
  };

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim() || isRefining) return;

    if (addMode === 'Normal') {
      const newTodo: Todo = {
        id: crypto.randomUUID(),
        title: quickInput,
        description: '',
        priority: Priority.MEDIUM,
        category: Category.PERSONAL,
        completed: false,
        createdAt: Date.now()
      };
      setTodos(prev => [newTodo, ...prev]);
      setQuickInput('');
      return;
    }

    setIsRefining(true);
    try {
      const refined = await refineTask(quickInput);
      const newTodo: Todo = {
        id: crypto.randomUUID(),
        title: refined.title,
        description: refined.description,
        priority: refined.priority as Priority,
        category: refined.category as Category,
        completed: false,
        createdAt: Date.now()
      };
      setTodos(prev => [newTodo, ...prev]);
      setQuickInput('');
    } catch (err) {
      console.error("AI refinement failed:", err);
      const fallback: Todo = {
        id: crypto.randomUUID(),
        title: quickInput,
        description: '',
        priority: Priority.MEDIUM,
        category: Category.PERSONAL,
        completed: false,
        createdAt: Date.now()
      };
      setTodos(prev => [fallback, ...prev]);
      setQuickInput('');
    } finally {
      setIsRefining(false);
    }
  };

  const handleUpdateTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTodo) return;
    setTodos(prev => prev.map(t => t.id === editingTodo.id ? editingTodo : t));
    setEditingTodo(null);
  };

  const startVoiceSession = async () => {
    setIsVoiceActive(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    audioContextRef.current = outputCtx;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const sessionPromise = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      callbacks: {
        onopen: () => {
          const source = inputCtx.createMediaStreamSource(stream);
          const processor = inputCtx.createScriptProcessor(4096, 1, 1);
          processor.onaudioprocess = (e) => {
            const data = e.inputBuffer.getChannelData(0);
            const l = data.length;
            const int16 = new Int16Array(l);
            for (let i = 0; i < l; i++) int16[i] = data[i] * 32768;
            sessionPromise.then(s => s.sendRealtimeInput({ 
              media: { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' }
            }));
          };
          source.connect(processor);
          processor.connect(inputCtx.destination);
        },
        onmessage: async (msg: LiveServerMessage) => {
          const audioStr = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (audioStr) {
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
            const buffer = await decodeAudioData(decode(audioStr), outputCtx, 24000, 1);
            const source = outputCtx.createBufferSource();
            source.buffer = buffer;
            source.connect(outputCtx.destination);
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += buffer.duration;
            sourcesRef.current.add(source);
            source.onended = () => sourcesRef.current.delete(source);
          }
        },
        onclose: () => setIsVoiceActive(false)
      },
      config: {
        responseModalities: [Modality.AUDIO],
        systemInstruction: `You are a task management helper for ${currentUser?.username}. Speak the language the user speaks.`
      }
    });
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      currentUser={currentUser} 
      onLogout={handleLogout}
    >
      {activeTab === 'dashboard' && (
        <Dashboard 
          todos={todos} 
          onQuickAdd={() => setActiveTab('todos')}
          onVoiceAdd={startVoiceSession}
        />
      )}

      {activeTab === 'todos' && (
        <div className="flex flex-col h-[calc(100vh-12rem)]">
          <div className="flex-1 overflow-y-auto pb-24 pr-2">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white">Your Journey</h2>
              <p className="text-slate-400 text-sm">Today's focus and future steps.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {todos.length === 0 ? (
                <div className="col-span-full py-20 text-center bg-slate-800/10 rounded-3xl border-2 border-dashed border-slate-800">
                  <Sparkles className="mx-auto w-10 h-10 text-slate-700 mb-4" />
                  <p className="text-slate-500">No tasks yet. Use the bar below to add one!</p>
                </div>
              ) : (
                todos.map(todo => (
                  <TodoItem 
                    key={todo.id} 
                    todo={todo} 
                    onToggle={handleToggleTodo} 
                    onDelete={handleDeleteTodo}
                    onEdit={setEditingTodo}
                    onPriorityToggle={handlePriorityToggle}
                  />
                ))
              )}
            </div>
          </div>

          {/* Smart Quick Add Bar with Tabs */}
          <div className="absolute bottom-8 left-8 right-8 max-w-6xl mx-auto">
            <div className="relative">
              {/* Mode Toggle Tabs */}
              <div className="absolute -top-10 left-0 flex items-center bg-slate-800/60 backdrop-blur-md p-1 rounded-t-xl border-t border-x border-slate-700 gap-1">
                <button 
                  onClick={() => setAddMode('AI')}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${
                    addMode === 'AI' 
                      ? 'bg-indigo-600 text-white shadow-lg' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Zap size={12} className={addMode === 'AI' ? 'animate-pulse' : ''} /> AI Mode
                </button>
                <button 
                  onClick={() => setAddMode('Normal')}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${
                    addMode === 'Normal' 
                      ? 'bg-slate-700 text-white shadow-lg' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <PenLine size={12} /> Normal
                </button>
              </div>

              {/* Input Bar */}
              <form 
                onSubmit={handleQuickAdd}
                className={`group flex items-center gap-3 bg-slate-800/90 backdrop-blur-xl border-2 p-2 pl-5 rounded-2xl transition-all shadow-2xl ${
                  isRefining 
                    ? 'border-indigo-500 ring-4 ring-indigo-500/10' 
                    : addMode === 'AI' 
                      ? 'border-slate-700 focus-within:border-indigo-500/50 shadow-indigo-500/5'
                      : 'border-slate-700 focus-within:border-slate-500'
                }`}
              >
                <div className={`${addMode === 'AI' ? 'text-indigo-400' : 'text-slate-500'}`}>
                  {isRefining ? (
                    <Loader2 className="animate-spin w-5 h-5" />
                  ) : addMode === 'AI' ? (
                    <Sparkles size={20} />
                  ) : (
                    <Plus size={20} />
                  )}
                </div>
                <input 
                  type="text"
                  value={quickInput}
                  onChange={(e) => setQuickInput(e.target.value)}
                  placeholder={
                    isRefining 
                      ? "Gemini is analyzing..." 
                      : addMode === 'AI' 
                        ? "AI분석을 위해 내용을 적어주세요 (예: 오늘 저녁 8시 친구와 약속)" 
                        : "할 일을 입력하세요..."
                  }
                  className="flex-1 bg-transparent border-none outline-none text-white placeholder-slate-500 text-sm py-2"
                  disabled={isRefining}
                />
                <button 
                  type="submit"
                  disabled={!quickInput.trim() || isRefining}
                  className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg disabled:bg-slate-700 disabled:opacity-50 ${
                    addMode === 'AI' 
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20' 
                      : 'bg-slate-200 hover:bg-white text-slate-900 shadow-white/5'
                  }`}
                >
                  {addMode === 'AI' ? <Sparkles size={14} /> : <Plus size={14} />}
                  {addMode === 'AI' ? 'AI REFINER' : 'QUICK ADD'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <AnalyticsView todos={todos} />
      )}

      {activeTab === 'admin' && currentUser.role === UserRole.ADMIN && (
        <AdminPanel 
          users={users} 
          onAddUser={handleAddUser} 
          onDeleteUser={handleDeleteUser} 
        />
      )}

      {editingTodo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-[#1e293b] w-full max-w-xl rounded-3xl border border-slate-700 shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="text-indigo-400" size={18} /> Edit Task Details
              </h3>
              <button onClick={() => setEditingTodo(null)} className="text-slate-500 hover:text-white transition-colors"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleUpdateTodo} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Task Title</label>
                <input 
                  type="text"
                  value={editingTodo.title}
                  onChange={(e) => setEditingTodo({...editingTodo, title: e.target.value})}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Description</label>
                <textarea 
                  value={editingTodo.description}
                  onChange={(e) => setEditingTodo({...editingTodo, description: e.target.value})}
                  className="w-full h-32 bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Priority</label>
                  <select 
                    value={editingTodo.priority}
                    onChange={(e) => setEditingTodo({...editingTodo, priority: e.target.value as Priority})}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white"
                  >
                    {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Category</label>
                  <select 
                    value={editingTodo.category}
                    onChange={(e) => setEditingTodo({...editingTodo, category: e.target.value as Category})}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white"
                  >
                    {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setEditingTodo(null)} className="px-6 py-2.5 text-slate-400 hover:text-white font-semibold">Cancel</button>
                <button type="submit" className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg">
                  <Save size={18} /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isVoiceActive && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] animate-in slide-in-from-bottom-8">
           <div className="bg-indigo-600 px-8 py-4 rounded-full shadow-2xl shadow-indigo-500/50 flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 animate-ping rounded-full bg-white/30"></div>
                <div className="relative bg-white p-2 rounded-full"><Mic className="text-indigo-600" size={20} /></div>
              </div>
              <p className="text-white font-bold text-sm">Voice Active...</p>
              <button onClick={() => setIsVoiceActive(false)} className="ml-4 text-indigo-100 hover:text-white"><X size={18} /></button>
           </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
