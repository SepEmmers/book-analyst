import React from 'react';
import { Heart, BookOpen, User, Tag } from 'lucide-react';

const BookCard = ({ book, onClick, onLike }) => {
  const { title, author, genre, analysis_json, likes_count, created_at } = book;
  const analysis = typeof analysis_json === 'string' ? JSON.parse(analysis_json) : analysis_json;
  const { wordCount } = analysis.meta;

  return (
    <div 
      className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group overflow-hidden cursor-pointer flex flex-col h-full"
      onClick={onClick}
    >
      <div className="p-5 flex-1">
        <div className="flex justify-between items-start mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider rounded-md">
                <Tag className="w-3 h-3" />
                {genre || 'Algemeen'}
            </span>
            {analysis.lang && (
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 rounded uppercase">
                    {analysis.lang}
                </span>
            )}
        </div>

        <h3 className="font-bold text-slate-800 text-lg leading-tight mb-1 group-hover:text-indigo-600 transition-colors line-clamp-2">
            {title}
        </h3>
        
        <p className="text-slate-500 text-sm mb-4 flex items-center gap-1.5">
            <User className="w-3 h-3" />
            {author || 'Onbekend'}
        </p>

        <div className="flex gap-4 text-xs text-slate-400 font-medium">
            <span>{wordCount.toLocaleString()} woorden</span>
            <span>•</span>
            <span>{new Date(created_at).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="border-t border-slate-100 p-3 bg-slate-50/50 flex justify-between items-center transition-colors group-hover:bg-indigo-50/30">
        <button className="text-xs font-bold text-indigo-600 flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" />
            Bekijk Analyse
        </button>

        <button 
            onClick={(e) => { e.stopPropagation(); onLike && onLike(book.id); }}
            className="flex items-center gap-1.5 text-slate-400 hover:text-pink-500 transition-colors px-2 py-1 rounded-full hover:bg-pink-50"
        >
            <Heart className="w-4 h-4" />
            <span className="text-xs font-bold">{likes_count || 0}</span>
        </button>
      </div>
    </div>
  );
};

export default BookCard;
