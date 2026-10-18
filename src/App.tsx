import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  AppItem, 
  DownloadTask, 
  InstalledApp, 
  SortOption, 
  ViewTab, 
  DisplayMode 
} from './types/store';
import { APPS_DATA } from './data/appsData';
import { NavTabs } from './components/NavTabs';
import { AppCard } from './components/AppCard';
import { InstallerModal } from './components/InstallerModal';
import { UpdatesTab } from './components/UpdatesTab';
import { InstalledTab } from './components/InstalledTab';
import { DownloadsDrawer } from './components/DownloadsDrawer';
import { SimulatedAppViewer } from './components/SimulatedAppViewer';
import { soundManager } from './utils/audio';
import { 
  CheckCircle2, 
  Download, 
  RefreshCw, 
  Smartphone, 
  ShieldCheck, 
  ExternalLink,
  Sparkles
} from 'lucide-react';

const STORAGE_KEY_INSTALLED = 'appteka_installed_apps_v1';
const STORAGE_KEY_TASKS = 'appteka_download_tasks_v1';

export default function App() {
  // State for installed applications
  const [installedApps, setInstalledApps] = useState<Record<string, InstalledApp>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_INSTALLED);
      if (saved) return JSON.parse(saved);
    } catch {}
    // Initial friendly default: Pre-install 1DM+ with an update available to showcase the update engine immediately!
    const defaultInstalled: Record<string, InstalledApp> = {
      'idm.internet.download.manager.plus': {
        package: 'idm.internet.download.manager.plus',
        label: '1DM+',
        installedVersion: '20.0', // Older version than repository 21.0
        installedVerCode: 30200,
        installedDate: Date.now() - 86400000 * 5,
        size: 56952817,
        app_id: '706r329669',
        icon: 'https://appteka.store/icon/1f4e3e8016b3c52239406f6d7d1f7373d507147d.png?e=1793232000&s=a',
        apptekaUrl: 'https://appteka.store/app/706r329669',
        updateAvailable: true,
        targetUpdateVersion: '21.0'
      }
    };
    return defaultInstalled;
  });

  // State for download tasks
  const [downloadTasks, setDownloadTasks] = useState<DownloadTask[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TASKS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Navigation & Filtering
  const [activeTab, setActiveTab] = useState<ViewTab>('store');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<SortOption>('name'); // Default sort=name as in https://appteka.store/profile/525901?sort=name
  const [isCompactView, setIsCompactView] = useState(false);
  const [displayMode, setDisplayMode] = useState<DisplayMode>('grid');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [turboSpeed, setTurboSpeed] = useState(false);
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false);

  // Modals & Drawers
  const [installerState, setInstallerState] = useState<{
    isOpen: boolean;
    app: AppItem | null;
    isUpdate?: boolean;
    targetVersion?: string;
  }>({ isOpen: false, app: null });

  const [runningApp, setRunningApp] = useState<AppItem | null>(null);
  const [downloadsDrawerOpen, setDownloadsDrawerOpen] = useState(false);

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'update' } | null>(null);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'update' = 'info') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, type });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_INSTALLED, JSON.stringify(installedApps));
    } catch {}
  }, [installedApps]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(downloadTasks));
    } catch {}
  }, [downloadTasks]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    set.add('All');
    APPS_DATA.forEach(a => set.add(a.categoryName));
    return Array.from(set);
  }, []);

  // Filtered & Sorted Apps
  const filteredApps = useMemo(() => {
    let result = [...APPS_DATA];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(a => 
        a.label.toLowerCase().includes(q) ||
        a.package.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.categoryName.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategory !== 'All') {
      result = result.filter(a => a.categoryName === selectedCategory);
    }

    // Sorting
    if (sortBy === 'name') {
      result.sort((a, b) => a.label.localeCompare(b.label));
    } else if (sortBy === 'downloads') {
      result.sort((a, b) => b.downloads - a.downloads);
    } else if (sortBy === 'size') {
      result.sort((a, b) => b.size - a.size);
    } else if (sortBy === 'date') {
      result.sort((a, b) => b.time - a.time);
    }

    return result;
  }, [searchQuery, selectedCategory, sortBy]);

  // Count metrics
  const activeDownloadsCount = downloadTasks.filter(t => t.status === 'downloading' || t.status === 'pending').length;
  
  const updatesCount = useMemo(() => {
    return APPS_DATA.filter(app => {
      const inst = installedApps[app.package];
      return inst && (inst.updateAvailable || inst.installedVersion !== app.ver_name);
    }).length;
  }, [installedApps]);

  const installedCount = Object.keys(installedApps).length;

  // Active Download Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setDownloadTasks(prev => {
        let hasChanges = false;
        const next = prev.map(task => {
          if (task.status !== 'downloading') return task;

          hasChanges = true;
          // Calculate step increment
          const speedMultiplier = turboSpeed ? 2.5 : 1;
          const chunk = Math.min(task.totalBytes - task.downloadedBytes, (task.totalBytes * 0.05 * speedMultiplier));
          const newDownloaded = task.downloadedBytes + chunk;
          const newProgress = Math.min(100, Math.floor((newDownloaded / task.totalBytes) * 100));

          const mbPerSec = (turboSpeed ? (11 + Math.random() * 3) : (4.2 + Math.random() * 1.5)).toFixed(1);

          if (newProgress >= 100) {
            soundManager.playDownloadComplete();
            showToast(`Download finished: ${task.label} APK ready to install!`, 'success');
            return {
              ...task,
              progress: 100,
              downloadedBytes: task.totalBytes,
              status: 'completed' as const,
              speed: 'Completed',
              completedAt: Date.now()
            };
          }

          return {
            ...task,
            progress: newProgress,
            downloadedBytes: newDownloaded,
            speed: `${mbPerSec} MB/s`
          };
        });

        return hasChanges ? next : prev;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [turboSpeed]);

  // Handlers for Download
  const handleStartDownload = (app: AppItem, isUpdateTarget?: boolean) => {
    soundManager.playDownloadStart();
    const existing = downloadTasks.find(t => t.appId === app.app_id);

    if (existing && existing.status === 'completed') {
      // Prompt install immediately if already downloaded
      setInstallerState({
        isOpen: true,
        app,
        isUpdate: isUpdateTarget || !!installedApps[app.package],
        targetVersion: app.ver_name
      });
      return;
    }

    const newTask: DownloadTask = {
      appId: app.app_id,
      package: app.package,
      label: app.label,
      icon: app.icon,
      progress: 0,
      speed: turboSpeed ? '12.0 MB/s' : '4.5 MB/s',
      downloadedBytes: 0,
      totalBytes: app.size,
      status: 'downloading',
      startedAt: Date.now(),
      targetVersion: app.ver_name,
      downloadUrl: app.downloadUrl
    };

    setDownloadTasks(prev => [newTask, ...prev.filter(t => t.appId !== app.app_id)]);
    showToast(`Downloading ${app.label} v${app.ver_name} (${(app.size / (1024*1024)).toFixed(1)} MB)...`, 'info');
  };

  const handlePauseDownload = (appId: string) => {
    setDownloadTasks(prev => prev.map(t => t.appId === appId ? { ...t, status: 'paused', speed: 'Paused' } : t));
  };

  const handleResumeDownload = (appId: string) => {
    setDownloadTasks(prev => prev.map(t => t.appId === appId ? { ...t, status: 'downloading', speed: 'Resuming...' } : t));
  };

  const handleCancelDownload = (appId: string) => {
    setDownloadTasks(prev => prev.filter(t => t.appId !== appId));
    showToast('Download cancelled', 'info');
  };

  // Handlers for Installation
  const handleOpenInstaller = (app: AppItem, isUpdate?: boolean) => {
    setInstallerState({
      isOpen: true,
      app,
      isUpdate: isUpdate || !!installedApps[app.package],
      targetVersion: app.ver_name
    });
  };

  const handleInstallComplete = (app: AppItem, targetVersion: string) => {
    const newInstalled: InstalledApp = {
      package: app.package,
      label: app.label,
      installedVersion: targetVersion,
      installedVerCode: app.ver_code,
      installedDate: Date.now(),
      size: app.size,
      app_id: app.app_id,
      icon: app.icon,
      apptekaUrl: app.apptekaUrl,
      updateAvailable: false
    };

    setInstalledApps(prev => ({
      ...prev,
      [app.package]: newInstalled
    }));

    showToast(`Successfully installed ${app.label} v${targetVersion}!`, 'success');
  };

  const handleUninstall = (packageName: string) => {
    soundManager.playUninstall();
    const appName = installedApps[packageName]?.label || 'Application';
    setInstalledApps(prev => {
      const next = { ...prev };
      delete next[packageName];
      return next;
    });
    showToast(`Uninstalled ${appName} from device`, 'info');
  };

  // Quick Action: Install Featured apps
  const handleQuickInstallFeatured = () => {
    const featured = APPS_DATA.find(a => a.label === 'Proton VPN') || APPS_DATA[0];
    handleStartDownload(featured);
  };

  // Simulation: Set outdated versions to test update engine
  const handleSimulateUpdates = () => {
    setInstalledApps(prev => {
      const updated = { ...prev };
      
      // Seed 1DM+ as outdated v20.0
      updated['idm.internet.download.manager.plus'] = {
        package: 'idm.internet.download.manager.plus',
        label: '1DM+',
        installedVersion: '20.0',
        installedVerCode: 30200,
        installedDate: Date.now() - 86400000 * 7,
        size: 56952817,
        app_id: '706r329669',
        icon: 'https://appteka.store/icon/1f4e3e8016b3c52239406f6d7d1f7373d507147d.png?e=1793232000&s=a',
        apptekaUrl: 'https://appteka.store/app/706r329669',
        updateAvailable: true,
        targetUpdateVersion: '21.0'
      };

      // Seed Proton VPN as outdated v5.18.0
      updated['ch.protonvpn.android'] = {
        package: 'ch.protonvpn.android',
        label: 'Proton VPN',
        installedVersion: '5.18.0',
        installedVerCode: 605180000,
        installedDate: Date.now() - 86400000 * 14,
        size: 64046150,
        app_id: '639r330669',
        icon: 'https://appteka.store/icon/d8b967c425fc5331b8f4e62c7ca117552e208846.png?e=1793232000&s=a',
        apptekaUrl: 'https://appteka.store/app/639r330669',
        updateAvailable: true,
        targetUpdateVersion: '5.20.74.0'
      };

      return updated;
    });

    setActiveTab('updates');
    showToast('Simulated 2 outdated apps (1DM+ & Proton VPN). Check the Updates tab!', 'update');
  };

  // Check repository updates
  const handleCheckUpdates = () => {
    setIsCheckingUpdates(true);
    setTimeout(() => {
      setIsCheckingUpdates(false);
      showToast(`Repository scan complete: ${updatesCount} update(s) ready`, 'info');
    }, 1200);
  };

  // Update All batch action
  const handleUpdateAll = () => {
    const outdated = APPS_DATA.filter(app => {
      const inst = installedApps[app.package];
      return inst && (inst.updateAvailable || inst.installedVersion !== app.ver_name);
    });

    if (outdated.length > 0) {
      handleOpenInstaller(outdated[0], true);
    }
  };

  // Export / Backup APK generator
  const handleBackupApk = (app: AppItem) => {
    try {
      const dummyApkContent = `PK\x03\x04... [Android APK Container for ${app.label} (${app.package}) v${app.ver_name} - Appteka Publisher ID 525901]`;
      const blob = new Blob([dummyApkContent], { type: 'application/vnd.android.package-archive' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${app.package}_v${app.ver_name}.apk`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(`Exported ${app.label} APK backup to disk!`, 'success');
    } catch {
      window.open(app.downloadUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-zinc-950">
      
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className={`px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border text-xs font-semibold backdrop-blur-md ${
            toast.type === 'success' 
              ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-300' 
              : toast.type === 'update' 
              ? 'bg-amber-950/90 border-amber-500/40 text-amber-300' 
              : 'bg-zinc-900/90 border-zinc-700 text-zinc-200'
          }`}>
            {toast.type === 'success' && <CheckCircle2 className="size-4 text-emerald-400" />}
            {toast.type === 'update' && <RefreshCw className="size-4 text-amber-400 animate-spin-slow" />}
            {toast.type === 'info' && <Download className="size-4 text-cyan-400" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 py-4 sm:py-6">
        
        {/* If Mobile Phone Mockup Frame mode is active */}
        {displayMode === 'phone_mockup' ? (
          <div className="max-w-md mx-auto px-3">
            <div className="border-4 border-zinc-700/80 rounded-[48px] overflow-hidden bg-zinc-950 shadow-2xl p-4 sm:p-5 relative min-h-[780px]">
              {/* Phone speaker notch */}
              <div className="w-24 h-4 bg-zinc-900 rounded-full mx-auto mb-4 flex items-center justify-center">
                <div className="size-2 rounded-full bg-zinc-800" />
              </div>

              {/* Nav tabs */}
              <div className="mb-4">
                <NavTabs
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  categories={categories}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  isCompactView={true}
                  setIsCompactView={setIsCompactView}
                  totalAppsCount={APPS_DATA.length}
                  updatesCount={updatesCount}
                  installedCount={installedCount}
                  downloadsCount={downloadTasks.length}
                />
              </div>

              {/* Body */}
              {activeTab === 'store' && (
                <div className={isCompactView ? 'space-y-2.5' : 'grid grid-cols-2 gap-3'}>
                  {filteredApps.map(app => (
                    <AppCard
                      key={app.app_id}
                      app={app}
                      installedInfo={installedApps[app.package]}
                      downloadTask={downloadTasks.find(t => t.appId === app.app_id)}
                      isCompact={isCompactView}
                      onDownload={handleStartDownload}
                      onPauseDownload={handlePauseDownload}
                      onResumeDownload={handleResumeDownload}
                      onCancelDownload={handleCancelDownload}
                      onInstall={handleOpenInstaller}
                      onOpenApp={(a) => setRunningApp(a)}
                      onUninstall={handleUninstall}
                      onTriggerUpdate={(a) => {
                        setInstalledApps(prev => ({
                          ...prev,
                          [a.package]: {
                            ...prev[a.package],
                            updateAvailable: !prev[a.package]?.updateAvailable
                          }
                        }));
                      }}
                    />
                  ))}
                </div>
              )}

              {activeTab === 'updates' && (
                <UpdatesTab
                  apps={APPS_DATA}
                  installedApps={installedApps}
                  onInstall={handleOpenInstaller}
                  onUpdateAll={handleUpdateAll}
                  onSimulateUpdates={handleSimulateUpdates}
                  onCheckUpdates={handleCheckUpdates}
                  isCheckingUpdates={isCheckingUpdates}
                />
              )}

              {activeTab === 'installed' && (
                <InstalledTab
                  apps={APPS_DATA}
                  installedApps={installedApps}
                  onOpenApp={(a) => setRunningApp(a)}
                  onUninstall={handleUninstall}
                  onInstall={handleOpenInstaller}
                  onOpenStore={() => setActiveTab('store')}
                  onBackupApk={handleBackupApk}
                />
              )}
            </div>
          </div>
        ) : (
          /* Desktop / Tablet Standard View */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            
            {/* Navigation Tabs, Filters, and Sorting */}
            <NavTabs
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              sortBy={sortBy}
              setSortBy={setSortBy}
              isCompactView={isCompactView}
              setIsCompactView={setIsCompactView}
              totalAppsCount={APPS_DATA.length}
              updatesCount={updatesCount}
              installedCount={installedCount}
              downloadsCount={downloadTasks.length}
            />

            {/* TAB 1: STORE CATALOG */}
            {activeTab === 'store' && (
              <div>
                {filteredApps.length > 0 ? (
                  <div className={
                    isCompactView 
                      ? 'space-y-2.5' 
                      : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6'
                  }>
                    {filteredApps.map(app => (
                      <AppCard
                        key={app.app_id}
                        app={app}
                        installedInfo={installedApps[app.package]}
                        downloadTask={downloadTasks.find(t => t.appId === app.app_id)}
                        isCompact={isCompactView}
                        onDownload={handleStartDownload}
                        onPauseDownload={handlePauseDownload}
                        onResumeDownload={handleResumeDownload}
                        onCancelDownload={handleCancelDownload}
                        onInstall={handleOpenInstaller}
                        onOpenApp={(a) => setRunningApp(a)}
                        onUninstall={handleUninstall}
                        onTriggerUpdate={(a) => {
                          setInstalledApps(prev => ({
                            ...prev,
                            [a.package]: {
                              ...prev[a.package],
                              updateAvailable: !prev[a.package]?.updateAvailable
                            }
                          }));
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="p-16 text-center rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-3">
                    <p className="text-zinc-400 text-sm">No applications matching "{searchQuery}" in category "{selectedCategory}"</p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('All');
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                    >
                      Clear search filters
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: UPDATES */}
            {activeTab === 'updates' && (
              <UpdatesTab
                apps={APPS_DATA}
                installedApps={installedApps}
                onInstall={handleOpenInstaller}
                onUpdateAll={handleUpdateAll}
                onSimulateUpdates={handleSimulateUpdates}
                onCheckUpdates={handleCheckUpdates}
                isCheckingUpdates={isCheckingUpdates}
              />
            )}

            {/* TAB 3: INSTALLED APPS */}
            {activeTab === 'installed' && (
              <InstalledTab
                apps={APPS_DATA}
                installedApps={installedApps}
                onOpenApp={(a) => setRunningApp(a)}
                onUninstall={handleUninstall}
                onInstall={handleOpenInstaller}
                onOpenStore={() => setActiveTab('store')}
                onBackupApk={handleBackupApk}
              />
            )}

            {/* TAB 4: DOWNLOADS */}
            {activeTab === 'downloads' && (
              <div className="max-w-2xl mx-auto space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                  <h3 className="font-bold text-base text-zinc-100 flex items-center gap-2">
                    <Download className="size-4 text-emerald-400" />
                    Download Queue & Finished APKs
                  </h3>
                  <button
                    onClick={() => setTurboSpeed(!turboSpeed)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                      turboSpeed ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                    }`}
                  >
                    Turbo Mode: {turboSpeed ? 'ON (12 MB/s)' : 'OFF (4.5 MB/s)'}
                  </button>
                </div>

                {downloadTasks.length > 0 ? (
                  downloadTasks.map(task => {
                    const app = APPS_DATA.find(a => a.app_id === task.appId);
                    return (
                      <div key={task.appId} className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <img src={task.icon} alt={task.label} className="size-12 rounded-xl object-cover bg-zinc-800" />
                          <div className="min-w-0">
                            <h4 className="font-bold text-sm text-zinc-100 truncate">{task.label}</h4>
                            <p className="text-xs text-zinc-400 font-mono">v{task.targetVersion} • {task.status}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {task.status === 'completed' && app && (
                            <button
                              onClick={() => handleOpenInstaller(app)}
                              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-zinc-950"
                            >
                              Install
                            </button>
                          )}
                          <button
                            onClick={() => handleCancelDownload(task.appId)}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-12 text-center text-zinc-500 rounded-2xl bg-zinc-900/40 border border-zinc-800">
                    No active downloads in queue.
                  </div>
                )}
              </div>
            )}

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-6 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <span className="font-semibold text-zinc-400">Android Application Store</span>
          <span>10 Verified Packages</span>
        </div>
      </footer>

      {/* Modals */}
      <InstallerModal
        isOpen={installerState.isOpen}
        app={installerState.app}
        isUpdate={installerState.isUpdate}
        targetVersion={installerState.targetVersion}
        onClose={() => setInstallerState({ isOpen: false, app: null })}
        onInstallComplete={handleInstallComplete}
        onOpenApp={(app) => setRunningApp(app)}
      />

      <DownloadsDrawer
        isOpen={downloadsDrawerOpen}
        onClose={() => setDownloadsDrawerOpen(false)}
        tasks={downloadTasks}
        apps={APPS_DATA}
        onPause={handlePauseDownload}
        onResume={handleResumeDownload}
        onCancel={handleCancelDownload}
        onInstall={handleOpenInstaller}
        onClearCompleted={() => setDownloadTasks(prev => prev.filter(t => t.status !== 'completed'))}
        turboSpeed={turboSpeed}
        onToggleTurbo={() => setTurboSpeed(!turboSpeed)}
      />

      <SimulatedAppViewer
        app={runningApp}
        isOpen={!!runningApp}
        onClose={() => setRunningApp(null)}
      />

    </div>
  );
}
