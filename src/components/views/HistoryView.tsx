import React from 'react';
import { useStudio } from '../../context/StudioContext';
import {
  Clock,
  RotateCcw,
  Sparkles,
  Layers,
  FileCheck,
  BookmarkCheck,
  ShieldCheck,
} from 'lucide-react';

export const HistoryView: React.FC = () => {
  const { activeProject, undo, canUndo, settings } = useStudio();
  const isAr = settings.language === 'ar';

  const historyItems = activeProject.history || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-5 h-5 text-purple-400" />
            <h1 className="text-xl font-black text-slate-100">
              {isAr ? 'سجل العمليات والتعديلات (Project Audit History)' : 'Project History & Audit Trail'}
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            {isAr
              ? 'سجل زمني دقيق لكل خطوة، برومبت، تعديل طبقة، أو توليد لضمان عدم ضياع أي مرحلة إبداعية.'
              : 'Detailed chronological audit log of all prompt updates, layers, and generations.'}
          </p>
        </div>

        <button
          onClick={undo}
          disabled={!canUndo}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 disabled:opacity-40 transition-colors"
        >
          <RotateCcw className="w-4 h-4 text-amber-400" />
          <span>{isAr ? 'تراجع عن آخر خطوة (Undo)' : 'Undo Last Step'}</span>
        </button>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
        {historyItems.length > 0 ? (
          <div className="relative border-r border-slate-800 space-y-6 mr-3 pr-6">
            {historyItems.map((item) => (
              <div key={item.id} className="relative group">
                <div className="absolute -right-[31px] top-1 h-3.5 w-3.5 rounded-full border-2 border-slate-900 bg-amber-500 group-hover:scale-125 transition-transform" />
                <div className="p-4 rounded-xl border border-slate-800/80 bg-[#090e17] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300">{item.action}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">{item.description}</p>
                  <span className="inline-block px-2 py-0.5 rounded bg-slate-800 text-[9px] text-slate-400 font-mono mt-1">
                    Tool: {item.tool}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-8 text-slate-500 text-xs">
            {isAr ? 'لا توجد عمليات مسجلة بعد' : 'No history items recorded yet'}
          </div>
        )}
      </div>
    </div>
  );
};
