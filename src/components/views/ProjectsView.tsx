import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import { exportProjectPackage } from '../../services/storage';
import {
  FolderOpen,
  Plus,
  Copy,
  Download,
  Trash2,
  Star,
  Clock,
  Layers,
  Sparkles,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';

export const ProjectsView: React.FC = () => {
  const {
    projects,
    activeProject,
    setActiveProjectId,
    createNewProject,
    duplicateCurrentProject,
    deleteProject,
    updateActiveProject,
    settings,
  } = useStudio();

  const isAr = settings.language === 'ar';
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newWidthCm, setNewWidthCm] = useState(30);
  const [newHeightCm, setNewHeightCm] = useState(40);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    createNewProject(newProjectName, newWidthCm, newHeightCm);
    setNewProjectName('');
    setIsCreatingNew(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FolderOpen className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-black text-slate-100">
              {isAr ? 'إدارة المشاريع (Project System)' : 'Project Management'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold">
              {projects.length} Projects
            </span>
          </div>
          <p className="text-xs text-slate-400">
            {isAr
              ? 'كل مشروع يحتوي على كافة الصور، البرومبتات، الإصدارات، والطبقات كحزمة مستقلة لا تضيع أبدًا.'
              : 'Unified self-contained projects storing prompts, references, layers, and exports.'}
          </p>
        </div>

        <button
          onClick={() => setIsCreatingNew(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all"
        >
          <Plus className="w-4 h-4 text-slate-950" />
          <span>{isAr ? 'مشروع جديد' : 'New Project'}</span>
        </button>
      </div>

      {/* New Project Modal / Form */}
      {isCreatingNew && (
        <form onSubmit={handleCreate} className="p-5 rounded-2xl border border-amber-500/40 bg-[#0c121e] space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-amber-300">
              {isAr ? 'إنشاء مشروع تصميم جديد' : 'Create New Project Workspace'}
            </span>
            <button type="button" onClick={() => setIsCreatingNew(false)} className="text-slate-400 hover:text-white text-xs">
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] text-slate-400 mb-1">{isAr ? 'اسم المشروع' : 'Project Title'}</label>
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="e.g. Graduation Design 2026 - 30x40 Luxury"
                className="w-full bg-[#080d16] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">{isAr ? 'العرض سم' : 'Width cm'}</label>
                <input
                  type="number"
                  value={newWidthCm}
                  onChange={(e) => setNewWidthCm(Number(e.target.value))}
                  className="w-full bg-[#080d16] border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-100 font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">{isAr ? 'الارتفاع سم' : 'Height cm'}</label>
                <input
                  type="number"
                  value={newHeightCm}
                  onChange={(e) => setNewHeightCm(Number(e.target.value))}
                  className="w-full bg-[#080d16] border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-100 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreatingNew(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
            >
              {isAr ? 'إنشاء وبدء العمل' : 'Create Project'}
            </button>
          </div>
        </form>
      )}

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {projects.map((proj) => {
          const isActive = proj.id === activeProject.id;
          const thumbnail =
            proj.prompts?.[0]?.generatedResults?.[0]?.url ||
            proj.originalImages?.[0] ||
            '';

          return (
            <div
              key={proj.id}
              className={`rounded-2xl border flex flex-col justify-between overflow-hidden transition-all shadow-md ${
                isActive
                  ? 'border-amber-500 bg-slate-900/80 shadow-amber-950/20'
                  : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-800/40'
              }`}
            >
              {/* Project Card Header & Media */}
              <div>
                <div className="aspect-[16/9] bg-slate-950 relative overflow-hidden">
                  {thumbnail ? (
                    <img src={thumbnail} alt={proj.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-600 text-xs">
                      No Preview
                    </div>
                  )}

                  {isActive && (
                    <span className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold shadow">
                      {isAr ? 'المشروع النشط ✓' : 'Active Project ✓'}
                    </span>
                  )}

                  <button
                    onClick={() => updateActiveProject({ isFavorite: !proj.isFavorite })}
                    className="absolute top-2.5 left-2.5 p-1.5 rounded-lg bg-black/60 backdrop-blur-md text-amber-400"
                  >
                    <Star className={`w-3.5 h-3.5 ${proj.isFavorite ? 'fill-amber-400' : ''}`} />
                  </button>
                </div>

                <div className="p-4 space-y-2">
                  <h3 className="text-sm font-bold text-slate-100">{proj.name}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{proj.description || proj.notes}</p>

                  <div className="flex items-center gap-3 pt-2 text-[11px] text-slate-500 font-mono">
                    <span>{proj.printSettings?.widthCm}×{proj.printSettings?.heightCm} cm</span>
                    <span>•</span>
                    <span>{proj.prompts?.[0]?.versions?.length || 1} Versions</span>
                    <span>•</span>
                    <span>{proj.prompts?.[0]?.references?.length || 0} Refs</span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 flex items-center justify-between gap-2">
                <button
                  onClick={() => setActiveProjectId(proj.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  {isActive ? (isAr ? 'قيد العمل' : 'Active') : (isAr ? 'تفعيل المشروع' : 'Switch To')}
                </button>

                <div className="flex items-center gap-1.5">
                  {/* Duplicate Project */}
                  <button
                    onClick={() => duplicateCurrentProject()}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                    title={isAr ? 'نسخ المشروع' : 'Duplicate'}
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  {/* Export Project Package JSON */}
                  <button
                    onClick={() => exportProjectPackage(proj)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                    title={isAr ? 'تصدير حزمة المشروع JSON' : 'Export JSON Package'}
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete (if more than 1) */}
                  {projects.length > 1 && (
                    <button
                      onClick={() => deleteProject(proj.id)}
                      className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400"
                      title={isAr ? 'حذف' : 'Delete'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
