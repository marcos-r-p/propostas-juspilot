'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import type { Proposta } from '@/types';

interface PropostaActionsProps {
  proposta: Proposta;
}

export function PropostaActions({ proposta }: PropostaActionsProps) {
  const router = useRouter();
  const [showDelete, setShowDelete] = useState(false);
  const [loading, setLoading] = useState(false);

  const publicUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/p/${proposta.slug}`;
  const isPublished = proposta.status !== 'rascunho';

  async function handlePublish() {
    setLoading(true);
    const res = await fetch(`/api/propostas/${proposta.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'publicada' }),
    });
    setLoading(false);

    if (res.ok) {
      toast({ title: 'Proposta publicada!' });
      router.refresh();
    } else {
      toast({ title: 'Erro ao publicar', variant: 'destructive' });
    }
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(publicUrl);
    toast({ title: 'Link copiado!' });
  }

  async function handleDelete() {
    setLoading(true);
    const res = await fetch(`/api/propostas/${proposta.id}`, { method: 'DELETE' });
    setLoading(false);

    if (res.ok) {
      toast({ title: 'Proposta excluída' });
      router.push('/dashboard');
    } else {
      toast({ title: 'Erro ao excluir', variant: 'destructive' });
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {!isPublished && (
          <Button onClick={handlePublish} loading={loading}>
            Publicar
          </Button>
        )}
        {isPublished && (
          <>
            <Button variant="secondary" onClick={handleCopyLink}>
              Copiar Link
            </Button>
            <a href={publicUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="secondary">Ver Pública</Button>
            </a>
          </>
        )}
        <Button variant="destructive" size="sm" onClick={() => setShowDelete(true)}>
          Excluir
        </Button>
      </div>

      <Dialog
        open={showDelete}
        onClose={() => setShowDelete(false)}
        title="Excluir proposta?"
        description="Essa ação não pode ser desfeita."
      >
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setShowDelete(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete} loading={loading}>
            Excluir
          </Button>
        </div>
      </Dialog>
    </>
  );
}
