'use client';

import { useEffect } from 'react';

export function TrackView({ propostaId }: { propostaId: string }) {
  useEffect(() => {
    fetch('/api/track-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proposta_id: propostaId }),
    }).catch(() => {});
  }, [propostaId]);

  return null;
}
