import React from 'react';
import { HelpCircle } from 'lucide-react';

const StatBox = ({ label, value, context, icon: Icon, color = "text-slate-600", onClick }) => {
  const isClickable = !!onClick;

  return (
    <div 
      onClick={isClickable ? onClick : undefined}
      className={`
        bg-white p-4 rounded-xl border border-slate-200 shadow-sm 
        flex flex-col justify-between h-full relative overflow-hidden group
        ${isClickable ? 'cursor-pointer hover:shadow-md hover:border-indigo-200 hover:-translate-y-0.5 transition-all active:scale-95' : ''}
      `}
    >
      {/* Background decoration */}
      {Icon && (
        <Icon className={`absolute -right-4 -bottom-4 w-24 h-24 text-slate-50 transform rotate-12 transition-transform ${isClickable ? 'group-hover:scale-110' : ''}`} />
      )}

      <div className="relative z-10 flex justify-between items-start mb-2">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{label}</p>
        {Icon && <Icon className={`w-4 h-4 ${color} opacity-70 group-hover:opacity-100 transition-opacity`} />}
      </div>
      
      <div className="relative z-10 mb-2">
        <p className="text-2xl font-extrabold text-slate-800 tracking-tight">{value}</p>
      </div>
      
      {context && (
        <div className="relative z-10 flex items-start gap-1.5 mt-2 pt-2 border-t border-slate-50/50">
            <HelpCircle className="w-3 h-3 text-indigo-400 mt-0.5 flex-shrink-0" />
            <p className="text-[11px] leading-tight text-slate-500 font-medium">
                {context}
            </p>
        </div>
      )}
    </div>
  );
};

export default StatBox;
