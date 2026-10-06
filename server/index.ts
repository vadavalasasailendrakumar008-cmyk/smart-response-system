import './config/loadEnv.js';
import express, { Request, Response } from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import incidentRoutes from './routes/incidentRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import { authMiddleware } from './middleware/authMiddleware.js';
import { realtimeEmitter, isSupabaseConfigured } from './config/supabase.js';
import { hasGeminiApiKey } from './services/gemini.js';

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow localhost or same-origin or any dev origin
      callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Global Auth Header Parser
app.use('/api', authMiddleware);

// Health check
app.get('/api/v1/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ONLINE',
    system: 'RescuOS Emergency Platform',
    timestamp: new Date().toISOString(),
    services: {
      supabase: isSupabaseConfigured ? 'CONNECTED' : 'LOCAL_MOCK_ENGINE',
      gemini: hasGeminiApiKey ? 'CONNECTED_GEMINI_2.5_FLASH' : 'EXPERT_FALLBACK_ACTIVE',
      realtime: 'ACTIVE',
    },
  });
});

// Realtime SSE endpoint for instant live streaming
app.get('/api/v1/realtime/stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Send initial connected ping
  res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`);

  const onIncidentCreated = (data: any) => {
    res.write(`data: ${JSON.stringify({ type: 'incident:created', payload: data })}\n\n`);
  };

  const onIncidentUpdated = (data: any) => {
    res.write(`data: ${JSON.stringify({ type: 'incident:updated', payload: data })}\n\n`);
  };

  const onStatusChanged = (data: any) => {
    res.write(`data: ${JSON.stringify({ type: 'status:changed', payload: data })}\n\n`);
  };

  realtimeEmitter.on('incident:created', onIncidentCreated);
  realtimeEmitter.on('incident:updated', onIncidentUpdated);
  realtimeEmitter.on('status:changed', onStatusChanged);

  // Keep-alive heartbeat every 20 seconds
  const heartbeat = setInterval(() => {
    res.write(`data: ${JSON.stringify({ type: 'heartbeat' })}\n\n`);
  }, 20000);

  req.on('close', () => {
    clearInterval(heartbeat);
    realtimeEmitter.off('incident:created', onIncidentCreated);
    realtimeEmitter.off('incident:updated', onIncidentUpdated);
    realtimeEmitter.off('status:changed', onStatusChanged);
  });
});

// Mount Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/incidents', incidentRoutes);
app.use('/api/v1/analytics', analyticsRoutes);

// Error Handler
app.use((err: any, _req: Request, res: Response, _next: any) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err?.message || 'An unexpected error occurred.',
  });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚨 RescuOS Emergency Response Backend Running on :${PORT}`);
  console.log(`📡 Ready for Real-Time Dispatch and AI Priority Triage`);
  console.log(`=======================================================`);
});
