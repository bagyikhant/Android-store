import React from 'react';
import { 
  X, 
  Download, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  Trash2, 
  ExternalLink,
  Zap,
  ArrowRight
} from 'lucide-react';
import { AppItem, DownloadTask } from '../types/store';

interface DownloadsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: DownloadTask[];
  apps: AppItem[];
  onPause: (appId: string) => void;
  onResume: (appId: string) => void;
  onCancel: (appId: string) => void;
  onInstall: (app: AppItem) => void;
  onClearCompleted: () => void;
  turboSpeed: boolean;
  onToggleTurbo: () => void;
}

export const DownloadsDrawer: React.FC<DownloadsDrawerProps> = ({
  isOpen,
  onClose,
  tasks,
  apps,
  onPause,
  onResume,
  onCancel,
  onInstall,
  onClearCompleted,
  turboSpeed,
  onToggleTurbo
}) => {
  if (!isOpen) return null;

  const activeCount = tasks.filter(t => t.status === 'downloading' || t.status === 'pending').length;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-md h-full bg-zinc-950 border-l border-zinc-800 shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/80">
          <div className="flex items-center gap-2">
            <Download className="size-5 text-emerald-400" />
            <h2 className="text-base font-bold text-zinc-100">
              Download Manager
            </h2>
            {activeCount > 0 && (
              <span className="size-5 rounded-full bg-emerald-500 text-zinc-950 text-[10px] font-bold flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleTurbo}
              className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 border transition-colors ${
                turboSpeed 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                  : 'bg-zinc-800 text-zinc-400 border-zinc-700'
              }`}
              title="Turbo Download Speed"
            >
              <Zap className={`size-3 ${turboSpeed ? 'text-amber-400 fill-current' : ''}`} />
              <span>{turboSpeed ? 'Turbo 12MB/s' : 'Standard'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Task List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {tasks.length > 0 ? (
            tasks.map(task => {
              const app = apps.find(a => a.app_id === task.appId);
              const isFinished = task.status === 'completed';
              const isDownloading = task.status === 'downloading';
              const isPaused = task.status === 'paused';
              const sizeMb = (task.totalBytes / (1024 * 1024)).toFixed(1);
              const dlMb = (task.downloadedBytes / (1024 * 1024)).toFixed(1);

              return (
                <div
                  key={task.appId}
                  className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-12 rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700/60 flex-shrink-0">
                      <img
                        src={task.icon}
                        alt={task.label}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-zinc-100 truncate">
                        {task.label}
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-0.5">
                        <span className="font-mono text-emerald-400">v{task.targetVersion}</span>
                        <span>•</span>
                        <span>{dlMb} / {sizeMb} MB</span>
                      </div>
                    </div>

                    {isFinished ? (
                      <span className="size-7 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                        <CheckCircle2 className="size-4" />
                      </span>
                    ) : (
                      <div className="flex items-center gap-1">
                        {isDownloading && (
                          <button
                            onClick={() => onPause(task.appId)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-white bg-zinc-800"
                            title="Pause"
                          >
                            <Pause className="size-3.5" />
                          </button>
                        )}
                        {isPaused && (
                          <button
                            onClick={() => onResume(task.appId)}
                            className="p-1.5 rounded-lg text-emerald-400 hover:text-emerald-300 bg-zinc-800"
                            title="Resume"
                          >
                            <RotateCcw className="size-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => onCancel(task.appId)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 bg-zinc-800"
                          title="Cancel"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Progress bar */}
                  {!isFinished && (
                    <div className="space-y-1.5">
                      <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-200"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-zinc-400">
                        <span>{isPaused ? 'Paused' : task.speed}</span>
                        <span className="font-mono font-bold text-emerald-400">{task.progress}%</span>
                      </div>
                    </div>
                  )}

                  {/* Install Button once completed */}
                  {isFinished && app && (
                    <div className="flex items-center gap-2 pt-1 border-t border-zinc-800/60">
                      <button
                        onClick={() => {
                          onClose();
                          onInstall(app);
                        }}
                        className="flex-1 py-2 px-3 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-zinc-950 flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/40"
                      >
                        <Download className="size-3.5" />
                        <span>Install Package Now</span>
                      </button>
                      <a
                        href={task.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl text-zinc-400 hover:text-white bg-zinc-800 text-xs"
                        title="Download to Local Disk"
                      >
                        <ExternalLink className="size-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center text-zinc-500 space-y-2">
              <Download className="size-8 mx-auto opacity-40" />
              <p className="text-xs">No active or past downloads</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {tasks.length > 0 && (
          <div className="p-4 border-t border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-mono">
              {tasks.length} total tasks
            </span>
            <button
              onClick={onClearCompleted}
              className="text-xs text-zinc-400 hover:text-rose-400 flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="size-3.5" />
              <span>Clear Completed</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
