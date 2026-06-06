export const formatInstagram = (handleOrUrl?: string) => {
  if (!handleOrUrl) return '';
  let value = handleOrUrl.trim();
  if (!value) return '';
  // Ja e URL completa (http/https) — usa como veio
  if (/^https?:\/\//i.test(value)) return value;
  // Remove o dominio caso o usuario tenha colado "instagram.com/usuario" sem protocolo
  value = value.replace(/^(www\.)?instagram\.com\//i, '');
  // Remove @, barras e espacos restantes, sobrando so o handle
  value = value.replace(/^@/, '').replace(/^\/+/, '').trim();
  if (!value) return '';
  return `https://instagram.com/${value}`;
};

export const formatTiktok = (handleOrUrl?: string) => {
  if (!handleOrUrl) return '';
  let value = handleOrUrl.trim();
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  value = value.replace(/^(www\.)?tiktok\.com\//i, '');
  value = value.replace(/^@/, '').replace(/^\/+/, '').trim();
  if (!value) return '';
  return `https://tiktok.com/@${value}`;
};

export const formatYoutube = (handleOrUrl?: string) => {
  if (!handleOrUrl) return '';
  let value = handleOrUrl.trim();
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  value = value.replace(/^(www\.)?youtube\.com\//i, '').replace(/^\/+/, '').trim();
  if (!value) return '';
  // Canal por handle (@nome). Se ja vier com @, preserva.
  return `https://youtube.com/${value.startsWith('@') ? value : '@' + value}`;
};

export const formatEmail = (email?: string) => {
  if (!email) return '';
  const value = email.trim();
  if (!value) return '';
  return value.startsWith('mailto:') ? value : `mailto:${value}`;
};

export const formatPhone = (phone?: string) => {
  if (!phone) return '';
  const value = phone.trim();
  if (!value) return '';
  if (value.startsWith('tel:')) return value;
  // Mantem o + inicial (DDI) e remove o resto dos nao-digitos
  const cleaned = value.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '');
  return cleaned ? `tel:${cleaned}` : '';
};

export const formatWhatsApp = (numberOrUrl?: string) => {
  if (!numberOrUrl) return '';
  if (numberOrUrl.startsWith('http')) return numberOrUrl;
  return `https://wa.me/${numberOrUrl.replace(/\D/g, '')}`;
};

export const formatWebsite = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `https://${url}`;
};
