import axios from 'axios';
import {
  EmergencyIncident,
  StatusHistoryItem,
  UserProfile,
  Responder,
  NotificationItem,
  AIAnalysisResult,
  AnalyticsOverview,
  IncidentStatus,
  PriorityLevel,
  EmergencyCategory,
} from '../shared/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to inject bearer auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('rescuos_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Sound Synthesizer Utility (Emergency Siren / Beeps / Alerts)
class AudioAlertService {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
  }

  playBeep(freq = 880, type: OscillatorType = 'sine', duration = 0.15) {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      // Audio autoplay restriction fallback
    }
  }

  playEmergencySiren() {
    if (!this.enabled) return;
    this.playBeep(920, 'triangle', 0.2);
    setTimeout(() => this.playBeep(640, 'triangle', 0.25), 180);
  }

  playSuccessChime() {
    if (!this.enabled) return;
    this.playBeep(523.25, 'sine', 0.12);
    setTimeout(() => this.playBeep(659.25, 'sine', 0.15), 120);
    setTimeout(() => this.playBeep(783.99, 'sine', 0.2), 240);
  }
}

export const audioAlerts = new AudioAlertService();

// API Endpoints
export const authApi = {
  async login(email: string, password: string) {
    const res = await apiClient.post<{ token: string; user: UserProfile; isDemo?: boolean }>('/auth/login', {
      email,
      password,
    });
    return res.data;
  },

  async register(data: any) {
    const res = await apiClient.post<{ token: string; user: UserProfile }>('/auth/register', data);
    return res.data;
  },

  async getMe() {
    const res = await apiClient.get<{ user: UserProfile; unreadNotifications: number }>('/auth/me');
    return res.data;
  },

  async getResponders() {
    const res = await apiClient.get<{ responders: Responder[] }>('/auth/responders');
    return res.data;
  },

  async getUsers() {
    const res = await apiClient.get<{ users: UserProfile[] }>('/auth/users');
    return res.data;
  },
};

export const incidentApi = {
  async analyze(payload: {
    category: EmergencyCategory;
    description: string;
    affectedPeopleCount: number;
    userSelectedSeverity: PriorityLevel;
    addressText?: string;
    latitude?: number;
    longitude?: number;
  }) {
    const res = await apiClient.post<AIAnalysisResult>('/incidents/analyze', payload);
    return res.data;
  },

  async create(payload: any) {
    const res = await apiClient.post<{ incident: EmergencyIncident; statusHistory: StatusHistoryItem[] }>(
      '/incidents',
      payload
    );
    audioAlerts.playEmergencySiren();
    return res.data;
  },

  async list(params?: {
    status?: string;
    priority?: string;
    category?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    const res = await apiClient.get<{ total: number; incidents: EmergencyIncident[] }>('/incidents', { params });
    return res.data;
  },

  async getById(id: string) {
    const res = await apiClient.get<{ incident: EmergencyIncident & { history?: StatusHistoryItem[] } }>(
      `/incidents/${id}`
    );
    return res.data;
  },

  async updateStatus(
    id: string,
    data: {
      status: IncidentStatus;
      notes?: string;
      assignedResponderId?: string;
    }
  ) {
    const res = await apiClient.patch<{
      incident: EmergencyIncident;
      statusHistory: StatusHistoryItem;
      message: string;
    }>(`/incidents/${id}/status`, data);
    audioAlerts.playSuccessChime();
    return res.data;
  },

  async triggerMockDisaster() {
    const res = await apiClient.post<{ incident: EmergencyIncident; message: string }>('/incidents/mock-disaster');
    audioAlerts.playEmergencySiren();
    return res.data;
  },

  async getNotifications() {
    const res = await apiClient.get<{ notifications: NotificationItem[] }>('/incidents/notifications/list');
    return res.data;
  },

  async markNotificationRead(id: string) {
    const res = await apiClient.patch<{ success: boolean }>(`/incidents/notifications/${id}/read`);
    return res.data;
  },
};

export const analyticsApi = {
  async getOverview() {
    const res = await apiClient.get<
      AnalyticsOverview & {
        departmentStats: any[];
        auditLogsCount: number;
        totalResponders: number;
        availableResponders: number;
      }
    >('/analytics/overview');
    return res.data;
  },
};
