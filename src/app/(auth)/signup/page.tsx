'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function SignUpPage() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { loading, signUp } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await signUp(email, password, nome);
  }

  return (
    <div className="rounded-xl border border-[#e4e4e7] bg-white p-8">
      <h2 className="text-center text-lg font-semibold text-[#09090b]">Criar sua conta</h2>
      <p className="mt-1 text-center text-sm text-[#a1a1aa]">Preencha os dados abaixo</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Input id="nome" label="Nome" type="text" placeholder="Seu nome completo" value={nome} onChange={(e) => setNome(e.target.value)} required />
        <Input id="email" label="Email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input id="password" label="Senha" type="password" placeholder="Mínimo 6 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
        <Button type="submit" className="w-full" loading={loading}>Criar conta</Button>
      </form>

      <p className="mt-6 text-center text-sm text-[#71717a]">
        Já tem uma conta?{' '}
        <Link href="/login" className="text-[#09090b] underline underline-offset-2 hover:text-[#3b82f6]">Entrar</Link>
      </p>
    </div>
  );
}
