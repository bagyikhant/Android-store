import React, { useState } from 'react';
import { 
  Download, 
  Play, 
  RefreshCw, 
  Pause, 
  RotateCcw,
  Check
} from 'lucide-react';
import { AppItem, DownloadTask, InstalledApp } from '../types/store';

interface AppCardProps {
  app: AppItem;
  installedInfo?: InstalledApp;
  downloadTask?: DownloadTask;
  isCompact?: boolean;
  onDownload: (app: AppItem) => void;
  onPauseDownload: (appId: string) => void;
  onResumeDownload: (appId: string) => void;
  onCancelDownload: (appId: string) => void;
  onInstall: (app: AppItem, isUpdate?: boolean) => void;
  onOpenApp: (app: AppItem) => void;
  onUninstall: (packageName: string) => void;
  onTriggerUpdate?: (app: AppItem) => void;
}

export const AppCard: React.FC<AppCardProps> = ({
  app,
  installedInfo,
  downloadTask,
  isCompact = false,
  onDownload,
  onPauseDownload,
  onResumeDownload,
  onCancelDownload,
  onInstall,
  onOpenApp,
}) => {
  const [imgError, setImgError] = useState(false);

  const isInstalled = !!installedInfo;
  const isDownloading = downloadTask && (downloadTask.status === 'downloading' || downloadTask.status === 'pending');
  const isPaused = downloadTask && downloadTask.status === 'paused';
  const isDownloaded = downloadTask && downloadTask.status === 'completed' && !isInstalled;
  const hasUpdate = isInstalled && (installedInfo?.updateAvailable || (installedInfo?.installedVersion !== app.ver_name));

  const sizeMb = (app.size / (1024 * 1024)).toFixed(1);
  const initial = app.label.charAt(0).toUpperCase();

  // COMPACT LIST VIEW
  if (isCompact) {
    return (
      <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 hover:bg-zinc-900/90 hover:border-zinc-700 transition-all">
        {/* Icon, Name and Size */}
        <div 
          onClick={() => {
            if (hasUpdate) onInstall(app, true);
            else if (isInstalled) onOpenApp(app);
            else if (isDownloaded) onInstall(app);
            else if (!isDownloading) onDownload(app);
          }}
          className="flex items-center gap-3.5 min-w-0 flex-1 cursor-pointer"
        >
          {/* Icon */}
          <div className="relative size-12 sm:size-14 rounded-2xl overflow-hidden bg-zinc-800 border border-zinc-700/60 flex-shrink-0 shadow-md">
            {!imgError ? (
              <img
                src={app.icon}
                alt={app.label}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-lg text-white bg-gradient-to-br from-emerald-600 to-green-800">
                {initial}
              </div>
            )}
          </div>

          {/* Name and Size */}
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-sm sm:text-base text-zinc-100 truncate hover:text-emerald-400 transition-colors">
              {app.label}
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              {sizeMb} MB
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2 pl-3 flex-shrink-0">
          {hasUpdate ? (
            <button
              onClick={() => onInstall(app, true)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-zinc-950 flex items-center gap-1.5 shadow-md shadow-amber-950/40 transition-transform active:scale-95"
            >
              <RefreshCw className="size-3.5" />
              <span>Update</span>
            </button>
          ) : isInstalled ? (
            <button
              onClick={() => onOpenApp(app)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-emerald-400 border border-zinc-700 flex items-center gap-1.5 transition-transform active:scale-95"
            >
              <Play className="size-3.5 fill-current" />
              <span>Open</span>
            </button>
          ) : isDownloading ? (
            <div className="flex items-center gap-2 bg-zinc-950 px-3 py-1.5 rounded-xl border border-zinc-800">
              <div className="w-12 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500" 
                  style={{ width: `${downloadTask?.progress || 0}%` }}
                />
              </div>
              <span className="text-xs font-mono text-emerald-400">{downloadTask?.progress}%</span>
              <button 
                onClick={() => onPauseDownload(app.app_id)}
                className="p-1 text-zinc-400 hover:text-white"
                title="Pause"
              >
                <Pause className="size-3" />
              </button>
            </div>
          ) : isPaused ? (
            <button
              onClick={() => onResumeDownload(app.app_id)}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center gap-1.5 border border-zinc-700"
            >
              <RotateCcw className="size-3.5 text-emerald-400" />
              <span>Resume</span>
            </button>
          ) : isDownloaded ? (
            <button
              onClick={() => onInstall(app)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 flex items-center gap-1.5 shadow-md shadow-emerald-950/40 transition-transform active:scale-95"
            >
              <Check className="size-3.5 stroke-[2.5]" />
              <span>Install</span>
            </button>
          ) : (
            <button
              onClick={() => onDownload(app)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white flex items-center gap-1.5 shadow-md shadow-emerald-950/40 transition-transform active:scale-95"
            >
              <Download className="size-3.5 stroke-[2.5]" />
              <span>Download</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // STANDARD GRID VIEW
  return (
    <div className="flex flex-col items-center justify-between p-4 sm:p-5 rounded-3xl border border-zinc-800/80 bg-zinc-900/60 hover:bg-zinc-900 hover:border-zinc-700 transition-all text-center group shadow-md hover:shadow-xl">
      
      {/* Icon, Name and Size */}
      <div 
        onClick={() => {
          if (hasUpdate) onInstall(app, true);
          else if (isInstalled) onOpenApp(app);
          else if (isDownloaded) onInstall(app);
          else if (!isDownloading) onDownload(app);
        }}
        className="flex flex-col items-center w-full cursor-pointer"
      >
        {/* Icon */}
        <div className="relative size-20 sm:size-24 rounded-2xl overflow-hidden bg-zinc-800 border border-zinc-700/60 shadow-lg mb-3.5 group-hover:scale-105 transition-transform flex-shrink-0">
          {!imgError ? (
            <img
              src={app.icon}
              alt={app.label}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-bold text-2xl text-white bg-gradient-to-br from-emerald-600 to-green-800">
              {initial}
            </div>
          )}
        </div>

        {/* Name */}
        <h3 className="font-semibold text-sm sm:text-base text-zinc-100 truncate w-full group-hover:text-emerald-400 transition-colors px-1">
          {app.label}
        </h3>

        {/* Size */}
        <p className="text-xs text-zinc-400 mt-1 mb-4">
          {sizeMb} MB
        </p>
      </div>

      {/* Download / Action Button */}
      <div className="w-full mt-auto">
        {hasUpdate ? (
          <button
            onClick={() => onInstall(app, true)}
            className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-zinc-950 flex items-center justify-center gap-1.5 shadow-md shadow-amber-950/40 transition-transform active:scale-95"
          >
            <RefreshCw className="size-3.5" />
            <span>Update</span>
          </button>
        ) : isInstalled ? (
          <button
            onClick={() => onOpenApp(app)}
            className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-emerald-400 border border-zinc-700 flex items-center justify-center gap-1.5 transition-transform active:scale-95"
          >
            <Play className="size-3.5 fill-current" />
            <span>Open</span>
          </button>
        ) : isDownloading ? (
          <div className="w-full space-y-1.5 bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-400 font-mono text-[11px]">{downloadTask?.progress}%</span>
              <button 
                onClick={() => onPauseDownload(app.app_id)}
                className="p-0.5 text-zinc-400 hover:text-white"
                title="Pause"
              >
                <Pause className="size-3" />
              </button>
            </div>
            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 transition-all duration-200" 
                style={{ width: `${downloadTask?.progress || 0}%` }}
              />
            </div>
          </div>
        ) : isPaused ? (
          <button
            onClick={() => onResumeDownload(app.app_id)}
            className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center justify-center gap-1.5 border border-zinc-700"
          >
            <RotateCcw className="size-3.5 text-emerald-400" />
            <span>Resume</span>
          </button>
        ) : isDownloaded ? (
          <button
            onClick={() => onInstall(app)}
            className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/40 transition-transform active:scale-95"
          >
            <Check className="size-3.5 stroke-[2.5]" />
            <span>Install</span>
          </button>
        ) : (
          <button
            onClick={() => onDownload(app)}
            className="w-full py-2.5 px-3 rounded-xl font-semibold text-xs bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/40 transition-transform active:scale-95"
          >
            <Download className="size-3.5 stroke-[2.5]" />
            <span>Download</span>
          </button>
        )}
      </div>

    </div>
  );
};
