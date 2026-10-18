export interface Permission {
  name: string;
  desc: string;
}

export interface AppItem {
  app_id: string;
  file_status?: number;
  size: number;
  time: number;
  label: string;
  package: string;
  ver_name: string;
  ver_code: number;
  downloads: number;
  author: {
    id: number;
    name: string;
    icon?: {
      icon: string;
      label?: Record<string, string>;
      color?: string;
    };
    url: string;
  };
  user_id?: number;
  user_icon?: {
    icon: string;
    label?: Record<string, string>;
    color?: string;
  };
  icon: string;
  rating: number;
  category: {
    id: number;
    name: Record<string, string>;
    icon: string;
  };
  categoryName: string;
  exclusive?: boolean;
  source_url?: string;
  abi: string[];
  description: string;
  changelog: string[];
  permissions: Permission[];
  screenshots: string[];
  downloadUrl: string;
  downloadPage: string;
  apptekaUrl: string;
  sha256: string;
  targetSdk: number;
  minSdk: string;
  minAndroid?: string;
  installed?: boolean;
  installedVersion?: string | null;
  hasUpdate?: boolean;
  antivirusStatus: string;
  uploadedDate: string;
}

export interface DownloadTask {
  appId: string;
  package: string;
  label: string;
  icon: string;
  progress: number; // 0 - 100
  speed: string;
  downloadedBytes: number;
  totalBytes: number;
  status: 'pending' | 'downloading' | 'paused' | 'completed' | 'cancelled' | 'failed';
  startedAt: number;
  completedAt?: number;
  targetVersion: string;
  downloadUrl: string;
}

export interface InstalledApp {
  package: string;
  label: string;
  installedVersion: string;
  installedVerCode: number;
  installedDate: number;
  size: number;
  app_id: string;
  icon: string;
  apptekaUrl: string;
  updateAvailable?: boolean;
  targetUpdateVersion?: string;
}

export type SortOption = 'name' | 'downloads' | 'date' | 'size';
export type ViewTab = 'store' | 'updates' | 'installed' | 'downloads';
export type DisplayMode = 'grid' | 'compact' | 'phone_mockup';
export type ThemeMode = 'dark' | 'light' | 'cyber';
