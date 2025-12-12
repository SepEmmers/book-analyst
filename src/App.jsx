import React, { useState, useMemo, useEffect } from 'react';
import { BookOpen, Upload, FileText, X, Layers, Globe, Plus, FolderOpen, Home, Share2, Check, User as UserIcon, LogOut, Copy, Trash2, Edit2, Moon, Sun, Monitor } from 'lucide-react';
import { analyzeBookAdvanced } from './utils/analysis';
import { parseFile } from './utils/fileParsers';
import { supabase } from './lib/supabase';
import { predictGenre } from './utils/gamification';
import OverviewTab from './components/dashboard/OverviewTab';
import SentimentTab from './components/dashboard/SentimentTab';
import StructureTab from './components/dashboard/StructureTab';
import CharactersTab from './components/dashboard/CharactersTab';
import SeriesDashboard from './components/dashboard/SeriesDashboard';
import Modal from './components/ui/Modal';
import StatDetailModal from './components/dashboard/StatDetailModal';
import HomePage from './components/HomePage';
import LoginPage from './components/auth/LoginPage';
import ProfilePage from './components/dashboard/ProfilePage';
import PublishModal from './components/dashboard/PublishModal';
import { ToastContainer } from './components/ui/Toast';
import ConfirmDialog from './components/ui/ConfirmDialog';
import { useUI } from './context/UIContext';
import clsx from 'clsx';
import { LANGUAGES } from './constants/dictionaries';
import { validateBookTitle } from './utils/validation';

const App = () => {
  const { theme, toggleTheme, language, switchLanguage, t, showToast, confirm } = useUI();

  const [currentView, setCurrentView] = useState('home'); // 'home', 'dashboard', 'login', 'profile'
  const [files, setFiles] = useState([]);
  const [series, setSeries] = useState([]); 
  const [selectedId, setSelectedId] = useState(null); 
  const [selectedType, setSelectedType] = useState('book'); 
  
  const [analyzing, setAnalyzing] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Auth State
  const [user, setUser] = useState(null);

  // Selection for Series Creation
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedForSeries, setSelectedForSeries] = useState(new Set());

  // Modal & Selection State
  const [statModalData, setStatModalData] = useState(null); 
  const [publishModalOpen, setPublishModalOpen] = useState(false); // Add Modal State

  useEffect(() => {
    // Check Auth
    if (supabase) {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user && currentView === 'login') {
                setCurrentView('profile');
            }
        });

        const params = new URLSearchParams(window.location.search);
        const sharedId = params.get('id');
        if (sharedId) {
            loadSharedBook(sharedId);
        }

        return () => subscription.unsubscribe();
    }
  }, []);

  const loadSharedBook = async (id) => {
      if (!supabase) return;
      setAnalyzing(true);
      try {
          const { data, error } = await supabase
            .from('books')
            .select('*')
            .eq('id', id)
            .single();
          
          if (error) throw error;
          if (data) {
              handleViewCloudBook(data);
          }
      } catch (err) {
          console.error("Error loading shared book:", err);
          showToast("Kon gedeeld boek niet laden.", "error");
      } finally {
          setAnalyzing(false);
      }
  };

  const handleFileUpload = async (event) => {
    const uploadedFiles = Array.from(event.target.files);
    setAnalyzing(true);
    const newBooks = [];
    for (const file of uploadedFiles) {
      if (
        file.type === "text/plain" || file.name.endsWith('.txt') || file.name.endsWith('.md') ||
        file.type === "application/pdf" || file.name.endsWith('.pdf') ||
        file.type === "application/epub+zip" || file.name.endsWith('.epub')
      ) {
        try {
          const text = await parseFile(file);
          if (text.trim().length > 0) {
              const analysis = analyzeBookAdvanced(text, file.name);
              newBooks.push({
                id: Date.now() + Math.random(),
                name: file.name,
                rawText: text,
                analysis: analysis,
                detectedLang: analysis.lang
              });
          }
        } catch (error) {
           console.error("Error parsing file:", file.name, error);
           showToast(`Fout bij laden ${file.name}`, 'error');
        }
      }
    }
    setFiles(prev => [...prev, ...newBooks]);
    
    if (newBooks.length > 0 && !selectedId) {
        setSelectedId(newBooks[0].id);
        setSelectedType('book');
        setCurrentView('dashboard'); 
    }
    setAnalyzing(false);
  };

  const initiatePublish = async () => {
       if (!activeItem || selectedType !== 'book') return;
       if (!user) {
          const wantsLogin = await confirm(t('app.publish'), t('app.loginRequired'));
          if (wantsLogin) setCurrentView('login');
          return;
       }
       setPublishModalOpen(true);
  };

  const handleConfirmPublish = async (title, author) => {
      // Called when user clicks "Nu Publiceren" in modal
      setPublishModalOpen(false);
      
      // Update local state temporarily (optimistic)
      if (activeItem.name !== title || activeItem.author !== author) {
          setFiles(prev => prev.map(f => f.id === activeItem.id ? { ...f, name: title, author: author } : f));
      }
      
      // Proceed to cloud save
      await handleSaveToCloud(true, title, author);
  };

  const handleSaveToCloud = async (isPublic = false, finalTitle = null, finalAuthor = null) => {
      // If Public and no title/author provided (direct call), redirect to modal initiation logic
      if (isPublic && (!finalTitle || !finalAuthor)) {
           initiatePublish();
           return;
      }

      // If Private, use current name and default author
      const titleToSave = finalTitle || activeItem.name;
      const authorToSave = finalAuthor || activeItem.author || 'Onbekend';

      const titleValidation = validateBookTitle(titleToSave);
      if (!titleValidation.valid) {
          showToast(t('publish.invalidTitle') + " " + titleValidation.error, 'error');
          return;
      }
      
      if (!user) {
          const wantsLogin = await confirm(t('app.share'), t('app.loginRequired'));
          if (wantsLogin) setCurrentView('login');
          return;
      }

      try {
          setPublishing(true);
          const genre = predictGenre(activeItem.analysis);
          
          const payload = {
              title: titleToSave,
              author: authorToSave, 
              genre: genre,
              analysis_json: activeItem.analysis,
              likes_count: 0,
              user_id: user.id,
              is_public: isPublic
          };

          const { data, error } = await supabase.from('books').insert(payload).select().single();

          if (error) throw error;
          
          if (!isPublic && data) {
               const link = `${window.location.origin}/?id=${data.id}`;
               navigator.clipboard.writeText(link);
               showToast(t('app.linkCopied') + " " + link, 'success');
          } else {
              setPublishSuccess(true);
              showToast(t('app.published'), 'success');
              setTimeout(() => setPublishSuccess(false), 3000);
          }

      } catch (err) {
          console.error("Publish error:", err);
          showToast(t('app.saveError') + " " + err.message, 'error');
      } finally {
          setPublishing(false);
      }
  };

  const handleRenameBook = async () => {
      if (!activeItem || selectedType !== 'book') return;

      const newName = prompt(t('app.renamePrompt'), activeItem.name); // Keep prompt for simple rename or make custom dialog? Prompt is okay for now or use confirm? Actually prompt is needed for input.
      
      if (!newName) return;

      const validation = validateBookTitle(newName);
      if (!validation.valid) {
          showToast(validation.error, 'error');
          return;
      }

      // 1. Rename Local State
      setFiles(prev => prev.map(f => {
          if (f.id === activeItem.id) {
              return { ...f, name: newName };
          }
          return f;
      }));

      // 2. Rename in Cloud (if it's a cloud book and user owns it)
      if (activeItem.isCloud && user && activeItem.ownerId === user.id) {
          try {
              const { error } = await supabase
                .from('books')
                .update({ title: newName })
                .eq('id', activeItem.id);
              
              if (error) throw error;
          } catch (err) {
              console.error("Cloud rename error:", err);
              showToast(t('app.cloudRenameError') + " " + err.message, 'error');
          }
      }
  };

  const handleDeleteBook = async (book) => {
      const confirmed = await confirm(t('app.delete'), t('app.deleteConfirm'));
      if (!confirmed) return;
      
      if (!book.isCloud) {
          setFiles(files.filter(f => f.id !== book.id));
          if (selectedId === book.id) setSelectedId(null);
          return;
      }

      if (!user) return;
      try {
          const { error } = await supabase.from('books').delete().eq('id', book.id);
          if (error) throw error;
          setFiles(files.filter(f => f.id !== book.id));
          if (selectedId === book.id) setSelectedId(null);
          showToast(t('app.deleteCloudConfirm'), 'success');
      } catch (err) {
          console.error(err);
          showToast(t('app.deleteError'), 'error');
      }
  };

  const handleViewCloudBook = (book) => {
      const newBook = {
          id: book.id, 
          name: book.title,
          author: book.author, // Capture Author
          rawText: "", 
          analysis: typeof book.analysis_json === 'string' ? JSON.parse(book.analysis_json) : book.analysis_json,
          isCloud: true,
          detectedLang: book.analysis_json.lang || 'en',
          ownerId: book.user_id,
          is_public: book.is_public,
          genre: book.genre,
          created_at: book.created_at
      };
      
      if (!files.find(f => f.id === newBook.id)) {
          setFiles(prev => [...prev, newBook]);
      }
      
      setSelectedId(newBook.id);
      setSelectedType('book');
      setCurrentView('dashboard');
  };

  const handleLanguageChange = (fileId, newLang) => {
    setFiles(prev => prev.map(f => {
        if (f.id === fileId && !f.isCloud) { 
            return {
                ...f,
                analysis: analyzeBookAdvanced(f.rawText, f.name, newLang),
                detectedLang: newLang
            };
        }
        return f;
    }));
  };
  
  const toggleSelection = (id) => {
      const newSet = new Set(selectedForSeries);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      setSelectedForSeries(newSet);
  };

  const createSeries = () => {
      if (selectedForSeries.size < 2) return;
      const name = prompt(t('app.newSeries'), "Mijn Trilogie");
      if (name) {
          const newSeries = { id: Date.now(), name, bookIds: Array.from(selectedForSeries) };
          setSeries(prev => [...prev, newSeries]);
          setSelectionMode(false);
          setSelectedForSeries(new Set());
          setSelectedId(newSeries.id);
          setSelectedType('series');
      }
  };

  const activeItem = useMemo(() => {
    if (selectedType === 'book') {
        return files.find(f => f.id === selectedId);
    } else {
        const s = series.find(s => s.id === selectedId);
        if (!s) return null;
        return { ...s, books: files.filter(f => s.bookIds.includes(f.id)) };
    }
  }, [files, series, selectedId, selectedType]);

  const handleStatClick = (metricKey, value, context) => {
    setStatModalData({ metricKey, value, context });
  };
  
  const handleBookClick = (bookId) => {
      setSelectedId(bookId);
      setSelectedType('book');
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans overflow-hidden transition-colors duration-300">
      
      <ToastContainer />
      <ConfirmDialog />

      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between shadow-sm z-20">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentView('home')}>
          <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-200 dark:shadow-none">
            <BookOpen className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">{t('app.title')}</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t('app.subtitle')}</p>
          </div>
        </div>
        
        <div className="flex gap-2 items-center">
            
            {/* Theme Toggle */}
            <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors"
                title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}
            >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            {/* Language Switch */}
            <button
                onClick={() => switchLanguage(language === 'nl' ? 'en' : 'nl')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 font-medium text-xs border border-slate-200 dark:border-slate-600 ml-1 mr-2"
            >
                <span className="text-lg">{language === 'nl' ? '🇳🇱' : '🇬🇧'}</span>
                <span>{language.toUpperCase()}</span>
            </button>

            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>

            <button 
                onClick={() => setCurrentView('home')}
                className={clsx(
                    "flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all font-medium text-sm",
                    currentView === 'home' ? "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                )}
            >
                <Home className="w-4 h-4" />
                <span className="hidden md:inline">{t('app.home')}</span>
            </button>

            {/* Auth Button */}
            {user ? (
                <button 
                    onClick={() => setCurrentView('profile')}
                    className={clsx(
                        "flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all font-medium text-sm",
                        currentView === 'profile' ? "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    )}
                >
                    <UserIcon className="w-4 h-4" />
                    <span className="hidden md:inline">{t('app.profile')}</span>
                </button>
            ) : (
                <button 
                    onClick={() => setCurrentView('login')}
                    className={clsx(
                        "flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all font-medium text-sm shadow-md",
                        currentView === 'login' 
                            ? "bg-slate-700 text-white" 
                            : "bg-slate-800 text-white hover:bg-slate-700 dark:bg-slate-600 dark:hover:bg-slate-500"
                    )}
                >
                    <UserIcon className="w-4 h-4" />
                    <span>{t('app.login')}</span>
                </button>
            )}

            <div className="w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>

            {currentView === 'dashboard' && !selectionMode && (
                 <button 
                    onClick={() => setSelectionMode(true)}
                    className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 px-4 py-2.5 rounded-lg transition-all font-medium text-sm hidden md:flex"
                >
                    <Layers className="w-4 h-4" />
                    <span>{t('app.newSeries')}</span>
                </button>
            )}

            {selectionMode && (
                <>
                     <button 
                        onClick={() => setSelectionMode(false)}
                        className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 px-4 text-sm"
                    >
                        {t('app.cancel')}
                    </button>
                    <button 
                        onClick={createSeries}
                        disabled={selectedForSeries.size < 2}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg transition-all font-medium text-sm shadow-md"
                    >
                        <Plus className="w-4 h-4" />
                        <span>{t('app.createSeries')} ({selectedForSeries.size})</span>
                    </button>
                </>
            )}

            <label className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg cursor-pointer transition-all shadow-md active:scale-95 font-medium">
            <Upload className="w-4 h-4" />
            <span className="hidden md:inline">{t('app.upload')}</span>
            <input type="file" multiple onChange={handleFileUpload} className="hidden" accept=".txt,.md,.pdf,.epub" />
            </label>
        </div>
      </header>

      {/* Main View Render */}
      
      {currentView === 'login' && (
          <LoginPage 
            switchToHome={() => setCurrentView('home')} 
            onLoginSuccess={() => setCurrentView('profile')}
          />
      )}

      {currentView === 'profile' && user && (
          <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900">
             <ProfilePage user={user} onViewBook={handleViewCloudBook} />
          </div>
      )}

      {currentView === 'home' && (
          <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900">
              <HomePage 
                onViewBook={handleViewCloudBook} 
                onUploadClick={() => document.querySelector('input[type=file]').click()} 
              />
          </div>
      )}
      
      {currentView === 'dashboard' && (
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-72 bg-slate-100 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col z-10 hidden md:flex">
          {series.length > 0 && (
             <div className="mb-2">
                <div className="p-4 py-3 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('app.series')}</h2>
                </div>
                <div className="p-2 space-y-1">
                    {series.map(s => (
                        <div
                            key={s.id}
                            onClick={() => { setSelectedId(s.id); setSelectedType('series'); }}
                            className={clsx(
                            "w-full text-left p-3 rounded-lg flex items-center gap-3 transition-all cursor-pointer",
                            selectedType === 'series' && selectedId === s.id 
                                ? 'bg-white dark:bg-slate-700 shadow-sm ring-1 ring-indigo-200 dark:ring-indigo-900 border-l-4 border-l-indigo-500' 
                                : 'hover:bg-slate-200 dark:hover:bg-slate-700 border-l-4 border-l-transparent'
                            )}
                        >
                            <FolderOpen className="w-4 h-4 text-indigo-400" />
                            <div className="flex-1 min-w-0">
                                <p className="font-medium truncate text-sm text-indigo-900 dark:text-indigo-100">{s.name}</p>
                                <p className="text-xs text-slate-400">{s.bookIds.length} boeken</p>
                            </div>
                        </div>
                    ))}
                </div>
             </div>
          )}

          <div className="p-4 py-3 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('app.library')}</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {files.length === 0 && (
              <div className="text-center p-6 text-slate-400">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">{t('app.noBooks')}</p>
              </div>
            )}
            {files.map(file => (
              <div
                key={file.id}
                onClick={() => { 
                    if (selectionMode) toggleSelection(file.id);
                    else { setSelectedId(file.id); setSelectedType('book'); }
                }}
                role="button"
                className={clsx(
                   "w-full text-left p-3 rounded-lg flex items-center gap-3 transition-all cursor-pointer relative",
                   selectionMode && selectedForSeries.has(file.id) ? 'bg-indigo-50 dark:bg-indigo-900/30 border-l-4 border-l-indigo-400' : '',
                   !selectionMode && selectedType === 'book' && selectedId === file.id 
                        ? 'bg-white dark:bg-slate-700 shadow-sm ring-1 ring-indigo-200 dark:ring-indigo-900 border-l-4 border-l-indigo-500' 
                        : 'hover:bg-slate-200 dark:hover:bg-slate-700 border-l-4 border-l-transparent'
                )}
              >
                {selectionMode && (
                    <div className={clsx(
                        "w-4 h-4 rounded border flex items-center justify-center mr-1",
                        selectedForSeries.has(file.id) ? "bg-indigo-600 border-indigo-600" : "border-slate-300 bg-white"
                    )}>
                        {selectedForSeries.has(file.id) && <span className="text-white text-[10px] font-bold">✓</span>}
                    </div>
                )}
                {file.isCloud && <Globe className="w-3 h-3 text-indigo-400 absolute top-3 right-3" />}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <p className={clsx("font-medium truncate text-sm flex-1", selectedId === file.id ? 'text-indigo-900 dark:text-indigo-100' : 'text-slate-700 dark:text-slate-300')}>{file.name}</p>
                    {file.analysis.lang && (
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 ml-2">
                            {file.analysis.lang}
                        </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">{file.analysis.meta.wordCount.toLocaleString()} {t('app.words')}</p>
                </div>
                {!selectionMode && selectedId === file.id && !file.isCloud && (
                  <button onClick={(e) => { e.stopPropagation(); setFiles(files.filter(f => f.id !== file.id)); }} className="text-slate-400 hover:text-red-500 absolute bottom-3 right-3">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 relative">
          {analyzing ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-slate-900/80 z-50 backdrop-blur-sm">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-400 mb-4"></div>
              <p className="text-indigo-800 dark:text-indigo-200 font-medium">{t('app.analyzing')}</p>
            </div>
          ) : !activeItem ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
              <Layers className="w-20 h-20 mb-4 opacity-10 text-indigo-500" />
              <p className="text-xl font-medium text-slate-500 dark:text-slate-400">{t('app.chooseBook')}</p>
            </div>
          ) : selectedType === 'series' ? (
              <div className="p-8 max-w-7xl mx-auto">
                <SeriesDashboard 
                    series={activeItem} 
                    onBookClick={handleBookClick}
                    onStatClick={handleStatClick}
                />
              </div>
          ) : (
            <div className="p-8 max-w-7xl mx-auto space-y-6">
              
              {/* Top Navigation & Language & Tools */}
              <div className="flex flex-col md:flex-row gap-4 justify-between items-end border-b border-slate-200 dark:border-slate-700 pb-1">
                <div className="flex gap-2 overflow-x-auto w-full md:w-auto">
                    {[
                    { id: 'dashboard', label: t('tabs.dashboard') },
                    { id: 'sentiment', label: t('tabs.sentiment') },
                    { id: 'structure', label: t('tabs.structure') },
                    { id: 'characters', label: t('tabs.characters') }
                    ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={clsx(
                        "px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap",
                        activeTab === tab.id
                            ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700 border-b-white dark:border-b-slate-800 -mb-[1px]' 
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                        )}
                    >
                        {tab.label}
                    </button>
                    ))}
                </div>

                <div className="flex items-center gap-2 mb-2">
                    {/* Rename Button */}
                    <button
                        onClick={handleRenameBook}
                        disabled={activeItem.isCloud && (!user || activeItem.ownerId !== user.id)}
                        title={t('app.rename')}
                        className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 disabled:opacity-30 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-600"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Delete Cloud Book Button */}
                    {activeItem.isCloud && user && activeItem.ownerId === user.id && (
                        <button 
                            onClick={() => handleDeleteBook(activeItem)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-800"
                        >
                            <Trash2 className="w-4 h-4" />
                            {t('app.delete')}
                        </button>
                    )}

                    {/* Share Button (Private Link) */}
                    <button 
                        onClick={() => handleSaveToCloud(false)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all border border-slate-200 dark:border-slate-600"
                    >
                        <Share2 className="w-4 h-4" />
                        {t('app.share')}
                    </button>

                    {/* Publish Button (Public Feed) */}
                    <button 
                        onClick={() => handleSaveToCloud(true)}
                        disabled={publishing || publishSuccess}
                        className={clsx(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide transition-all",
                            publishSuccess ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 cursor-default" : "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900/50"
                        )}
                    >
                        {publishing ? <span className="animate-spin">⌛</span> : publishSuccess ? <Check className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                        {publishing ? t('app.publishing') : publishSuccess ? t('app.published') : t('app.publish')}
                    </button>

                    <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-2"></div>

                    <Globe className="w-4 h-4 text-slate-400" />
                    <select 
                        value={activeItem.analysis.lang} 
                        onChange={(e) => handleLanguageChange(activeItem.id, e.target.value)}
                        disabled={activeItem.isCloud}
                        className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm rounded-md focus:ring-indigo-500 focus:border-indigo-500 block p-1.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
                    >
                        {Object.entries(LANGUAGES).map(([code, name]) => (
                            <option key={code} value={code}>{name}</option>
                        ))}
                    </select>
                </div>
              </div>

              {/* DASHBOARD TAB */}
              {activeTab === 'dashboard' && (
                <OverviewTab 
                    activeBook={activeItem} 
                    onStatClick={handleStatClick}
                />
              )}

              {/* SENTIMENT TAB */}
              {activeTab === 'sentiment' && <SentimentTab activeBook={activeItem} />}

              {/* STRUCTURE TAB */}
              {activeTab === 'structure' && <StructureTab activeBook={activeItem} />}

              {/* CHARACTERS TAB */}
              {activeTab === 'characters' && <CharactersTab activeBook={activeItem} />}

            </div>
          )}
        </main>
      </div>
      )}

      {/* Modals */}
      <Modal isOpen={!!statModalData} onClose={() => setStatModalData(null)} title="Statistiek Detail">
        {statModalData && (
            <StatDetailModal 
                metricKey={statModalData.metricKey} 
                value={statModalData.value} 
                context={statModalData.context} 
            />
        )}
      </Modal>

      <PublishModal 
          isOpen={publishModalOpen} 
          onClose={() => setPublishModalOpen(false)} 
          book={activeItem} 
          onConfirm={handleConfirmPublish}
      />
    </div>
  );
};
export default App;
