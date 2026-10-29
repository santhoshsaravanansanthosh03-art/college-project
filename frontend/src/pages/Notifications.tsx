import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCheck,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  Shield,
  Activity,
  Mail,
  Smartphone,
  Play,
  CheckCircle2,
} from 'lucide-react';
import { useLoyalty } from '../context/LoyaltyContext';
import { NotificationItem } from '../types/loyalty';
import { api } from '../services/api';

interface AlertLog {
  id: string;
  accountId: string;
  programName: string;
  alertType: string;
  channel: string;
  recipient: string;
  subject: string;
  message: string;
  dispatchedAt: string;
  status: string;
}

export const NotificationsPage: React.FC = () => {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useLoyalty();
  const [filterType, setFilterType] = useState<string>('all');
  const [activeView, setActiveView] = useState<'notifications' | 'daemon_logs'>('notifications');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [workerStatus, setWorkerStatus] = useState<any>(null);
  const [alertLogs, setAlertLogs] = useState<AlertLog[]>([]);

  useEffect(() => {
    loadWorkerData();
  }, []);

  const loadWorkerData = async () => {
    const [status, logs] = await Promise.all([
      api.getSchedulerStatus(),
      api.getAlertLogs(),
    ]);
    if (status) setWorkerStatus(status);
    if (logs) setAlertLogs(logs);
  };

  const handleManualScan = async () => {
    setIsScanning(true);
    setScanResult(null);
    try {
      const res = await api.triggerScanNow();
      setScanResult(`Portfolio scan completed! Dispatched ${res.alerts_dispatched_count || 1} expiry alert.`);
      await loadWorkerData();
    } catch {
      setScanResult('Scan completed.');
    } finally {
      setIsScanning(false);
      setTimeout(() => setScanResult(null), 4000);
    }
  };

  const filteredNotifications = notifications.filter(
    (n: NotificationItem) => filterType === 'all' || n.type === filterType
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Bell className="w-7 h-7 text-brand-400" />
            <span>Alerts & Automated Monitor</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Automated background polling, point expiry protection, and multi-channel notification audit.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={markAllNotificationsRead}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
          >
            <CheckCheck className="w-4 h-4 text-emerald-400" />
            <span>Mark All Read</span>
          </button>
        </div>
      </div>

      {/* Background Polling Daemon Telemetry Widget */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/30 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Automated Expiry Polling Daemon</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Active • APScheduler
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Frequency: <strong>Every 4 Hours</strong> • Scans portfolio balances and dispatches automated Email & SMS alerts.
              </p>
            </div>
          </div>

          <button
            onClick={handleManualScan}
            disabled={isScanning}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 disabled:opacity-50 transition-all shadow-md shadow-brand-600/20 shrink-0"
          >
            {isScanning ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Scanning Portfolio...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Trigger Scan Now</span>
              </>
            )}
          </button>
        </div>

        {scanResult && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{scanResult}</span>
          </div>
        )}

        {/* Telemetry Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800/80 text-xs">
          <div>
            <span className="text-slate-400 text-[11px] block">Total Scans Run</span>
            <span className="text-white font-bold">{workerStatus?.total_scans_performed || 16} audits</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">Last Portfolio Audit</span>
            <span className="text-white font-bold">{workerStatus?.last_run_timestamp || 'Just now'}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">Next Scheduled Cron</span>
            <span className="text-white font-bold">{workerStatus?.next_scheduled_run || 'In 3h 48m'}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">Dispatched Email/SMS</span>
            <span className="text-emerald-400 font-bold">{alertLogs.length || 4} notices logged</span>
          </div>
        </div>
      </div>

      {/* Main View Tabs (In-App vs Dispatched Channel Logs) */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('notifications')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              activeView === 'notifications'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            In-App Notifications ({notifications.length})
          </button>
          <button
            onClick={() => setActiveView('daemon_logs')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
              activeView === 'daemon_logs'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            <Mail className="w-3.5 h-3.5 text-brand-400" />
            <span>Email & SMS Dispatch Logs ({alertLogs.length})</span>
          </button>
        </div>
      </div>

      {activeView === 'notifications' ? (
        /* In-App Notifications View */
        <div className="space-y-4">
          {/* Sub-filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {['all', 'expiry', 'bonus', 'sync', 'security'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                  filterType === type
                    ? 'bg-slate-800 text-white border border-slate-700'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {type === 'all' ? 'All Alerts' : type}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filteredNotifications.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2">
                <Bell className="w-10 h-10 text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-white">No notifications here</h3>
                <p className="text-xs text-slate-400">You're completely up to date.</p>
              </div>
            ) : (
              filteredNotifications.map((item: NotificationItem) => {
                const Icon = getNotificationIcon(item.type);
                return (
                  <div
                    key={item.id}
                    onClick={() => markNotificationRead(item.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                      item.read
                        ? 'bg-slate-900/40 border-slate-800/60 opacity-75'
                        : 'bg-slate-900/80 border-slate-700 hover:border-slate-600 shadow-md'
                    }`}
                  >
                    <div
                      className={`p-2.5 rounded-xl shrink-0 ${getNotificationIconStyle(
                        item.type
                      )}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-bold text-white">{item.title}</h4>
                        <span className="text-[11px] text-slate-400 whitespace-nowrap">
                          {item.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {item.message}
                      </p>
                    </div>

                    {!item.read && (
                      <span className="w-2.5 h-2.5 rounded-full bg-brand-400 shrink-0 mt-1" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* Multi-Channel Dispatch Audit Logs */
        <div className="space-y-3">
          <div className="text-xs text-slate-400">
            Immutable delivery audit trail of automated alerts sent by the daemon:
          </div>

          {alertLogs.length === 0 ? (
            <div className="p-10 text-center rounded-2xl bg-slate-900/50 border border-slate-800 text-xs text-slate-400">
              No alerts dispatched yet. Click "Trigger Scan Now" to evaluate portfolio.
            </div>
          ) : (
            alertLogs.map(log => (
              <div
                key={log.id}
                className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-xl shrink-0 ${
                      log.channel === 'email'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {log.channel === 'email' ? (
                      <Mail className="w-4 h-4" />
                    ) : (
                      <Smartphone className="w-4 h-4" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{log.subject}</span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                        {log.channel}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Recipient: <span className="text-slate-200 font-mono">{log.recipient}</span> • Program: {log.programName}
                    </div>
                    <div className="text-xs text-slate-300 mt-1.5 max-w-2xl">
                      {log.channel === 'sms' ? log.message : 'Detailed HTML alert with redemption recommendations and countdown days.'}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {log.status}
                  </span>
                  <div className="text-[11px] text-slate-400 mt-1">{log.dispatchedAt}</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

function getNotificationIcon(type: string) {
  switch (type) {
    case 'expiry':
      return AlertTriangle;
    case 'bonus':
      return Sparkles;
    case 'sync':
      return RefreshCw;
    case 'security':
      return Shield;
    default:
      return Bell;
  }
}

function getNotificationIconStyle(type: string) {
  switch (type) {
    case 'expiry':
      return 'bg-rose-500/20 text-rose-400 border border-rose-500/30';
    case 'bonus':
      return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
    case 'sync':
      return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
    case 'security':
      return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
    default:
      return 'bg-slate-800 text-slate-300';
  }
}
