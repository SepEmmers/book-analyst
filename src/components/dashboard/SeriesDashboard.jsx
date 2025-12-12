import React, { useMemo } from 'react';
import { 
  Type, BookOpen, Zap, MessageCircle, Activity, Info, BarChart2
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import StatBox from '../ui/StatBox';
import { getContextForMetric } from '../../utils/benchmarks';

const SeriesDashboard = ({ series, onBookClick, onStatClick }) => {
  const aggregatedStats = useMemo(() => {
    if (!series || !series.books || series.books.length === 0) return null;
    // ... (Aggregation logic remains same, but we use the results)
    
    // REDUNDANCY: We need to re-copy logic from previous view or assume it's same. 
    // It's cleaner to keep the memo logic as is, just updating the return JSX.
    
    // RE-CALUCULATE (since we are replacing the whole file content in a way, or just the render part. 
    // Wait, the tool is replace_file_content but I don't want to re-write the specific memo logic if I can avoid it.
    // But since I need to return the FULL component function body structure...
    
    const totalWords = series.books.reduce((sum, b) => sum + b.analysis.meta.wordCount, 0);
    const avgLix = series.books.reduce((sum, b) => sum + parseFloat(b.analysis.metrics.lixScore), 0) / series.books.length;
    const avgTtr = series.books.reduce((sum, b) => sum + parseFloat(b.analysis.metrics.ttr), 0) / series.books.length;
    const avgDialogue = series.books.reduce((sum, b) => sum + parseFloat(b.analysis.metrics.dialoguePercentage), 0) / series.books.length;
    const avgVolatility = series.books.reduce((sum, b) => sum + parseFloat(b.analysis.metrics.sentimentVolatility), 0) / series.books.length;
    const avgSentenceLen = series.books.reduce((sum, b) => sum + parseFloat(b.analysis.meta.avgSentenceLength), 0) / series.books.length;

    let mergedTimeline = [];
    let currentSegmentOffset = 0;
    series.books.forEach((book, index) => {
      const bookTimeline = book.analysis.visuals.sentimentTimeline.map(point => ({
        ...point,
        segment: point.segment + currentSegmentOffset,
        bookName: book.name
      }));
      mergedTimeline = [...mergedTimeline, ...bookTimeline];
      currentSegmentOffset += bookTimeline.length;
    });

    const charMap = {};
    series.books.forEach(book => {
      book.analysis.visuals.topCharacters.forEach(({ name, count }) => {
        charMap[name] = (charMap[name] || 0) + count;
      });
    });
    
    const topCharacters = Object.entries(charMap)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    return {
      wordCount: totalWords,
      lixScore: avgLix.toFixed(1),
      ttr: avgTtr.toFixed(1),
      dialoguePercentage: avgDialogue.toFixed(1),
      sentimentVolatility: avgVolatility.toFixed(1),
      avgSentenceLength: avgSentenceLen.toFixed(1),
      timeline: mergedTimeline,
      topCharacters
    };
  }, [series]);

  if (!aggregatedStats) return <div>Laden...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Series Header Info - IMPROVED LAYOUT */}
      <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 p-8 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
            <BookOpen className="w-64 h-64 text-indigo-900" />
        </div>
        
        <div className="relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
                <div>
                    <span className="text-indigo-600 font-bold tracking-wider text-xs uppercase mb-2 block">Serie Analyse</span>
                    <h2 className="text-4xl font-extrabold text-slate-900 mb-2">{series.name}</h2>
                    <p className="text-slate-500 text-lg">
                        {series.books.length} Boeken &bull; {aggregatedStats.wordCount.toLocaleString()} Woorden totaal
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {series.books.map((b, i) => (
                    <button 
                        key={b.id} 
                        onClick={() => onBookClick(b.id)}
                        className="text-left bg-white/60 hover:bg-white border border-indigo-100 hover:border-indigo-300 p-3 rounded-xl transition-all shadow-sm hover:shadow-md group active:scale-95"
                    >
                        <span className="text-[10px] font-bold text-indigo-400 block mb-1">DEEL {i+1}</span>
                        <span className="text-xs font-semibold text-slate-700 group-hover:text-indigo-700 line-clamp-2">{b.name}</span>
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* Aggregated Stats - CLICKABLE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatBox 
          label="Totaal Woorden" 
          value={aggregatedStats.wordCount.toLocaleString()} 
          context="Opgesomd voor hele serie"
          icon={Type}
        />
        <StatBox 
          label="Gem. LIX" 
          value={aggregatedStats.lixScore} 
          context={getContextForMetric('lixScore', aggregatedStats.lixScore)}
          icon={BookOpen} 
          color="text-orange-600"
          onClick={() => onStatClick('lixScore', aggregatedStats.lixScore, getContextForMetric('lixScore', aggregatedStats.lixScore))}
        />
        <StatBox 
          label="Gem. Rijkdom" 
          value={`${aggregatedStats.ttr}%`} 
          context={getContextForMetric('ttr', aggregatedStats.ttr)}
          icon={Zap} 
          color="text-yellow-600"
          onClick={() => onStatClick('ttr', `${aggregatedStats.ttr}%`, getContextForMetric('ttr', aggregatedStats.ttr))}
        />
        <StatBox 
          label="Gem. Dialoog" 
          value={`${aggregatedStats.dialoguePercentage}%`} 
          context={getContextForMetric('dialoguePercentage', aggregatedStats.dialoguePercentage)}
          icon={MessageCircle} 
          color="text-blue-600"
          onClick={() => onStatClick('dialoguePercentage', `${aggregatedStats.dialoguePercentage}%`, getContextForMetric('dialoguePercentage', aggregatedStats.dialoguePercentage))}
        />
        <StatBox 
          label="Gem. Grilligheid" 
          value={aggregatedStats.sentimentVolatility} 
          context={getContextForMetric('sentimentVolatility', aggregatedStats.sentimentVolatility)}
          icon={Activity} 
          color="text-pink-600"
          onClick={() => onStatClick('sentimentVolatility', aggregatedStats.sentimentVolatility, getContextForMetric('sentimentVolatility', aggregatedStats.sentimentVolatility))}
        />
        <StatBox 
          label="Gem. Zinslengte" 
          value={aggregatedStats.avgSentenceLength} 
          context={getContextForMetric('avgSentenceLength', aggregatedStats.avgSentenceLength)}
          icon={Info} 
          color="text-cyan-600"
          onClick={() => onStatClick('avgSentenceLength', aggregatedStats.avgSentenceLength, getContextForMetric('avgSentenceLength', aggregatedStats.avgSentenceLength))}
        />
      </div>

      {/* Series Timeline */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
         <div className="mb-6">
           <h3 className="font-bold text-lg text-slate-800">De Emotionele Reis (Serie)</h3>
           <p className="text-slate-500 text-sm">
             De emotionele curve over alle boeken heen.
           </p>
         </div>
         <div className="h-80 w-full">
           <ResponsiveContainer width="100%" height="100%">
             <AreaChart data={aggregatedStats.timeline}>
               <defs>
                 <linearGradient id="seriesGrad" x1="0" y1="0" x2="0" y2="1">
                   <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                   <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.4}/>
                 </linearGradient>
               </defs>
               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
               <XAxis dataKey="segment" tick={false} />
               <YAxis stroke="#94a3b8" fontSize={12} />
               <RechartsTooltip 
                 content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                    return (
                        <div className="bg-white p-3 border border-slate-100 shadow-xl rounded-lg text-xs">
                        <p className="font-bold text-slate-800 mb-1">{payload[0].payload.bookName}</p>
                        <p className="text-indigo-600">Sentiment: {payload[0].value.toFixed(1)}</p>
                        </div>
                    );
                    }
                    return null;
                }}
               />
               <Area type="monotone" dataKey="sentiment" stroke="#6366f1" fill="url(#seriesGrad)" strokeWidth={2} />
             </AreaChart>
           </ResponsiveContainer>
         </div>
      </div>

      {/* Series Characters */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
         <h3 className="font-bold text-lg text-slate-800 mb-6">Top Karakters in Serie</h3>
         <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
            <BarChart data={aggregatedStats.topCharacters} layout="vertical" margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={120} tick={{fontWeight: 500}} />
                <RechartsTooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={30}>
                {aggregatedStats.topCharacters.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index < 3 ? '#4f46e5' : '#818cf8'} />
                ))}
                </Bar>
            </BarChart>
            </ResponsiveContainer>
         </div>
      </div>

    </div>
  );
};

export default SeriesDashboard;
