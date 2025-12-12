import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Mail, Lock, Loader2, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { validateUsername } from '../../utils/validation';

const LoginPage = ({ onLoginSuccess, switchToHome }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [useMagicLink, setUseMagicLink] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(''); // Only for signup
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (useMagicLink) {
        const { error } = await supabase.auth.signInWithOtp({ email });
        if (error) throw error;
        setMessage('Check je email voor de magic link!');
      } else if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // Success handled by App.jsx auth listener
      } else {
        // Sign Up with Validation
        const validation = validateUsername(username);
        if (!validation.valid) {
             throw new Error(validation.error);
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username }, // Will be picked up by our trigger
          },
        });
        if (error) throw error;
        setMessage('Account aangemaakt! Check je email voor de bevestiging.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-64 bg-indigo-600 skew-y-3 transform -translate-y-12 z-0"></div>
      
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl z-10 overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {isLogin ? 'Welkom Terug' : 'Start Je Reis'}
            </h2>
            <p className="text-slate-500 mt-2 text-sm">
              Literaire Diepte Analist 2.1
            </p>
          </div>

          {(error || message) && (
             <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                {error ? <AlertCircle className="w-5 h-5 shrink-0" /> : <CheckCircle className="w-5 h-5 shrink-0" />}
                <p className="text-sm font-medium">{error || message}</p>
             </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Gebruikersnaam</label>
                <div className="relative">
                   <input
                    type="text"
                    required
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full pl-4 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                    placeholder="Hoe mogen we je noemen?"
                   />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Email Adres</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  placeholder="naam@voorbeeld.com"
                />
              </div>
            </div>

            {/* Google Login Button */}
             <button
                type="button"
                onClick={async () => {
                    setLoading(true);
                    try {
                        const { error } = await supabase.auth.signInWithOAuth({
                            provider: 'google',
                            options: {
                                redirectTo: window.location.origin
                            }
                        });
                        if (error) throw error;
                    } catch (err) {
                        setError(err.message);
                        setLoading(false);
                    }
                }}
                className="w-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold py-3.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 mb-4"
             >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                <span>Doorgaan met Google</span>
             </button>

            <div className="flex items-center gap-4 mb-6">
                <div className="h-px bg-slate-200 flex-1"></div>
                <span className="text-xs text-slate-400 font-bold uppercase">Of met email</span>
                <div className="h-px bg-slate-200 flex-1"></div>
            </div>

            {!useMagicLink && (
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-1">Gebruikersnaam / Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-200 active:scale-95 flex items-center justify-center gap-2 group"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {useMagicLink 
                ? 'Stuur Magic Link' 
                : isLogin ? 'Inloggen' : 'Account Aanmaken'}
              {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="mt-6 flex flex-col items-center gap-4 text-sm text-slate-500">
             {isLogin && (
               <button 
                  type="button" 
                  onClick={() => setUseMagicLink(!useMagicLink)} 
                  className="hover:text-indigo-600 underline decoration-slate-300 underline-offset-4"
                >
                  {useMagicLink ? 'Gebruik wachtwoord' : 'Wachtwoord vergeten? Gebruik email link'}
               </button>
             )}

             <div className="w-full h-px bg-slate-100 my-2"></div>

             <p>
               {isLogin ? 'Nog geen account?' : 'Al een account?'}
               <button 
                 onClick={() => { setIsLogin(!isLogin); setUseMagicLink(false); }}
                 className="text-indigo-600 font-bold ml-1 hover:underline"
               >
                 {isLogin ? 'Registreer nu' : 'Log hier in'}
               </button>
             </p>
          </div>
        </div>
      </div>
      
      <button 
        onClick={switchToHome}
        className="mt-8 text-slate-500 hover:text-slate-800 font-medium text-sm flex items-center gap-2 hover:underline"
      >
        &larr; Terug naar Home
      </button>
    </div>
  );
};

export default LoginPage;
