import React from 'react';
import { 
  Play, 
  Trash2, 
  HardDrive, 
  Download, 
  Sparkles, 
  CheckCircle2, 
  Package, 
  RefreshCw,
  FolderArchive
} from 'lucide-react';
import { AppItem, InstalledApp } from '../types/store';

interface InstalledTabProps {
  apps: AppItem[];
  installedApps: Record<string, InstalledApp>;
  onOpenApp: (app: AppItem) => void;
  onUninstall: (packageName: string) => void;
  onInstall: (app: AppItem, isUpdate?: boolean) => void;
  onOpenStore: () => void;
  onBackupApk: (app: AppItem) => void;
}

export const InstalledTab: React.FC<InstalledTabProps> = ({
  apps,
  installedApps,
  onOpenApp,
  onUninstall,
  onInstall,
  onOpenStore,
  onBackupApk
}) => {
  const installedList = Object.values(installedApps);

  const totalBytes = installedList.reduce((acc, curr) => acc + curr.size, 0);
  const totalMb = (totalBytes / (1024 * 1024)).toFixed(1);

  return (
    <div className="space-y-6">
      
      {/* Device Storage Status Bar */}
      <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <HardDrive className="size-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-zinc-100">
              Installed Applications ({installedList.length})
            </h2>
          </div>
          <p className="text-xs text-zinc-400">
            Internal Device Storage: <strong className="text-zinc-200">{totalMb} MB</strong> used by installed applications.
          </p>
        </div>

        {installedList.length > 0 && (
          <div className="w-full sm:w-48 space-y-1.5">
            <div className="flex justify-between text-[11px] text-zinc-400">
              <span>Virtual Storage</span>
              <span className="font-mono">{totalMb} MB / 128 GB</span>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${Math.min(100, Math.max(5, (totalBytes / (1024 * 1024 * 500)) * 100))}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Installed Apps Grid / List */}
      {installedList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {installedList.map(item => {
            const app = apps.find(a => a.package === item.package);
            const sizeMb = (item.size / (1024 * 1024)).toFixed(1);
            const hasUpdate = app && (item.updateAvailable || item.installedVersion !== app.ver_name);

            return (
              <div
                key={item.package}
                className="p-4 sm:p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800/90 hover:border-zinc-700 transition-all flex items-start gap-4"
              >
                {/* Icon */}
                <div className="size-14 rounded-2xl overflow-hidden bg-zinc-800 border border-zinc-700 shadow-md flex-shrink-0">
                  <img
                    src={item.icon}
                    alt={item.label}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-base text-zinc-100 truncate">
                      {item.label}
                    </h3>
                    {hasUpdate && (
                      <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full flex-shrink-0">
                        Update Ready
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-zinc-500 font-mono truncate mt-0.5">
                    {item.package}
                  </p>

                  <div className="flex items-center gap-2 text-xs text-zinc-400 mt-2">
                    <span className="font-semibold text-emerald-400">v{item.installedVersion}</span>
                    <span>•</span>
                    <span>{sizeMb} MB</span>
                    <span>•</span>
                    <span className="text-zinc-500">
                      {new Date(item.installedDate).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-4">
                    {app && (
                      <button
                        onClick={() => onOpenApp(app)}
                        className="px-3.5 py-1.5 rounded-xl font-bold text-xs bg-zinc-800 hover:bg-zinc-700 text-emerald-400 border border-zinc-700 flex items-center gap-1.5 transition-colors"
                      >
                        <Play className="size-3.5 fill-current" />
                        <span>Open</span>
                      </button>
                    )}

                    {app && hasUpdate && (
                      <button
                        onClick={() => onInstall(app, true)}
                        className="px-3 py-1.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-zinc-950 flex items-center gap-1.5"
                      >
                        <RefreshCw className="size-3" />
                        <span>Update</span>
                      </button>
                    )}

                    {app && (
                      <button
                        onClick={() => onBackupApk(app)}
                        className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                        title="Extract / Save APK to your disk"
                      >
                        <FolderArchive className="size-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => onUninstall(item.package)}
                      className="p-2 rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors ml-auto"
                      title="Uninstall app"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-4">
          <div className="size-16 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 flex items-center justify-center mx-auto">
            <Package className="size-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-zinc-200">
              No applications installed yet
            </h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Browse the store catalog to download and install available applications.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={onOpenStore}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 inline-flex items-center gap-2 shadow-lg shadow-emerald-950/50"
            >
              <span>Explore Store</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
