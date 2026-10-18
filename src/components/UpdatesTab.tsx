import React from 'react';
import { 
  RefreshCw, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Download,
  AlertCircle
} from 'lucide-react';
import { AppItem, InstalledApp } from '../types/store';

interface UpdatesTabProps {
  apps: AppItem[];
  installedApps: Record<string, InstalledApp>;
  onInstall: (app: AppItem, isUpdate?: boolean) => void;
  onUpdateAll: () => void;
  onSimulateUpdates: () => void;
  onCheckUpdates: () => void;
  isCheckingUpdates: boolean;
}

export const UpdatesTab: React.FC<UpdatesTabProps> = ({
  apps,
  installedApps,
  onInstall,
  onUpdateAll,
  onSimulateUpdates,
  onCheckUpdates,
  isCheckingUpdates
}) => {
  // Find apps that are installed and have updates
  const appsWithUpdates = apps.filter(app => {
    const installed = installedApps[app.package];
    if (!installed) return false;
    return installed.updateAvailable || (installed.installedVersion !== app.ver_name);
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-zinc-900 to-zinc-900 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <RefreshCw className="size-5 text-amber-400" />
            <h2 className="text-lg font-bold text-zinc-100">
              Application Updates Manager
            </h2>
          </div>
          <p className="text-xs text-zinc-400">
            {appsWithUpdates.length > 0 
              ? `${appsWithUpdates.length} update${appsWithUpdates.length > 1 ? 's' : ''} available for your installed applications.`
              : 'All your installed applications are running the latest version.'
            }
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onCheckUpdates}
            disabled={isCheckingUpdates}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`size-3.5 ${isCheckingUpdates ? 'animate-spin text-emerald-400' : ''}`} />
            <span>Check for Updates</span>
          </button>

          {appsWithUpdates.length > 0 && (
            <button
              onClick={onUpdateAll}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 flex items-center gap-1.5 shadow-lg shadow-amber-950/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <RefreshCw className="size-3.5" />
              <span>Update All ({appsWithUpdates.length})</span>
            </button>
          )}

          <button
            onClick={onSimulateUpdates}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 transition-colors"
            title="Set installed apps to an older version to test updates"
          >
            <Sparkles className="size-3.5 text-amber-400" />
            <span>Simulate Outdated Apps</span>
          </button>
        </div>
      </div>

      {/* Updates List */}
      {appsWithUpdates.length > 0 ? (
        <div className="space-y-3">
          {appsWithUpdates.map(app => {
            const installed = installedApps[app.package];
            const sizeMb = (app.size / (1024 * 1024)).toFixed(1);

            return (
              <div
                key={app.app_id}
                className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 hover:border-amber-500/40 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                {/* App Info */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="size-14 rounded-2xl overflow-hidden bg-zinc-800 border border-zinc-700/60 shadow-md flex-shrink-0">
                    <img
                      src={app.icon}
                      alt={app.label}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-zinc-100">{app.label}</h3>
                      <span className="text-xs text-zinc-500 font-mono truncate hidden sm:inline">
                        {app.package}
                      </span>
                    </div>

                    {/* Version Jump Indicator */}
                    <div className="flex items-center gap-2 text-xs">
                      <span className="bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded font-mono">
                        v{installed?.installedVersion || '1.0'}
                      </span>
                      <ArrowRight className="size-3.5 text-amber-400" />
                      <span className="bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30 px-2 py-0.5 rounded font-mono">
                        v{app.ver_name}
                      </span>
                      <span className="text-zinc-500">•</span>
                      <span className="text-zinc-400">{sizeMb} MB</span>
                    </div>

                    {/* What's new */}
                    <p className="text-xs text-zinc-400 line-clamp-1 pt-0.5">
                      {app.changelog?.[0] || 'Performance improvements, bug fixes and compatibility updates.'}
                    </p>
                  </div>
                </div>

                {/* Right Action */}
                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                  <button
                    onClick={() => onInstall(app, true)}
                    className="flex-1 md:flex-initial px-5 py-2.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-zinc-950 flex items-center justify-center gap-2 shadow-lg shadow-amber-950/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <RefreshCw className="size-3.5" />
                    <span>Update</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-4">
          <div className="size-16 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
            <CheckCircle2 className="size-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-zinc-200">
              Your device apps are up to date
            </h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              All installed applications are running the latest version. You can simulate older versions below to test the update flow.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={onSimulateUpdates}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-zinc-700 inline-flex items-center gap-2"
            >
              <Sparkles className="size-3.5 text-amber-400" />
              <span>Simulate Outdated Apps for Demo</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
