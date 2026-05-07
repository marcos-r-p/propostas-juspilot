'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const { loading, updatePassword } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('As senhas não coincidem.');
      return;
    }

    const success = await updatePassword(password);
    if (success) {
      router.push('/dashboard');
      router.refresh();
    }
  }

  return (
    <div className="rounded-xl border border-[#E3E0DD] bg-white p-8">
      <h2 className="text-center text-lg font-semibold text-[#101010]">Redefinir senha</h2>
      <p className="mt-1 text-center text-sm text-[#7A7370]">Digite sua nova senha abaixo.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Input id="password" label="Nova senha" type="password" placeholder="Mínimo 6 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
        <Input id="confirm" label="Confirmar senha" type="password" placeholder="Repita a senha" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={6} />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" className="w-full" loading={loading}>Salvar nova senha</Button>
      </form>
    </div>
  );
}
