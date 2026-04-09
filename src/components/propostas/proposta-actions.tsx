'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { deleteProposta } from '@/lib/actions/propostas';

interface PropostaActionsProps {
  id: string;
  slug: string;
}

export function PropostaActions({ id, slug }: PropostaActionsProps) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleCopyLink() {
    const url = `${window.location.origin}/p/${slug}`;
    await navigator.clipboard.writeText(url);
    toast({ title: 'Link copiado', description: url });
  }

  function handlePlaceholder(label: string) {
    toast({ title: `${label}`, description: 'Funcionalidade em breve.' });
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteProposta(id);
      setDeleteOpen(false);
      toast({ title: 'Proposta excluida' });
    } catch {
      toast({ title: 'Erro ao excluir', variant: 'destructive' });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="flex gap-1">
        {/* Visualizar */}
        <button
          onClick={() => router.push(`/proposta/${id}/preview`)}
          className="flex h-[30px] w-[30px] items-center justify-center text-whisper transition-colors hover:bg-rule-soft hover:text-ink"
          title="Visualizar"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>

        {/* Editar */}
        <button
          onClick={() => router.push(`/proposta/${id}`)}
          className="flex h-[30px] w-[30px] items-center justify-center text-whisper transition-colors hover:bg-rule-soft hover:text-ink"
          title="Editar"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>

        {/* Copiar link */}
        <button
          onClick={handleCopyLink}
          className="flex h-[30px] w-[30px] items-center justify-center text-whisper transition-colors hover:bg-rule-soft hover:text-ink"
          title="Copiar link"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
          </svg>
        </button>

        {/* Download PDF */}
        <button
          onClick={() => handlePlaceholder('Download PDF')}
          className="flex h-[30px] w-[30px] items-center justify-center text-whisper transition-colors hover:bg-rule-soft hover:text-ink"
          title="Download PDF"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="7,10 12,15 17,10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </button>

        {/* Duplicar */}
        <button
          onClick={() => handlePlaceholder('Duplicar')}
          className="flex h-[30px] w-[30px] items-center justify-center text-whisper transition-colors hover:bg-rule-soft hover:text-ink"
          title="Duplicar"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="0" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
        </button>

        {/* Enviar */}
        <button
          onClick={() => handlePlaceholder('Enviar')}
          className="flex h-[30px] w-[30px] items-center justify-center text-whisper transition-colors hover:bg-rule-soft hover:text-ink"
          title="Enviar"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22,2 15,22 11,13 2,9" />
          </svg>
        </button>

        {/* Deletar */}
        <button
          onClick={() => setDeleteOpen(true)}
          className="flex h-[30px] w-[30px] items-center justify-center text-whisper transition-colors hover:bg-red-50 hover:text-danger"
          title="Deletar"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3,6 5,6 21,6" />
            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
          </svg>
        </button>
      </div>

      <Dialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Excluir proposta"
        description="Tem certeza? Esta acao nao pode ser desfeita."
      >
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Excluindo...' : 'Excluir'}
          </Button>
        </div>
      </Dialog>
    </>
  );
}
