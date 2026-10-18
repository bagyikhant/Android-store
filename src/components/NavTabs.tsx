import React from 'react';
import { 
  ArrowUpDown, 
  Grid3X3, 
  List, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  Package,
  Search
} from 'lucide-react';
import { SortOption, ViewTab } from '../types/store';

interface NavTabsProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  isCompactView: boolean;
  setIsCompactView: (compact: boolean) => void;
  totalAppsCount: number;
  updatesCount: number;
  installedCount: number;
  downloadsCount: number;
}

export const NavTabs: React.FC<NavTabsProps> = ({
  searchQuery,
  setSearchQuery,
  activeTab,
  setActiveTab,
  categories,
  selectedCategory,
  setSelectedCategory,
  sortBy,
  setSortBy,
  isCompactView,
  setIsCompactView,
  totalAppsCount,
  updatesCount,
  installedCount,
  downloadsCount
}) => {
  return (
    <div className="space-y-4">
      {/* Top Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search applications..."
            className="w-full bg-zinc-900 text-sm text-zinc-100 pl-10 pr-9 py-2.5 rounded-xl border border-zinc-800 focus:outline-none focus:border-emerald-500 placeholder:text-zinc-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-200"
            >
              ✕
            </button>
          )}
        </div>

        {/* Sort & View Options */}
        <div className="flex items-center justify-between sm:justify-end gap-3">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <ArrowUpDown className="size-3.5 text-zinc-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="name">Name (A-Z)</option>
              <option value="downloads">Most Downloaded</option>
              <option value="size">File Size</option>
              <option value="date">Upload Date</option>
            </select>
          </div>

          {activeTab === 'store' && (
            <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
              <button
                onClick={() => setIsCompactView(false)}
                className={`p-1.5 rounded-lg transition-colors ${
                  !isCompactView
                    ? 'bg-zinc-800 text-emerald-400'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title="Grid"
              >
                <Grid3X3 className="size-4" />
              </button>
              <button
                onClick={() => setIsCompactView(true)}
                className={`p-1.5 rounded-lg transition-colors ${
                  isCompactView
                    ? 'bg-zinc-800 text-emerald-400'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title="List"
              >
                <List className="size-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Primary Tabs */}
      <div className="flex items-center justify-between border-b border-zinc-800">
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
          
          <button
            onClick={() => setActiveTab('store')}
            className={`relative flex items-center gap-2 px-3.5 py-2.5 text-sm font-semibold transition-all border-b-2 ${
              activeTab === 'store'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Package className="size-4" />
            <span>Store</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
              {totalAppsCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('updates')}
            className={`relative flex items-center gap-2 px-3.5 py-2.5 text-sm font-semibold transition-all border-b-2 ${
              activeTab === 'updates'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <RefreshCw className={`size-4 ${updatesCount > 0 ? 'text-amber-400 animate-pulse' : ''}`} />
            <span>Updates</span>
            {updatesCount > 0 ? (
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500 text-zinc-950 font-bold">
                {updatesCount}
              </span>
            ) : (
              <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                0
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('installed')}
            className={`relative flex items-center gap-2 px-3.5 py-2.5 text-sm font-semibold transition-all border-b-2 ${
              activeTab === 'installed'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <CheckCircle2 className="size-4" />
            <span>Installed</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
              {installedCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('downloads')}
            className={`relative flex items-center gap-2 px-3.5 py-2.5 text-sm font-semibold transition-all border-b-2 ${
              activeTab === 'downloads'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Download className="size-4" />
            <span>Downloads</span>
            {downloadsCount > 0 ? (
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500 text-zinc-950 font-bold">
                {downloadsCount}
              </span>
            ) : null}
          </button>

        </div>
      </div>

      {/* Category Pills (for Store tab) */}
      {activeTab === 'store' && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {categories.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs font-medium px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap ${
                  active
                    ? 'bg-emerald-500 text-zinc-950 font-semibold shadow-sm shadow-emerald-950/40'
                    : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
