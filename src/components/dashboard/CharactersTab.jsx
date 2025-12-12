import React from 'react';
import { Users } from 'lucide-react';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, Cell, ResponsiveContainer } from 'recharts';

const CharactersTab = ({ activeBook }) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-500" />
                Cast Detectie
            </h3>
            <p className="text-sm text-slate-500">De namen die het vaakst opduiken in het verhaal.</p>
        </div>
      </div>
      
      <div className="h-96">
         <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activeBook.analysis.visuals.topCharacters} layout="vertical" margin={{ left: 20, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={120} tick={{fontWeight: 500}} />
              <RechartsTooltip cursor={{fill: 'transparent'}} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={30}>
                {activeBook.analysis.visuals.topCharacters.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#4f46e5' : index === 1 ? '#6366f1' : '#818cf8'} />
                ))}
              </Bar>
            </BarChart>
         </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CharactersTab;
