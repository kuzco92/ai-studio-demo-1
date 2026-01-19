
import React, { useState } from 'react';
import { Todo, Priority, Category } from '../types';
import { CheckCircle2, Circle, Trash2, Calendar, Tag, ChevronRight, GripVertical, Clock, Check } from 'lucide-react';

interface TodoItemProps {
  todo: Todo;
  index: number;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onPriorityToggle: (id: string, current: Priority) => void;
  onDragStart: (index: number) => void;
  onDragOver: (index: number) => void;
  onDrop: () => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ 
  todo, 
  index,
  onToggle, 
  onDelete, 
  onEdit, 
  onPriorityToggle,
  onDragStart,
  onDragOver,
  onDrop
}) => {
  const [isHoveredForDrop, setIsHoveredForDrop] = useState(false);

  const priorityColors = {
    [Priority.LOW]: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    [Priority.MEDIUM]: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    [Priority.HIGH]: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  };

  const categoryIcons = {
    [Category.WORK]: '💼',
    [Category.PERSONAL]: '🏠',
    [Category.HEALTH]: '🧘',
    [Category.URGENT]: '🚨',
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div 
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => {
        e.preventDefault();
        setIsHoveredForDrop(true);
        onDragOver(index);
      }}
      onDragLeave={() => setIsHoveredForDrop(false)}
      onDrop={() => {
        setIsHoveredForDrop(false);
        onDrop();
      }}
      className={`group relative flex gap-4 p-6 rounded-[2rem] border transition-all duration-300 cursor-default ${
        todo.completed 
          ? 'bg-slate-900/40 border-slate-800' 
          : 'bg-slate-800/40 border-slate-700/50 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/5'
      } ${isHoveredForDrop ? 'border-indigo-500 ring-2 ring-indigo-500/20 scale-[1.02] bg-indigo-500/5' : ''}`}
    >
      {/* 1. Left Control Area (Drag + Toggle) */}
      <div className="flex flex-col items-center gap-3 shrink-0">
        <div className="cursor-grab active:cursor-grabbing text-slate-600 group-hover:text-slate-400 transition-colors p-1">
          <GripVertical size={18} />
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onToggle(todo.id); }}
          className="transition-transform active:scale-90"
        >
          {todo.completed ? (
            <div className="bg-indigo-600 rounded-full p-1 shadow-lg shadow-indigo-600/40">
              <Check size={16} className="text-white" strokeWidth={3} />
            </div>
          ) : (
            <Circle className="w-6 h-6 text-slate-600 hover:text-indigo-400" />
          )}
        </button>
      </div>

      {/* 2. Content Area */}
      <div 
        className="flex-1 min-w-0 flex flex-col cursor-pointer" 
        onClick={() => onEdit(todo)}
      >
        <div className="flex items-center gap-2 mb-2">
          <button 
            onClick={(e) => { e.stopPropagation(); onPriorityToggle(todo.id, todo.priority); }}
            className={`text-[9px] font-black px-2 py-0.5 rounded-md border transition-all uppercase tracking-tighter ${priorityColors[todo.priority]}`}
          >
            {todo.priority}
          </button>
          <span className="text-[9px] text-slate-500 flex items-center gap-1 uppercase font-bold tracking-widest bg-slate-900/50 px-2 py-0.5 rounded-md border border-slate-800">
            {categoryIcons[todo.category]} {todo.category}
          </span>
        </div>

        <h3 className={`text-lg font-bold truncate leading-tight ${todo.completed ? 'line-through text-slate-500' : 'text-slate-100'}`}>
          {todo.title}
        </h3>
        <p className={`text-sm mt-1 line-clamp-2 leading-relaxed ${todo.completed ? 'text-slate-600' : 'text-slate-400'}`}>
          {todo.description || '상세 내용 없음'}
        </p>
        
        {/* 3. Bottom Meta Info (Improved Grid Layout) */}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[10px] text-slate-500 font-semibold">
            <Calendar size={12} className="text-slate-600" />
            <span>Created:</span>
            <span className="text-slate-300">{formatDate(todo.createdAt)}</span>
          </div>

          {todo.completed && todo.completedAt && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/5 border border-emerald-500/20 text-[10px] text-emerald-500 font-bold animate-in fade-in slide-in-from-left-2">
              <CheckCircle2 size={12} />
              <span>Completed:</span>
              <span>{formatDate(todo.completedAt)}</span>
            </div>
          )}
        </div>
      </div>

      {/* 4. Delete Action */}
      <div className="flex items-start shrink-0">
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(todo.id); }}
          className="opacity-0 group-hover:opacity-100 p-2 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all active:scale-90"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Subtle indicator for completion */}
      {todo.completed && (
        <div className="absolute top-0 right-0 p-4">
           <div className="bg-emerald-500/20 text-emerald-500 p-1 rounded-full border border-emerald-500/20">
             <Check size={10} strokeWidth={4} />
           </div>
        </div>
      )}
    </div>
  );
};

export default TodoItem;
