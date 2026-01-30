import { useState, useEffect, useCallback } from 'react';
import './App.css';

interface HealthData {
  status: string;
  timestamp: string;
  uptime: number;
}

interface InfoData {
  name: string;
  version: string;
  environment: string;
  nodeVersion: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function App() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [info, setInfo] = useState<InfoData | null>(null);
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [healthRes, infoRes, messageRes] = await Promise.all([
        fetch(`${API_URL}/api/health`),
        fetch(`${API_URL}/api/info`),
        fetch(`${API_URL}/api`),
      ]);

      if (!healthRes.ok || !infoRes.ok || !messageRes.ok) {
        throw new Error('Failed to fetch data from backend');
      }

      const healthData = await healthRes.json();
      const infoData = await infoRes.json();
      const messageData = await messageRes.text();

      setHealth(healthData);
      setInfo(infoData);
      setMessage(messageData);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const formatUptime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const isConnected = health?.status === 'ok';

  return (
    <div id="root">
      <header className="app-header">
        <h1>🚀 K8s CI/CD Lab</h1>
        <p>React + NestJS Microservices Dashboard</p>
      </header>

      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      <div className="dashboard">
        {/* Health Card */}
        <div className="card">
          <div className="card-header">
            <div className="card-icon health">💚</div>
            <h2>Backend Status</h2>
          </div>

          {loading ? (
            <div className="empty-state">
              <div className="spinner"></div>
              <p style={{ marginTop: '1rem' }}>Checking connection...</p>
            </div>
          ) : (
            <div className="info-list">
              <div className="info-item">
                <span className="info-label">Status</span>
                <span className={`status-badge ${isConnected ? 'online' : 'offline'}`}>
                  <span className={`status-dot ${isConnected ? 'pulse' : ''}`}></span>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              {health && (
                <>
                  <div className="info-item">
                    <span className="info-label">Uptime</span>
                    <span className="info-value">{formatUptime(health.uptime)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Last Check</span>
                    <span className="info-value">
                      {new Date(health.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Info Card */}
        <div className="card">
          <div className="card-header">
            <div className="card-icon info">ℹ️</div>
            <h2>Service Info</h2>
          </div>

          {loading ? (
            <div className="empty-state">
              <div className="spinner"></div>
            </div>
          ) : info ? (
            <div className="info-list">
              <div className="info-item">
                <span className="info-label">Name</span>
                <span className="info-value">{info.name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Version</span>
                <span className="info-value">v{info.version}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Environment</span>
                <span className="info-value">{info.environment}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Node.js</span>
                <span className="info-value">{info.nodeVersion}</span>
              </div>
            </div>
          ) : (
            <div className="empty-state">No data available</div>
          )}
        </div>

        {/* Message Card */}
        <div className="card">
          <div className="card-header">
            <div className="card-icon message">💬</div>
            <h2>API Response</h2>
          </div>

          {loading ? (
            <div className="empty-state">
              <div className="spinner"></div>
            </div>
          ) : message ? (
            <div className="message-content">
              <p className="message-text">{message}</p>
              <p className="message-timestamp">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </p>
            </div>
          ) : (
            <div className="empty-state">No message received</div>
          )}
        </div>
      </div>

      <div className="actions">
        <button onClick={fetchData} disabled={loading}>
          {loading ? 'Refreshing...' : '🔄 Refresh Data'}
        </button>
        <button
          className="btn-secondary"
          onClick={() => window.open(`${API_URL}/api/health`, '_blank')}
        >
          📡 View Raw API
        </button>
      </div>

      <footer className="app-footer">
        <p>Built for Kubernetes CI/CD demonstration</p>
        <div className="tech-stack">
          <div className="tech-item">
            <span>⚛️</span>
            React + TypeScript
          </div>
          <div className="tech-item">
            <span>🐱</span>
            NestJS
          </div>
          <div className="tech-item">
            <span>☸️</span>
            Kubernetes
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
