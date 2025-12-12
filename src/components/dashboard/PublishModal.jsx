import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { X, Globe, User, Search, Book } from 'lucide-react';
import { validateBookTitle } from '../../utils/validation';

const PublishModal = ({ isOpen, onClose, book, onConfirm }) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState(book.name);
  const [author, setAuthor] = useState(book.author || '');
  const [loading, setLoading] = useState(false);
  
  const [existingAuthors, setExistingAuthors] = useState([]);
  const [filteredAuthors, setFilteredAuthors] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
     // Fetch existing specific authors for autocomplete
     const fetchAuthors = async () => {
         const { data } = await supabase
            .from('books')
            .select('author')
            .not('author', 'is', null)
            .neq('author', 'Onbekend'); // Don't suggest 'Unknown'
         
         if (data) {
             const uniqueAuthors = [...new Set(data.map(d => d.author))].sort();
             setExistingAuthors(uniqueAuthors);
         }
     };
     fetchAuthors();
  }, []);

  const handleAuthorChange = (val) => {
      setAuthor(val);
      if (val.length > 0) {
          const matched = existingAuthors.filter(a => a.toLowerCase().includes(val.toLowerCase()));
          setFilteredAuthors(matched);
          setShowSuggestions(true);
      } else {
          setShowSuggestions(false);
      }
  };

  const selectAuthor = (val) => {
      setAuthor(val);
      setShowSuggestions(false);
  };

  const handleSubmit = () => {
      // Validate
      const titleCheck = validateBookTitle(title);
      if (!titleCheck.valid) {
          alert(titleCheck.error);
          return;
      }
      if (!author.trim()) {
          alert("Vul een auteur in (of 'Onbekend').");
          return;
      }

      onConfirm(title, author);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
           <div>
               <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                   <Globe className="w-5 h-5 text-indigo-600" />
                   Publiceren
               </h3>
               <p className="text-xs text-slate-500">Deel je analyse met de wereld</p>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
               <X className="w-5 h-5" />
           </button>
        </div>

        <div className="p-6 space-y-6">
            
            {/* Title Input */}
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Titel van het Boek</label>
                <div className="relative">
                    <Book className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    <input 
                        type="text" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                        placeholder="Titel..."
                    />
                </div>
            </div>

            {/* Author Input (with Custom Search/Select) */}
            <div className="relative">
                <label className="block text-sm font-bold text-slate-700 mb-2">Auteur</label>
                <div className="relative">
                    <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    <input 
                        type="text" 
                        value={author}
                        onChange={(e) => handleAuthorChange(e.target.value)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        onFocus={() => author && handleAuthorChange(author)}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                        placeholder="Zoek of typ auteur..."
                    />
                    <div className="absolute right-3 top-3">
                        <Search className="w-4 h-4 text-slate-300" />
                    </div>
                </div>

                {/* Suggestions Dropdown */}
                {showSuggestions && filteredAuthors.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-20 max-h-48 overflow-y-auto">
                        {filteredAuthors.map(auth => (
                            <button
                                key={auth}
                                onClick={() => selectAuthor(auth)}
                                className="w-full text-left px-4 py-2 hover:bg-indigo-50 text-sm text-slate-700 border-b border-slate-50 last:border-0"
                            >
                                {auth}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="bg-indigo-50 p-4 rounded-xl text-indigo-900 text-sm border border-indigo-100">
                <p><strong>Let op:</strong> Dit boek wordt zichtbaar op de publieke Home pagina. Iedereen kan jouw analyse zien.</p>
            </div>

        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
            <button 
                onClick={onClose}
                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors"
            >
                Annuleren
            </button>
            <button 
                onClick={handleSubmit}
                className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-md transition-all active:scale-95"
            >
                Nu Publiceren
            </button>
        </div>

      </div>
    </div>
  );
};

export default PublishModal;
