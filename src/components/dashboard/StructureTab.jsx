import React from 'react';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, Cell, ResponsiveContainer } from 'recharts';

const StructureTab = ({ activeBook }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-500">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-2">Zinslengte Ritme</h3>
        <p className="text-xs text-slate-500 mb-4">
          Korte zinnen zorgen voor snelheid en actie. Lange zinnen voor nuance en beschrijving.
        </p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activeBook.analysis.visuals.sentenceStructureData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{fontSize: 10}} interval={0} />
              <YAxis />
              <RechartsTooltip cursor={{fill: 'transparent'}} />
              <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
                {activeBook.analysis.visuals.sentenceStructureData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#60a5fa' : index === 1 ? '#3b82f6' : index === 2 ? '#2563eb' : '#1d4ed8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-4">Technische Details</h3>
        <ul className="space-y-4">
          <li className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-600 text-sm">Leestijd (gem.)</span>
            <span className="font-bold text-slate-800">{activeBook.analysis.meta.readTime}</span>
          </li>
          <li className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-600 text-sm">Vraagzinnen</span>
            <div className="text-right">
                <span className="font-bold text-slate-800 block">{activeBook.analysis.metrics.questionRatio}%</span>
                <span className="text-[10px] text-slate-400 block">Normaal: ~5-10%</span>
            </div>
          </li>
          <li className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-600 text-sm">Langste woord</span>
            <span className="font-mono text-indigo-600 font-bold text-sm truncate max-w-[150px]" title={activeBook.analysis.meta.longestWord}>
              {activeBook.analysis.meta.longestWord}
            </span>
          </li>
        </ul>
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
            <h4 className="text-xs font-bold text-yellow-800 uppercase mb-1">Analyse Tip</h4>
            <p className="text-xs text-yellow-700">
                Een hoog percentage complexe zinnen (&gt;25 woorden) in combinatie met een lage dialoogscore wijst vaak op oudere literatuur of academische teksten.
            </p>
        </div>
      </div>
    </div>
  );
};

export default StructureTab;
