import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import { Asset } from '../../types';
import {
  FolderArchive,
  Search,
  Sparkles,
  Star,
  Download,
  Filter,
  Plus,
  Tag,
  ArrowRight,
} from 'lucide-react';

export const AssetLibraryView: React.FC = () => {
  const { activeProject, updateActiveProject, sendImageToTool, settings } = useStudio();
  const isAr = settings.language === 'ar';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const assets = activeProject.assets || [];

  // Filter based on category & natural language smart search
  const filteredAssets = assets.filter((asset) => {
    if (selectedCategory !== 'all' && asset.category !== selectedCategory) {
      return false;
    }
    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase();
    const matchName = asset.name.toLowerCase().includes(q);
    const matchTags = asset.tags?.some((t) => t.toLowerCase().includes(q));
    const matchCat = asset.category.toLowerCase().includes(q);

    // Natural Language Queries
    if (q.includes('تخرج') && (asset.tags?.includes('graduation') || asset.tags?.includes('tassel'))) return true;
    if (q.includes('ذهب') && (asset.tags?.includes('gold') || asset.tags?.includes('baroque'))) return true;
    if (q.includes('خلفية') && asset.category === 'backgrounds') return true;
    if (q.includes('اطار') && asset.category === 'frames') return true;
    if (q.includes('اسود') && (asset.tags?.includes('dark') || asset.tags?.includes('emerald'))) return true;

    return matchName || matchTags || matchCat;
  });

  const categories = [
    { id: 'all', labelAr: 'الكل', labelEn: 'All' },
    { id: 'backgrounds', labelAr: 'خلفيات (Backgrounds)', labelEn: 'Backgrounds' },
    { id: 'frames', labelAr: 'إطارات (Frames)', labelEn: 'Frames' },
    { id: 'decorations', labelAr: 'زخارف (Decorations)', labelEn: 'Decorations' },
    { id: 'stickers', labelAr: 'استيكرات وشارات', labelEn: 'Stickers' },
    { id: 'photos', labelAr: 'صور ومقتطعات', labelEn: 'Photos' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FolderArchive className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-black text-slate-100">
              {isAr ? 'مكتبة الأصول والبحث الذكي (Asset Library)' : 'Asset Library & Smart Search'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold">
              {assets.length} Assets
            </span>
          </div>
          <p className="text-xs text-slate-400">
            {isAr
              ? 'مكتبة شاملة للخلفيات، الإطارات، الزخارف، والاستيكرات مع بحث ذكي باللغة الطبيعية.'
              : 'Searchable studio asset library with natural language semantic queries.'}
          </p>
        </div>
      </div>

      {/* Natural Language Search Bar (Requirement 33) */}
      <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute top-3.5 right-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              isAr
                ? 'ابحث باللغة الطبيعية (مثال: "كل تصميمات التخرج الذهبية"، "كل الإطارات"، "خلفيات سوداء")...'
                : 'Search with natural language (e.g. "all gold graduation designs", "dark backgrounds")...'
            }
            className="w-full bg-[#090e17] border border-slate-800 rounded-xl pr-10 pl-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Quick Search Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
          <span className="text-slate-500 shrink-0">{isAr ? 'أمثلة سريعة:' : 'Quick Queries:'}</span>
          {[
            { textAr: 'كل تصميمات التخرج الذهبية', textEn: 'Gold graduation designs' },
            { textAr: 'كل الإطارات الذهبية', textEn: 'Gold frames' },
            { textAr: 'كل الخلفيات الزمردية', textEn: 'Emerald backgrounds' },
            { textAr: 'زخارف الغار', textEn: 'Laurel wreath' },
          ].map((chip, idx) => (
            <button
              key={idx}
              onClick={() => setSearchQuery(isAr ? chip.textAr : chip.textEn)}
              className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300 border border-slate-700/60 whitespace-nowrap transition-colors"
            >
              {isAr ? chip.textAr : chip.textEn}
            </button>
          ))}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-800/80">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === c.id
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {isAr ? c.labelAr : c.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredAssets.map((asset) => (
          <div
            key={asset.id}
            className="group rounded-2xl border border-slate-800 bg-slate-900/40 hover:border-slate-700 overflow-hidden flex flex-col transition-all shadow-sm"
          >
            <div className="aspect-square bg-slate-950 relative overflow-hidden flex items-center justify-center p-3 bg-checkerboard">
              <img src={asset.url} alt={asset.name} className="w-full h-full object-contain" />
              {asset.isFavorite && (
                <span className="absolute top-2 right-2 p-1 rounded-md bg-amber-500 text-slate-950 shadow">
                  <Star className="w-3 h-3 fill-slate-950" />
                </span>
              )}

              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                <button
                  onClick={() => sendImageToTool(asset.url, 'image-editor')}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow"
                >
                  {isAr ? 'استخدام في المحرر' : 'Use in Editor'}
                </button>
              </div>
            </div>

            <div className="p-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 truncate">{asset.name}</span>
                <span className="text-[9px] font-mono text-amber-400 uppercase font-bold">{asset.format}</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {asset.tags?.slice(0, 3).map((t, idx) => (
                  <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
