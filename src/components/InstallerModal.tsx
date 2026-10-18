import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Play, 
  X, 
  AlertCircle, 
  Lock, 
  Cpu, 
  FileCheck2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { AppItem } from '../types/store';
import { soundManager } from '../utils/audio';

interface InstallerModalProps {
  app: AppItem | null;
  isOpen: boolean;
  isUpdate?: boolean;
  targetVersion?: string;
  onClose: () => void;
  onInstallComplete: (app: AppItem, targetVersion: string) => void;
  onOpenApp: (app: AppItem) => void;
}

export const InstallerModal: React.FC<InstallerModalProps> = ({
  app,
  isOpen,
  isUpdate = false,
  targetVersion,
  onClose,
  onInstallComplete,
  onOpenApp
}) => {
  const [step, setStep] = useState<'prompt' | 'installing' | 'completed'>('prompt');
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Verifying package integrity...');
  const [showPermissions, setShowPermissions] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep('prompt');
      setProgress(0);
      setStatusMessage('Verifying package integrity...');
      setShowPermissions(false);
    }
  }, [isOpen]);

  if (!isOpen || !app) return null;

  const versionToInstall = targetVersion || app.ver_name;
  const sizeMb = (app.size / (1024 * 1024)).toFixed(1);

  const startInstallation = () => {
    setStep('installing');
    setProgress(10);
    soundManager.playClick();

    const stages = [
      { p: 25, msg: 'Verifying cryptographic signature...' },
      { p: 50, msg: 'Extracting native ABIs (' + (app.abi[0] || 'arm64-v8a') + ')...' },
      { p: 75, msg: 'Optimizing bytecode with Android Runtime...' },
      { p: 95, msg: 'Registering manifest permissions...' },
      { p: 100, msg: 'Installation finalized.' }
    ];

    let currentStage = 0;
    const interval = setInterval(() => {
      if (currentStage < stages.length) {
        setProgress(stages[currentStage].p);
        setStatusMessage(stages[currentStage].msg);
        currentStage++;
      } else {
        clearInterval(interval);
        setStep('completed');
        soundManager.playInstallSuccess();
        onInstallComplete(app, versionToInstall);

        // Confetti burst
        try {
          confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#10b981', '#22c55e', '#3b82f6', '#f59e0b']
          });
        } catch {
          // Fallback if canvas confetti fails
        }
      }
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Android Package Installer Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-zinc-900 border-b border-zinc-800/80">
          <div className="flex items-center gap-2">
            <div className="size-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <FileCheck2 className="size-3.5" />
            </div>
            <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              Package Installer
            </span>
          </div>
          {step !== 'installing' && (
            <button 
              onClick={onClose}
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6">
          
          {/* App Identity Row */}
          <div className="flex items-center gap-4">
            <div className="size-16 rounded-2xl overflow-hidden bg-zinc-800 border border-zinc-700 shadow-md flex-shrink-0">
              <img
                src={app.icon}
                alt={app.label}
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold text-zinc-100 truncate">
                {app.label}
              </h2>
              <p className="text-xs text-zinc-400 font-mono truncate">
                {app.package}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  v{versionToInstall}
                </span>
                <span className="text-xs text-zinc-400">{sizeMb} MB</span>
              </div>
            </div>
          </div>

          {/* STEP 1: PROMPT */}
          {step === 'prompt' && (
            <div className="mt-6 space-y-4">
              
              {/* Question */}
              <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-sm text-zinc-200">
                {isUpdate ? (
                  <p>Do you want to install an <strong>update</strong> to this existing application? Your existing data will not be lost.</p>
                ) : (
                  <p>Do you want to install this application? It will be verified and stored in your device apps directory.</p>
                )}
              </div>

              {/* Security scan badge */}
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-300">
                <ShieldCheck className="size-4 text-emerald-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="font-semibold">Antivirus Verified</div>
                  <div className="text-[11px] text-emerald-400/80">3/3 Engines Clean • Safe APK Package</div>
                </div>
              </div>

              {/* Expandable Permissions */}
              <div className="border border-zinc-800/80 rounded-xl overflow-hidden bg-zinc-900/40">
                <button
                  type="button"
                  onClick={() => setShowPermissions(!showPermissions)}
                  className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs text-zinc-300 hover:bg-zinc-800/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Lock className="size-3.5 text-zinc-400" />
                    <span>App Permissions ({app.permissions.length})</span>
                  </div>
                  {showPermissions ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                </button>

                {showPermissions && (
                  <div className="p-3 border-t border-zinc-800 space-y-2 text-xs text-zinc-400 max-h-40 overflow-y-auto">
                    {app.permissions.map((perm, idx) => (
                      <div key={idx} className="pb-1.5 border-b border-zinc-800/40 last:border-0 last:pb-0">
                        <div className="font-mono text-[11px] text-emerald-400">{perm.name}</div>
                        <div className="text-[11px] text-zinc-400 mt-0.5">{perm.desc}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 text-sm font-semibold rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={startInstallation}
                  className="px-6 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white shadow-lg shadow-emerald-950/50 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isUpdate ? 'Update' : 'Install'}
                </button>
              </div>

            </div>
          )}

          {/* STEP 2: INSTALLING PROGRESS */}
          {step === 'installing' && (
            <div className="mt-8 space-y-5 text-center">
              <div className="relative size-16 mx-auto">
                <div className="size-16 rounded-full border-4 border-zinc-800 border-t-emerald-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center font-mono text-xs font-bold text-zinc-300">
                  {progress}%
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-base text-zinc-200">
                  {isUpdate ? 'Updating...' : 'Installing...'}
                </h3>
                <p className="text-xs text-zinc-400 mt-1 font-mono">
                  {statusMessage}
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="text-[11px] text-zinc-500 font-mono">
                ABI: {app.abi[0] || 'arm64-v8a'} • SDK: {app.targetSdk || 34}
              </div>
            </div>
          )}

          {/* STEP 3: COMPLETED */}
          {step === 'completed' && (
            <div className="mt-6 space-y-6 text-center animate-fade-in">
              <div className="size-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-xl shadow-emerald-950/40">
                <CheckCircle2 className="size-9 stroke-[2.5]" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-zinc-100">
                  {isUpdate ? 'Application updated.' : 'Application installed.'}
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  {app.label} v{versionToInstall} is ready to use on your device.
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 text-sm font-semibold rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors"
                >
                  Done
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onOpenApp(app);
                  }}
                  className="flex-1 py-2.5 px-4 text-sm font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Play className="size-4 fill-current" />
                  <span>Open</span>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
