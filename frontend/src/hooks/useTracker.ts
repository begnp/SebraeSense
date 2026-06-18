import { useEffect, useRef, useCallback } from 'react';

interface TrackerOptions {
  pageName: string;
}

const sendTelemetryToServer = async (eventType: string, payload: any) => {
  try {
    await fetch(import.meta.env.VITE_API_URL + '/api/telemetry/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customer_id: 1, // Default to João Santos (ID 1)
        event_type: eventType,
        metadata_payload: payload
      })
    });
  } catch (err) {
    console.error('Erro ao enviar telemetria para o servidor:', err);
  }
};

const dispatchVisualLog = (message: string, type: 'info' | 'warn' | 'error') => {
  // Mantém o console.log original
  if (type === 'warn') console.warn(message);
  else if (type === 'error') console.error(message);
  else console.log(message);

  // Dispara evento para o TrackerViewer
  window.dispatchEvent(new CustomEvent('tracker-event', {
    detail: { message, type }
  }));
};

export function useTracker({ pageName }: TrackerOptions) {
  const startTime = useRef<number>(Date.now());
  const clickData = useRef<{ count: number; lastClickTime: number }>({ count: 0, lastClickTime: 0 });
  const isTaskCompleted = useRef<boolean>(false);

  // Time to Value (TTV)
  const completeTask = useCallback(() => {
    if (isTaskCompleted.current) return;
    const timeSpent = (Date.now() - startTime.current) / 1000;
    dispatchVisualLog(`[TTV] Tarefa concluída na página "${pageName}". Tempo total: ${timeSpent.toFixed(2)}s`, 'info');
    sendTelemetryToServer('task_completed', { page: pageName, timeSpent });
    isTaskCompleted.current = true;
  }, [pageName]);

  // Errors and Interruptions
  const logError = useCallback((errorDetails: string) => {
    dispatchVisualLog(`[ERRO/INTERRUPÇÃO] Ocorreu um erro na página "${pageName}": ${errorDetails}`, 'error');
    sendTelemetryToServer('error', { page: pageName, details: errorDetails });
  }, [pageName]);

  useEffect(() => {
    // Rage Clicks (Fricção)
    const handleGlobalClick = (_e: MouseEvent) => {
      const now = Date.now();
      
      if (now - clickData.current.lastClickTime > 2000) {
        // Reset if more than 2 seconds have passed since the last click
        clickData.current.count = 1;
      } else {
        clickData.current.count += 1;
      }
      
      clickData.current.lastClickTime = now;

      if (clickData.current.count >= 5) {
        dispatchVisualLog(`🚨 [RAGE CLICK DETECTED] na página "${pageName}". Fricção detectada: múltiplos cliques seguidos!`, 'warn');
        sendTelemetryToServer('rage_click', { page: pageName });
        // Reset to avoid spamming the console
        clickData.current.count = 0;
      }
    };

    // Abandonment (Abandono)
    const handleMouseLeave = (e: MouseEvent) => {
      // e.clientY <= 0 generally means the user moved the mouse towards the browser tabs/address bar
      if (e.clientY <= 0 && !isTaskCompleted.current) {
        dispatchVisualLog(`⚠️ [ABANDONO DETECTADO] Usuário moveu o mouse para fora da janela antes de concluir a tarefa.`, 'warn');
        sendTelemetryToServer('abandonment', { page: pageName });
      }
    };

    document.addEventListener('click', handleGlobalClick);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('click', handleGlobalClick);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [pageName]);

  return { completeTask, logError };
}
