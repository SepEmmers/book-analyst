import React from 'react';
import { useUI } from '../../context/UIContext';
import { X, AlertTriangle } from 'lucide-react';

const ConfirmDialog = () => {
  const { confirmDialog, t } = useUI();
  const { isOpen, title, message, onConfirm, onCancel } = confirmDialog;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
            <div className="p-6">
                <div className="flex items-start gap-4">
                    <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-full shrink-0">
                        <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{title}</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">{message}</p>
                    </div>
                </div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-700">
                <button 
                    onClick={onCancel}
                    className="px-4 py-2 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-sm"
                >
                    {t('app.cancel')}
                </button>
                <button 
                    onClick={onConfirm}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-md transition-all active:scale-95 text-sm"
                >
                    Ok
                </button>
            </div>
        </div>
    </div>
  );
};

export default ConfirmDialog;
