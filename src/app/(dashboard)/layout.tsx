import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/layout/sidebar';
import type { Profile } from '@/types';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="flex h-screen">
      <Sidebar profile={profile as Profile | null} />
      <main className="flex-1 overflow-auto px-8 py-6">
        {children}
      </main>
    </div>
  );
}
