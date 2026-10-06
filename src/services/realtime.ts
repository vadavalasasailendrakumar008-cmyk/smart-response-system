import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { EmergencyIncident, StatusHistoryItem } from '../shared/types';
import { audioAlerts } from './api';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const isCloudSupabase = Boolean(
  supabaseUrl &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('your-supabase-project-id') &&
  supabaseAnonKey &&
  supabaseAnonKey !== 'your_supabase_anon_public_key'
);

let supabaseClient: SupabaseClient | null = null;
if (isCloudSupabase) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  } catch (err) {
    console.warn('Realtime Supabase initialization error:', err);
  }
}

export type RealtimeCallbacks = {
  onIncidentCreated?: (incident: EmergencyIncident) => void;
  onIncidentUpdated?: (data: { incident: EmergencyIncident; statusLog?: StatusHistoryItem }) => void;
  onStatusChanged?: (statusLog: StatusHistoryItem) => void;
};

export function subscribeToEmergencyRealtime(callbacks: RealtimeCallbacks) {
  let eventSource: EventSource | null = null;
  let supabaseChannel: any = null;

  // 1. If Cloud Supabase is configured, subscribe to Supabase Realtime channels
  if (supabaseClient) {
    supabaseChannel = supabaseClient
      .channel('rescuos-emergency-feed')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'emergency_incidents' },
        (payload) => {
          console.log('⚡ Supabase Realtime Incident INSERT:', payload.new);
          audioAlerts.playEmergencySiren();
          callbacks.onIncidentCreated?.(payload.new as EmergencyIncident);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'emergency_incidents' },
        (payload) => {
          console.log('⚡ Supabase Realtime Incident UPDATE:', payload.new);
          audioAlerts.playSuccessChime();
          callbacks.onIncidentUpdated?.({ incident: payload.new as EmergencyIncident });
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'status_history' },
        (payload) => {
          console.log('⚡ Supabase Realtime Status History INSERT:', payload.new);
          callbacks.onStatusChanged?.(payload.new as StatusHistoryItem);
        }
      )
      .subscribe();
  }

  // 2. Also connect to Backend SSE Stream (ensures 100% reliable real-time updates across browsers!)
  try {
    const streamUrl = (import.meta.env.VITE_API_BASE_URL || '/api/v1') + '/realtime/stream';
    eventSource = new EventSource(streamUrl);

    eventSource.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'incident:created' && message.payload) {
          audioAlerts.playEmergencySiren();
          callbacks.onIncidentCreated?.(message.payload);
        } else if (message.type === 'incident:updated' && message.payload) {
          audioAlerts.playSuccessChime();
          callbacks.onIncidentUpdated?.(message.payload);
        } else if (message.type === 'status:changed' && message.payload) {
          callbacks.onStatusChanged?.(message.payload);
        }
      } catch (err) {
        // Ping or non-json keep-alive
      }
    };

    eventSource.onerror = () => {
      // Automatic browser SSE reconnection will handle transient drops
    };
  } catch (err) {
    console.warn('SSE stream error:', err);
  }

  // Cleanup function
  return () => {
    if (eventSource) {
      eventSource.close();
    }
    if (supabaseChannel && supabaseClient) {
      supabaseClient.removeChannel(supabaseChannel);
    }
  };
}
