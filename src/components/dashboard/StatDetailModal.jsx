import React from 'react';
import { Info, Target, TrendingUp, AlertCircle } from 'lucide-react';

// Static definitions for each metric
const METRIC_DEFINITIONS = {
  lixScore: {
    title: 'LIX Leesbaarheidsscore',
    description: 'De LIX-score (Läsbarhetsindex) is een maatstaf voor de complexiteit van een tekst. Het wordt berekend op basis van de gemiddelde zinslengte en het percentage woorden van meer dan 6 letters.',
    interpretation: [
      { range: '< 30', text: 'Zeer makkelijk (Kinderboeken)', color: 'text-green-600' },
      { range: '30 - 40', text: 'Makkelijk (Fictie, Populaire romans)', color: 'text-blue-600' },
      { range: '40 - 50', text: 'Gemiddeld (Krantenartikelen)', color: 'text-indigo-600' },
      { range: '50 - 60', text: 'Moeilijk (Vakliteratuur)', color: 'text-orange-600' },
      { range: '> 60', text: 'Zeer moeilijk (Wetenschappelijk, Academisch)', color: 'text-red-600' }
    ]
  },
  ttr: {
    title: 'Type-Token Ratio (Rijkdom)',
    description: 'De Type-Token Ratio meet de diversiteit van de woordenschat. Het is het percentage unieke woorden ten opzichte van het totaal aantal woorden.',
    interpretation: [
      { range: '< 5%', text: 'Zeer repetitief (Kinderrijmpjes)', color: 'text-red-600' },
      { range: '5% - 10%', text: 'Normaal (De meeste romans)', color: 'text-blue-600' },
      { range: '> 10%', text: 'Zeer rijk (Poëzie, Complexe literatuur)', color: 'text-green-600' }
    ]
  },
  sentimentVolatility: {
    title: 'Emotionele Grilligheid',
    description: 'Dit meet hoe sterk de emoties variëren doorheen het boek. Een hoge waarde betekent veel afwisseling tussen positieve en negatieve momenten.',
    interpretation: [
      { range: 'Laag', text: 'Stabiele sfeer, weinig plotse wendingen.', color: 'text-slate-600' },
      { range: 'Hoog', text: 'Dramatisch, intense pieken en dalen.', color: 'text-purple-600' }
    ]
  },
  dialoguePercentage: {
    title: 'Dialoog Percentage',
    description: 'Het percentage van de tekst dat wordt herkend als gesproken woord (tussen aanhalingstekens).',
    interpretation: [
      { range: '< 10%', text: 'Beschrijvend / Beschouwend', color: 'text-slate-600' },
      { range: '10% - 30%', text: 'Gebalanceerd verhaal', color: 'text-blue-600' },
      { range: '> 30%', text: 'Dialoog-gedreven (Theater, Snelle actie)', color: 'text-green-600' }
    ]
  },
  avgSentenceLength: {
    title: 'Gemiddelde Zinslengte',
    description: 'Het gemiddeld aantal woorden per zin.',
    interpretation: [
      { range: 'Kort', text: 'Snelle leessnelheid, actiegericht.', color: 'text-green-600' },
      { range: 'Lang', text: 'Beschrijvend, traag tempo, complex.', color: 'text-orange-600' }
    ]
  }
};

const StatDetailModal = ({ metricKey, value, context }) => {
  const info = METRIC_DEFINITIONS[metricKey] || {
    title: 'Statistiek Detail',
    description: 'Gedetailleerde informatie over deze meting.',
    interpretation: []
  };

  return (
    <div className="space-y-6">
      <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100 flex items-start gap-4">
        <div className="bg-white p-3 rounded-lg shadow-sm text-indigo-600">
           <Info className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-bold text-indigo-900 text-lg mb-1">{value}</h4>
          <p className="text-indigo-700 font-medium">{context}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
            <h5 className="flex items-center gap-2 font-bold text-slate-800 mb-2">
                <Target className="w-4 h-4 text-slate-400" />
                Wat betekent dit?
            </h5>
            <p className="text-slate-600 leading-relaxed text-sm">
                {info.description}
            </p>
        </div>
        
        {info.interpretation && info.interpretation.length > 0 && (
            <div>
                 <h5 className="flex items-center gap-2 font-bold text-slate-800 mb-2">
                    <TrendingUp className="w-4 h-4 text-slate-400" />
                    Interpretatie
                </h5>
                <ul className="space-y-2">
                    {info.interpretation.map((item, idx) => (
                        <li key={idx} className="flex items-center justify-between text-sm p-2 rounded bg-slate-50 border border-slate-100">
                            <span className="font-mono text-slate-500 font-medium">{item.range}</span>
                            <span className={`font-medium ${item.color}`}>{item.text}</span>
                        </li>
                    ))}
                </ul>
            </div>
        )}
        
        <div className="bg-orange-50 p-4 rounded-lg flex gap-3 text-sm text-orange-800 border-l-4 border-l-orange-400">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>
                <strong>Let op:</strong> Deze analyses zijn gebaseerd op algoritmes en kunnen afwijken door stijlvormen, creatief taalgebruik of scan-fouten in het bestand.
            </p>
        </div>
      </div>
    </div>
  );
};

export default StatDetailModal;
