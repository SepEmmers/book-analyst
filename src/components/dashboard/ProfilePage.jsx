import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { User, BookOpen, Clock, Settings, Save, Loader2, LogOut, Check } from 'lucide-react';
import { validateUsername } from '../../utils/validation';

const ProfilePage = ({ user, onViewBook }) => {
  const [profile, setProfile] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [username, setUsername] = useState('');
  
  useEffect(() => {
    fetchProfileAndBooks();
  }, [user]);

  const fetchProfileAndBooks = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch Profile
      let { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      // If no profile exists (older user), create one locally to show
      if (!profileData && !profileError) {
          // It might be because the trigger didn't exist when they signed up
      }

      // 2. Fetch User's Books
      const { data: booksData, error: booksError } = await supabase
        .from('books')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (profileData) {
          setProfile(profileData);
          setUsername(profileData.username || '');
      }
      if (booksData) setBooks(booksData);

    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    const validation = validateUsername(username);
    if (!validation.valid) {
        alert(validation.error);
        return;
    }
    
    setUpdating(true);
    try {
      const updates = {
        id: user.id,
        username,
        updated_at: new Date(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);
      if (error) throw error;
      alert('Profiel bijgewerkt!');
      setProfile({ ...profile, ...updates });
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setUpdating(false);
    }
  };

  const stats = {
      totalBooks: books.length,
      publicBooks: books.filter(b => b.is_public).length,
      totalWords: books.reduce((acc, b) => acc + (b.analysis_json?.meta?.wordCount || 0), 0)
  };

  if (loading) {
      return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-8 animate-in fade-in duration-500">
      
      {/* Header Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col md:flex-row items-center md:items-start gap-8">
        <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white shadow-lg shrink-0">
            <span className="text-3xl font-bold">{username ? username[0].toUpperCase() : user.email[0].toUpperCase()}</span>
        </div>
        
        <div className="flex-1 text-center md:text-left space-y-4 w-full">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">{username || 'Naamloos Profiel'}</h1>
                <p className="text-slate-500 font-mono text-sm">{user.email}</p>
            </div>

            {/* Username Editor */}
            <div className="flex items-center gap-2 max-w-sm mx-auto md:mx-0">
                <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Kies een gebruikersnaam"
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    maxLength={20}
                />
                <button 
                    onClick={updateProfile}
                    disabled={updating || username === profile?.username}
                    className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                    {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Opslaan
                </button>
            </div>
        </div>

        <div className="flex gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-center">
                <span className="block text-2xl font-bold text-indigo-600">{stats.totalBooks}</span>
                <span className="text-xs text-slate-500 uppercase tracking-wide">Boeken</span>
            </div>
            <div className="w-px bg-slate-200"></div>
            <div className="text-center">
                <span className="block text-2xl font-bold text-indigo-600">{(stats.totalWords / 1000).toFixed(1)}k</span>
                <span className="text-xs text-slate-500 uppercase tracking-wide">Woorden</span>
            </div>
        </div>
      </div>

      {/* Books Grid */}
      <div>
         <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            Mijn Boekenkast
         </h2>
         
         {books.length === 0 ? (
             <div className="text-center p-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                 <p className="text-slate-400">Je hebt nog geen boeken geüpload.</p>
             </div>
         ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {books.map(book => (
                     <div 
                        key={book.id} 
                        onClick={() => onViewBook(book)}
                        className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group relative overflow-hidden"
                     >
                        <div className="absolute top-0 right-0 p-2">
                             {book.is_public && <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold">PUBLIEK</span>}
                        </div>
                        <h3 className="font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">{book.title}</h3>
                        <p className="text-sm text-slate-500 mb-4">{(typeof book.analysis_json.meta?.wordCount === 'number' ? book.analysis_json.meta.wordCount : 0).toLocaleString()} woorden</p>
                        
                        <div className="flex items-center gap-2 mt-2">
                           <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 font-medium">
                            {book.genre || 'Onbekend'}
                           </span>
                           <span className="text-xs text-slate-400 ml-auto">
                            {new Date(book.created_at).toLocaleDateString()}
                           </span>
                        </div>
                     </div>
                 ))}
             </div>
         )}
      </div>

      <div className="flex justify-center pt-8">
        <button 
           onClick={() => supabase.auth.signOut()}
           className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-2 px-6 py-2 rounded-full hover:bg-red-50 transition-all"
        >
            <LogOut className="w-4 h-4" />
            Uitloggen
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
