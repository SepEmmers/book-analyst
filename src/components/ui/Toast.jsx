import React from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useUI } from '../../context/UIContext';
import clsx from 'clsx';

const Toast = ({ id, message, type }) => {
  const { removeToast } = useUI();

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-indigo-500" />
  };

  const styles = {
    success: "border-green-100 bg-green-50 text-green-900",
    error: "border-red-100 bg-red-50 text-red-900",
    info: "border-slate-100 bg-white text-slate-900"
  };

  return (
    <div className={clsx(
        "flex items-center gap-3 p-4 rounded-xl shadow-xl border w-full max-w-sm animate-in slide-in-from-right fade-in duration-300",
        styles[type] || styles.info
    )}>
      {icons[type] || icons.info}
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button onClick={() => removeToast(id)} className="text-slate-400 hover:text-slate-600">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export const ToastContainer = () => {
    const { toasts } = useUI();

    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
            {toasts.map(toast => (
                <Toast key={toast.id} {...toast} />
            ))}
        </div>
    );
};
