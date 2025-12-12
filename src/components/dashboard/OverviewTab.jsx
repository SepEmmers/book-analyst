import React from 'react';
import { 
  Type, BookOpen, Zap, MessageCircle, Activity, Info, Layers, Tag, Trophy, User
} from 'lucide-react';
import { 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip as RechartsTooltip, ResponsiveContainer 
} from 'recharts';
import StatBox from '../ui/StatBox';
import { getContextForMetric } from '../../utils/benchmarks';
import { getBadges, predictGenre, predictAudience } from '../../utils/gamification';

const OverviewTab = ({ activeBook, onStatClick }) => {
  const { analysis } = activeBook;
  const { wordCount, readTime, avgSentenceLength } = analysis.meta;
  const { lixScore, ttr, dialoguePercentage, sentimentVolatility } = analysis.metrics;

  const badges = getBadges(analysis);
  const genre = predictGenre(analysis);
  const audience = predictAudience(lixScore);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* NEW: Insights & Identity Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 justify-between">
        <div className="flex flex-col gap-2">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Tag className="w-4 h-4 text-indigo-500" />
                Inschattingen
            </h3>
            <div className="flex flex-wrap gap-3">
                <div className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium border border-indigo-100 flex items-center gap-2">
                    <span>📚</span> {genre}
                </div>
                <div className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium border border-emerald-100 flex items-center gap-2">
                    <User className="w-3 h-3" /> {audience}
                </div>
            </div>
        </div>

        <div className="flex flex-col gap-2">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                Badges
            </h3>
            <div className="flex flex-wrap gap-2">
                {badges.length === 0 && <span className="text-slate-400 text-sm italic">Geen speciale badges verdiend.</span>}
                {badges.map(badge => (
                    <div key={badge.id} title={badge.desc} className="px-3 py-1.5 bg-slate-50 hover:bg-white text-slate-700 rounded-lg text-sm border border-slate-200 shadow-sm transition-all cursor-help flex items-center gap-2">
                        <span>{badge.icon}</span> 
                        <span className="font-medium">{badge.label}</span>
                    </div>
                ))}
            </div>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBox 
          label="Totaal Woorden" 
          value={wordCount.toLocaleString()} 
          context={`~${readTime} leestijd`}
          icon={Type}
        />
        <StatBox 
          label="LIX Score" 
          value={lixScore} 
          context={getContextForMetric('lixScore', lixScore)} 
          icon={BookOpen} 
          color="text-indigo-600"
          onClick={() => onStatClick && onStatClick('lixScore', lixScore, getContextForMetric('lixScore', lixScore))}
        />
        <StatBox 
          label="Woord Rijkdom" 
          value={`${ttr}%`} 
          context={getContextForMetric('ttr', ttr)} 
          icon={Zap} 
          color="text-yellow-600"
          onClick={() => onStatClick && onStatClick('ttr', `${ttr}%`, getContextForMetric('ttr', ttr))}
        />
        <StatBox 
          label="Sentiment Grilligheid" 
          value={sentimentVolatility} 
          context={getContextForMetric('sentimentVolatility', sentimentVolatility)} 
          icon={Activity} 
          color="text-pink-600"
          onClick={() => onStatClick && onStatClick('sentimentVolatility', sentimentVolatility, getContextForMetric('sentimentVolatility', sentimentVolatility))}
        />
        <StatBox 
          label="Dialoog %" 
          value={`${dialoguePercentage}%`} 
          context={getContextForMetric('dialoguePercentage', dialoguePercentage)} 
          icon={MessageCircle} 
          color="text-blue-600"
          onClick={() => onStatClick && onStatClick('dialoguePercentage', `${dialoguePercentage}%`, getContextForMetric('dialoguePercentage', dialoguePercentage))}
        />
        <StatBox 
          label="Gem. Zinslengte" 
          value={avgSentenceLength} 
          context={getContextForMetric('avgSentenceLength', avgSentenceLength)} 
          icon={Info} 
          color="text-cyan-600"
          onClick={() => onStatClick && onStatClick('avgSentenceLength', avgSentenceLength, getContextForMetric('avgSentenceLength', avgSentenceLength))}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radar Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-1">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-500" />
            Stilistisch Profiel
          </h3>
          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={activeBook.analysis.visuals.radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name={activeBook.name} dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.5} />
                <RechartsTooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 p-3 bg-indigo-50 rounded text-xs text-indigo-800">
            <strong>Interpretatie:</strong> Dit profiel toont de balans tussen actie, complexiteit en beschrijving. Een 'stekelige' vorm betekent een uitgesproken, specifieke stijl.
          </div>
        </div>

        {/* Word Cloud / Frequency */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2 flex flex-col">
          <h3 className="font-bold text-slate-800 mb-4">Dominante Woorden (Kernwoorden)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {activeBook.analysis.visuals.topWords.map((w, i) => (
              <div key={i} className="flex items-center justify-between bg-slate-50 p-2 rounded border border-slate-100 hover:border-indigo-200 transition-colors">
                <span className="text-sm font-medium text-slate-700 truncate mr-2">{w.text}</span>
                <span className="text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-bold">{w.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
