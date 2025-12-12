import React, { useState, useEffect } from 'react';
import { Search, Loader2, BookOpen, AlertCircle } from 'lucide-react';
import { supabase, checkSupabaseConfig } from '../lib/supabase';
import BookCard from './ui/BookCard';

const HomePage = ({ onViewBook, onUploadClick }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    if (!checkSupabaseConfig()) {
        setError("Supabase is niet geconfigureerd. Volg de instructies in BACKEND_SETUP.md.");
        setLoading(false);
        return;
    }

    try {
        setLoading(true);
        const { data, error } = await supabase
            .from('books')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);
            
        if (error) throw error;
        setBooks(data);
    } catch (err) {
        console.error("Error fetching books:", err);
        setError("Kon boeken niet laden. Is de database tabel 'books' aangemaakt?");
    } finally {
        setLoading(false);
    }
  };

  const handleLike = async (id) => {
      // Optimistic update
      setBooks(books.map(b => b.id === id ? { ...b, likes_count: (b.likes_count || 0) + 1 } : b));
      
      if (supabase) {
        // This is a naive increment. In real app use RPC or transactions.
        const book = books.find(b => b.id === id);
        await supabase
            .from('books')
            .update({ likes_count: (book.likes_count || 0) + 1 })
            .eq('id', id);
      }
  };

  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (b.author && b.author.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-10">
      
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-8 bg-gradient-to-br from-indigo-600 to-violet-600 p-10 rounded-3xl shadow-xl text-white relative overflow-hidden">
        <div className="relative z-10 max-w-xl space-y-4">
            <h1 className="text-4xl font-extrabold tracking-tight">Ontdek de diepgang van literatuur.</h1>
            <p className="text-indigo-100 text-lg leading-relaxed">
                Een community-platform voor tekstanalyse. Deel jouw analyses, ontdek nieuwe inzichten en vergelijk boeken.
            </p>
            <button 
                onClick={onUploadClick}
                className="bg-white text-indigo-600 hover:bg-indigo-50 px-6 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95 flex items-center gap-2"
            >
                <BookOpen className="w-5 h-5" />
                Start Nieuwe Analyse
            </button>
        </div>
        
        {/* Abstract Shapes Decoration */}
        <div className="absolute right-0 bottom-0 opacity-10">
            <BookOpen className="w-80 h-80 transform translate-x-1/4 translate-y-1/4" />
        </div>
      </div>

      {/* Tools & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between sticky top-0 bg-slate-50/80 backdrop-blur-md py-4 z-20">
        <h2 className="text-2xl font-bold text-slate-800">Community Bibliotheek</h2>
        
        <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
                type="text" 
                placeholder="Zoek op titel of auteur..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
        </div>
      </div>

      {/* Feed */}
      {error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center text-red-700">
              <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p className="font-medium">{error}</p>
          </div>
      ) : loading ? (
          <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
          </div>
      ) : filteredBooks.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
              <p>Geen boeken gevonden. Wees de eerste die iets publiceert!</p>
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredBooks.map(book => (
                  <BookCard 
                    key={book.id} 
                    book={book} 
                    onClick={() => onViewBook(book)}
                    onLike={handleLike}
                  />
              ))}
          </div>
      )}
    </div>
  );
};

export default HomePage;
