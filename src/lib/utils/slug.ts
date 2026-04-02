export function generateSlug(baseName: string): string {
  const base = baseName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 30);

  const random = Math.random().toString(36).substring(2, 8);

  return `${base}-${random}`;
}
