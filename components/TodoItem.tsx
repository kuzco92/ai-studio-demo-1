
import React from 'react';
import { Todo, Priority, Category } from '../types';
import { CheckCircle2, Circle, Trash2, Calendar, Tag, ChevronRight } from 'lucide-react';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onPriorityToggle: (id: string, current: Priority) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggle, onDelete, onEdit, onPriorityToggle }) => {
  const priorityColors = {
    [Priority.LOW]: 'bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20',
    [Priority.MEDIUM]: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20',
    [Priority.HIGH]: 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20',
  };

  const categoryIcons = {
    [Category.WORK]: '💼',
    [Category.PERSONAL]: '🏠',
    [Category.HEALTH]: '🧘',
    [Category.URGENT]: '🚨',
  };

  return (
    <div className={`group relative flex items-start gap-4 p-5 rounded-2xl border transition-all duration-300 ${
      todo.completed 
        ? 'bg-slate-800/10 border-slate-800 opacity-60' 
        : 'bg-slate-800/40 border-slate-700 hover:border-slate-500 hover:shadow-lg hover:shadow-black/20'
    }`}>
      <button 
        onClick={(e) => { e.stopPropagation(); onToggle(todo.id); }}
        className="mt-1 transition-transform active:scale-90"
      >
        {todo.completed ? (
          <CheckCircle2 className="w-6 h-6 text-indigo-500" />
        ) : (
          <Circle className="w-6 h-6 text-slate-500 hover:text-indigo-400" />
        )}
      </button>

      <div 
        className="flex-1 min-w-0 cursor-pointer" 
        onClick={() => onEdit(todo)}
      >
        <div className="flex items-center gap-2 mb-1">
          <button 
            onClick={(e) => { e.stopPropagation(); onPriorityToggle(todo.id, todo.priority); }}
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors uppercase ${priorityColors[todo.priority]}`}
          >
            {todo.priority}
          </button>
          <span className="text-[10px] text-slate-500 flex items-center gap-1 uppercase font-medium">
            <Tag size={10} /> {todo.category}
          </span>
        </div>
        <h3 className={`text-base font-semibold truncate flex items-center gap-2 ${todo.completed ? 'line-through text-slate-500' : 'text-slate-100'}`}>
          {todo.title}
          {!todo.completed && <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500" />}
        </h3>
        <p className={`text-sm mt-1 line-clamp-1 ${todo.completed ? 'text-slate-600' : 'text-slate-400'}`}>
          {todo.description || '상세 내용 없음'}
        </p>
        
        <div className="mt-3 flex items-center gap-4 text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
          <span className="flex items-center gap-1.5">
            <Calendar size={10} />
            {new Date(todo.createdAt).toLocaleDateString()}
          </span>
          <span className="flex items-center gap-1.5">
            {categoryIcons[todo.category]} {todo.category}
          </span>
        </div>
      </div>

      <button 
        onClick={(e) => { e.stopPropagation(); onDelete(todo.id); }}
        className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-red-500 transition-all active:scale-90"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  );
};

export default TodoItem;
