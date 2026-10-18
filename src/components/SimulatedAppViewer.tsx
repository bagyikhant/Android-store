import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  Power, 
  ShieldCheck, 
  Play, 
  Pause, 
  Sliders, 
  Film, 
  Download, 
  Phone, 
  Globe, 
  Radio, 
  Check, 
  ArrowLeft,
  Volume2
} from 'lucide-react';
import { AppItem } from '../types/store';

interface SimulatedAppViewerProps {
  app: AppItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SimulatedAppViewer: React.FC<SimulatedAppViewerProps> = ({
  app,
  isOpen,
  onClose
}) => {
  // Proton / Potato / V2ray state
  const [vpnConnected, setVpnConnected] = useState(false);
  const [vpnServer, setVpnServer] = useState('Netherlands #1 (Free)');

  // Boom Equalizer state
  const [bassBoost, setBassBoost] = useState(75);
  const [surround3d, setSurround3d] = useState(true);

  // USSD direct dialer state
  const [dialedResponse, setDialedResponse] = useState<string | null>(null);

  // DNS changer state
  const [dnsActive, setDnsActive] = useState(false);
  const [selectedDns, setSelectedDns] = useState('Cloudflare 1.1.1.1');

  // Music state
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);

  if (!isOpen || !app) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      {/* Android Device Mockup Container */}
      <div 
        className="w-full max-w-sm bg-zinc-950 border-4 border-zinc-700/80 rounded-[44px] shadow-2xl overflow-hidden flex flex-col h-[720px] max-h-[92vh] relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Android Punch Hole Camera */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-black z-30 flex items-center justify-center">
          <div className="size-2 rounded-full bg-zinc-900 border border-zinc-800" />
        </div>

        {/* Status Bar */}
        <div className="pt-2 px-6 pb-2 flex items-center justify-between text-[11px] font-mono text-zinc-400 bg-zinc-950 z-20">
          <span>12:45</span>
          <div className="flex items-center gap-1.5">
            <span>5G</span>
            <span>100%</span>
          </div>
        </div>

        {/* In-App Action Bar */}
        <div className="px-4 py-3 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="size-8 rounded-xl overflow-hidden bg-zinc-800 flex-shrink-0">
              <img src={app.icon} alt={app.label} className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-xs text-white truncate">{app.label}</h3>
              <p className="text-[10px] text-emerald-400 font-mono">Running v{app.ver_name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-white bg-zinc-800"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Dynamic App Content Interface */}
        <div className="flex-1 overflow-y-auto p-5 bg-zinc-950 text-zinc-100 flex flex-col justify-between">
          
          {/* 1. VPN APPS (Proton VPN, PotatoVPN, V2ray Tunnel Plus) */}
          {(app.label.includes('VPN') || app.label.includes('Tunnel')) && (
            <div className="flex-1 flex flex-col justify-between items-center text-center py-4 space-y-6">
              <div className="space-y-1">
                <span className="text-xs text-zinc-400 uppercase tracking-widest">
                  Secure Encrypted Tunnel
                </span>
                <h4 className="text-xl font-bold">
                  {vpnConnected ? 'Connected & Protected' : 'Disconnected'}
                </h4>
                <p className="text-xs text-zinc-400">
                  {vpnConnected ? `Virtual IP: 185.159.157.${Math.floor(Math.random()*200 + 10)}` : 'Tap power button to encrypt traffic'}
                </p>
              </div>

              {/* Power Toggle Button */}
              <button
                onClick={() => setVpnConnected(!vpnConnected)}
                className={`size-32 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-2xl ${
                  vpnConnected
                    ? 'bg-emerald-500 text-zinc-950 shadow-emerald-500/30 scale-105'
                    : 'bg-zinc-900 text-zinc-400 border-2 border-zinc-800 hover:border-emerald-500/50'
                }`}
              >
                <Power className={`size-12 ${vpnConnected ? 'stroke-[2.5]' : ''}`} />
                <span className="text-xs font-bold mt-2">
                  {vpnConnected ? 'STOP' : 'CONNECT'}
                </span>
              </button>

              {/* Server selector */}
              <div className="w-full space-y-2">
                <div className="text-[11px] text-zinc-400 text-left">Select Tunnel Gateway:</div>
                <div className="grid grid-cols-1 gap-2">
                  {['Netherlands #1 (Fast)', 'Switzerland SecureCore', 'Japan Tokyo #4', 'Singapore P2P'].map(s => (
                    <button
                      key={s}
                      onClick={() => setVpnServer(s)}
                      className={`w-full p-2.5 rounded-xl text-xs font-medium flex items-center justify-between border transition-colors ${
                        vpnServer === s
                          ? 'bg-zinc-800 border-emerald-500 text-emerald-400'
                          : 'bg-zinc-900/60 border-zinc-800 text-zinc-300'
                      }`}
                    >
                      <span>{s}</span>
                      {vpnServer === s && <Check className="size-3.5" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. 1DM / 1DM+ DOWNLOAD MANAGER */}
          {app.label.includes('1DM') && (
            <div className="space-y-4">
              <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
                <div className="text-xs font-semibold text-emerald-400">Turbo Download Engine</div>
                <div className="text-[11px] text-zinc-400">16 Multi-part concurrent HTTP threads active</div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-semibold text-zinc-300">Active Transfers (2)</div>
                <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-zinc-200">Ubuntu_24.04_LTS.iso</span>
                    <span className="font-mono text-emerald-400 font-bold">78%</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="w-[78%] h-full bg-emerald-500" />
                  </div>
                  <div className="flex justify-between text-[10px] text-zinc-400">
                    <span>14.2 MB/s • 16 parts</span>
                    <span>1.8 GB / 2.3 GB</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-zinc-200">Android_SDK_Platform.zip</span>
                    <span className="font-mono text-emerald-400 font-bold">42%</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="w-[42%] h-full bg-emerald-500" />
                  </div>
                  <div className="flex justify-between text-[10px] text-zinc-400">
                    <span>9.6 MB/s • 8 parts</span>
                    <span>184 MB / 440 MB</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-300">
                Torrents & Magnet links supported with built-in DHT client.
              </div>
            </div>
          )}

          {/* 3. KMOVIEBOX */}
          {app.label.includes('Movie') && (
            <div className="space-y-4">
              <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800">
                <div className="text-xs font-bold text-amber-400">Featured Cinema Showcase</div>
                <div className="text-[11px] text-zinc-400 mt-1">Myanmar subtitles & 1080p stream enabled</div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { title: 'The Matrix Resurrections', genre: 'Sci-Fi • 4K' },
                  { title: 'Oppenheimer', genre: 'Drama • 1080p' },
                  { title: 'Spider-Man No Way Home', genre: 'Action • HD' },
                  { title: 'Interstellar', genre: 'Sci-Fi • 1080p' }
                ].map((m, i) => (
                  <div key={i} className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                    <Film className="size-5 text-emerald-400" />
                    <div className="text-xs font-bold text-zinc-200 truncate">{m.title}</div>
                    <div className="text-[10px] text-zinc-500">{m.genre}</div>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-center">
                <span className="text-xs text-zinc-400">Subtitles: Myanmar (Unicode / Zawgyi auto-detect)</span>
              </div>
            </div>
          )}

          {/* 4. BOOM 3D AUDIO */}
          {app.label.includes('Boom') && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-center space-y-1">
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  3D Surround Equalizer
                </div>
                <div className="text-xs text-zinc-300">Spatial Audio Processing Active</div>
              </div>

              <div className="space-y-3 p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800">
                <div className="flex justify-between text-xs">
                  <span>Bass Booster</span>
                  <span className="font-mono text-emerald-400">{bassBoost}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={bassBoost}
                  onChange={(e) => setBassBoost(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />

                <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-xs">
                  <span>3D Surround Effect</span>
                  <button
                    onClick={() => setSurround3d(!surround3d)}
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      surround3d ? 'bg-emerald-500 text-zinc-950' : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {surround3d ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 5. MYANMAR USSD CALL */}
          {app.label.includes('USSD') && (
            <div className="space-y-3">
              <div className="text-xs font-semibold text-zinc-400">Quick USSD Shortcuts:</div>

              <div className="grid grid-cols-1 gap-2">
                {[
                  { code: '*124#', label: 'MPT Balance Check' },
                  { code: '*979#', label: 'Atom (Telenor) Data Pack' },
                  { code: '*106#', label: 'Ooredoo Supernet Promo' },
                  { code: '*999#', label: 'Mytel Data & Telecom' }
                ].map(item => (
                  <button
                    key={item.code}
                    onClick={() => setDialedResponse(`Dialing ${item.code}...\nRequesting USSD response from telecom gateway.`)}
                    className="p-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-left flex items-center justify-between transition-colors"
                  >
                    <div>
                      <div className="font-mono font-bold text-emerald-400 text-sm">{item.code}</div>
                      <div className="text-[11px] text-zinc-400">{item.label}</div>
                    </div>
                    <Phone className="size-4 text-emerald-400" />
                  </button>
                ))}
              </div>

              {dialedResponse && (
                <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs font-mono text-emerald-300">
                  {dialedResponse}
                </div>
              )}
            </div>
          )}

          {/* 6. DNS CHANGER */}
          {app.label.includes('DNS') && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-center space-y-2">
                <div className="text-xs text-zinc-400">DNS Proxy Status</div>
                <button
                  onClick={() => setDnsActive(!dnsActive)}
                  className={`px-6 py-2.5 rounded-full font-bold text-xs transition-all ${
                    dnsActive ? 'bg-emerald-500 text-zinc-950' : 'bg-zinc-800 text-zinc-300'
                  }`}
                >
                  {dnsActive ? 'DNS ACTIVE (Connected)' : 'CONNECT DNS'}
                </button>
              </div>

              <div className="space-y-2">
                <div className="text-xs text-zinc-400">Available DNS Providers:</div>
                {['Cloudflare 1.1.1.1', 'Google 8.8.8.8', 'AdGuard DNS (AdBlock)', 'Quad9 Security'].map(dns => (
                  <button
                    key={dns}
                    onClick={() => setSelectedDns(dns)}
                    className={`w-full p-2.5 rounded-xl text-xs flex justify-between border ${
                      selectedDns === dns
                        ? 'bg-zinc-800 border-emerald-500 text-emerald-400'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-300'
                    }`}
                  >
                    <span>{dns}</span>
                    {selectedDns === dns && <Check className="size-3.5" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 7. MEDITATIVE MIND */}
          {app.label.includes('Mind') && (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
              <div className="size-24 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 animate-pulse">
                <Volume2 className="size-10" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-zinc-100">Solfeggio Frequency 528 Hz</h4>
                <p className="text-xs text-zinc-400">DNA Repair & Deep Restorative Meditation</p>
              </div>
              <button
                onClick={() => setIsPlayingMusic(!isPlayingMusic)}
                className="px-6 py-2.5 rounded-full bg-emerald-500 text-zinc-950 font-bold text-xs flex items-center gap-2 shadow-lg"
              >
                {isPlayingMusic ? <Pause className="size-4" /> : <Play className="size-4 fill-current" />}
                <span>{isPlayingMusic ? 'PAUSE AMBIENCE' : 'PLAY AMBIENCE'}</span>
              </button>
            </div>
          )}

          {/* Android Navigation Bar */}
          <div className="pt-4 border-t border-zinc-900 flex items-center justify-around text-zinc-500">
            <button onClick={onClose} className="p-2 hover:text-zinc-300">
              <ArrowLeft className="size-4" />
            </button>
            <button onClick={onClose} className="p-2 hover:text-zinc-300">
              <div className="size-3 rounded-full border-2 border-current" />
            </button>
            <button onClick={onClose} className="p-2 hover:text-zinc-300">
              <div className="size-3 border-2 border-current" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
