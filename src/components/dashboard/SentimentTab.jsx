import React from 'react';
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { getContextForMetric } from '../../utils/benchmarks';

const SentimentTab = ({ activeBook }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
       <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="mb-6 flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg text-slate-800">De Emotionele Reis</h3>
              <p className="text-slate-500 text-sm">
                Dit is de "Heartbeat" van het verhaal. Pieken zijn positieve momenten (overwinning, liefde), dalen zijn conflicten.
              </p>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-slate-600 block">Grilligheid: {activeBook.analysis.metrics.sentimentVolatility}</span>
              <span className="text-xs text-slate-400">{getContextForMetric('sentimentVolatility', activeBook.analysis.metrics.sentimentVolatility)}</span>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activeBook.analysis.visuals.sentimentTimeline}>
                <defs>
                  <linearGradient id="sentimentGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.4}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="segment" tick={false} label={{ value: 'Tijdslijn van het boek', position: 'insideBottom', offset: -5, fill: '#94a3b8' }}/>
                <YAxis stroke="#94a3b8" fontSize={12} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                  labelFormatter={() => ''}
                />
                <Area type="monotone" dataKey="sentiment" stroke="#6366f1" fill="url(#sentimentGrad)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
       </div>
    </div>
  );
};

export default SentimentTab;
