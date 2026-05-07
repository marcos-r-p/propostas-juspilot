'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const { loading, resetPassword } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const success = await resetPassword(email);
    if (success) setSent(true);
  }

  if (sent) {
    return (
      <div className="rounded-xl border border-[#E3E0DD] bg-white p-8 text-center">
        <h2 className="text-lg font-semibold text-[#101010]">Email enviado</h2>
        <p className="mt-2 text-sm text-[#7A7370]">Verifique sua caixa de entrada para redefinir a senha.</p>
        <Link href="/login"><Button variant="secondary" className="mt-6">Voltar para login</Button></Link>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#E3E0DD] bg-white p-8">
      <h2 className="text-center text-lg font-semibold text-[#101010]">Recuperar senha</h2>
      <p className="mt-1 text-center text-sm text-[#7A7370]">Enviaremos um link de recuperação para seu email.</p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Input id="email" label="Email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Button type="submit" className="w-full" loading={loading}>Enviar link de recuperação</Button>
      </form>
      <div className="mt-4 text-center">
        <Link href="/login" className="text-xs text-[#7A7370] underline underline-offset-2 hover:text-[#101010]">Voltar para login</Link>
      </div>
    </div>
  );
}
