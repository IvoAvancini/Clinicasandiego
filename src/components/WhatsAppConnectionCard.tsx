import React, { useState, useEffect, useCallback, useRef } from 'react';
import { QrCode, RefreshCw, Wifi, WifiOff, CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

export type WhatsAppConnStatus = 'connected' | 'connecting' | 'disconnected' | 'error' | 'loading';

const API_BASE = import.meta.env.VITE_EVOLUTION_API_URL || import.meta.env.VITE_API_URL || 'http://localhost:8001';
const EVOLUTION_URL = import.meta.env.VITE_EVOLUTION_API_URL || 'https://evolution-api-production-22b7.up.railway.app';
const EVOLUTION_KEY = import.meta.env.VITE_EVOLUTION_API_KEY || '6944500e32d8c3a0b3fc5e9ef8ed7057648e00f30c05a8c4dc065c7a3387b271';
const INSTANCE_NAME = 'Clinica Sandiego';

let cachedConnStatus: WhatsAppConnStatus = 'loading';

export function WhatsAppConnectionCard() {
  const [status, setStatusState] = useState<WhatsAppConnStatus>(cachedConnStatus);

  const setStatus = useCallback((s: WhatsAppConnStatus) => {
    cachedConnStatus = s;
    setStatusState(s);
  }, []);
  const [connectedNumber, setConnectedNumber] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [loadingConnect, setLoadingConnect] = useState<boolean>(false);
  const [loadingQr, setLoadingQr] = useState<boolean>(false);
  const [disconnecting, setDisconnecting] = useState<boolean>(false);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/whatsapp/status`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const data = await res.json();
        setStatus(data.status);
        if (data.connected_number) setConnectedNumber(data.connected_number);
        return data.status as WhatsAppConnStatus;
      }
    } catch { /* Fallback to direct Evolution API */ }

    try {
      const res = await fetch(`${EVOLUTION_URL}/instance/connectionState/${encodeURIComponent(INSTANCE_NAME)}`, {
        headers: { apikey: EVOLUTION_KEY },
      });
      if (res.ok) {
        const data = await res.json();
        const state = data.instance?.state || data.state;
        const mappedStatus: WhatsAppConnStatus = (state === 'open' || state === 'connected') ? 'connected' : state === 'connecting' ? 'connecting' : 'disconnected';
        setStatus(mappedStatus);
        if (mappedStatus === 'connected') localStorage.setItem('sandiego_wa_connected', 'true');
        return mappedStatus;
      }
    } catch { /* Network error */ }

    const isLocallyConnected = localStorage.getItem('sandiego_wa_connected') === 'true';
    const fallbackStatus = isLocallyConnected ? 'connected' : 'disconnected';
    setStatus(fallbackStatus);
    return fallbackStatus as WhatsAppConnStatus;
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    if (!showModal) {
      stopPolling();
      return;
    }

    pollIntervalRef.current = setInterval(async () => {
      const currentStatus = await fetchStatus();
      if (currentStatus === 'connected') {
        stopPolling();
        setShowModal(false);
        setQrCode(null);
        toast.success('WhatsApp conectado com sucesso!');
      }
    }, 3000);

    return () => stopPolling();
  }, [showModal, fetchStatus, stopPolling]);

  const handleConnect = async () => {
    setLoadingConnect(true);
    try {
      // 1. Try proxy
      try {
        const res = await fetch(`${API_BASE}/api/whatsapp/connect`, { method: 'POST', signal: AbortSignal.timeout(3000) });
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'connected') {
            setStatus('connected');
            if (data.number) setConnectedNumber(data.number);
            toast.success('WhatsApp já está conectado!');
            return;
          } else {
            setStatus('connecting');
            setQrCode(data.qrCode || null);
            setShowModal(true);
            return;
          }
        }
      } catch { /* Fallback to direct Evolution API */ }

      // 2. Direct Evolution API Connect / QR Code
      const res = await fetch(`${EVOLUTION_URL}/instance/connect/${encodeURIComponent(INSTANCE_NAME)}`, {
        headers: { apikey: EVOLUTION_KEY },
      });

      if (!res.ok) throw new Error('Connect failed');
      const data = await res.json();

      if (data.instance?.state === 'open' || data.state === 'open') {
        setStatus('connected');
        toast.success('WhatsApp já está conectado!');
      } else {
        const base64 = data.base64 || data.qrcode?.base64 || data.code;
        if (base64) {
          const formattedQr = base64.startsWith('data:') ? base64 : `data:image/png;base64,${base64}`;
          setQrCode(formattedQr);
          setStatus('connecting');
          setShowModal(true);
        } else {
          toast.error('Não foi possível obter o QR Code da Evolution API');
          setStatus('error');
        }
      }
    } catch (err: any) {
      toast.error('Não foi possível comunicar com a Evolution API');
      setStatus('error');
    } finally {
      setLoadingConnect(false);
    }
  };

  const handleRefreshQr = async () => {
    setLoadingQr(true);
    try {
      const res = await fetch(`${EVOLUTION_URL}/instance/connect/${encodeURIComponent(INSTANCE_NAME)}`, {
        headers: { apikey: EVOLUTION_KEY },
      });
      const data = await res.json();
      const base64 = data.base64 || data.qrcode?.base64 || data.code;
      if (base64) {
        const formattedQr = base64.startsWith('data:') ? base64 : `data:image/png;base64,${base64}`;
        setQrCode(formattedQr);
        toast.info('Novo QR Code gerado.');
      } else {
        toast.error('Erro ao gerar novo QR Code.');
      }
    } catch {
      toast.error('Erro ao gerar novo QR Code.');
    } finally {
      setLoadingQr(false);
    }
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      await fetch(`${EVOLUTION_URL}/instance/logout/${encodeURIComponent(INSTANCE_NAME)}`, {
        method: 'DELETE',
        headers: { apikey: EVOLUTION_KEY },
      });
      setStatus('disconnected');
      setConnectedNumber(null);
      setQrCode(null);
      toast.success('WhatsApp desconectado.');
    } catch {
      toast.error('Erro ao desconectar WhatsApp.');
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-end w-full">
        <button
          onClick={status === 'connected' ? handleDisconnect : handleConnect}
          disabled={loadingConnect || disconnecting}
          className={`px-3 py-1 rounded-full text-[11px] font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs text-white ${
            status === 'connected'
              ? 'bg-emerald-600 hover:bg-emerald-700'
              : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          {loadingConnect || disconnecting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <>
              <Wifi className="h-3.5 w-3.5" />
              {status === 'connected' ? 'WhatsApp Conectado' : 'Conectar WhatsApp'}
            </>
          )}
        </button>
      </div>

      {/* Modal QR Code */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5">
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-slate-900 font-['Plus_Jakarta_Sans']">Conectar WhatsApp</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Abra o WhatsApp no celular &gt; <strong>Aparelhos conectados</strong> &gt; <strong>Conectar um aparelho</strong> e escaneie o QR Code.
              </p>
            </div>

            <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-4">
              {qrCode ? (
                <img
                  src={qrCode}
                  alt="QR Code WhatsApp"
                  className="h-56 w-56 rounded-lg bg-white p-2 shadow-inner border border-slate-200 object-contain"
                />
              ) : (
                <div className="flex h-56 w-56 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-white p-4 text-center">
                  <Loader2 className="h-7 w-7 animate-spin text-amber-500" />
                  <span className="text-xs text-slate-500 font-bold">Obtendo QR Code real da Evolution API...</span>
                </div>
              )}

              <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-amber-600">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Aguardando conexão...
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <button
                onClick={handleRefreshQr}
                disabled={loadingQr}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loadingQr ? 'animate-spin' : ''}`} />
                Gerar novo QR
              </button>

              <button
                onClick={() => setShowModal(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
