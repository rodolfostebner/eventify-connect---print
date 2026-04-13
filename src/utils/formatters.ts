export const formatInstagram = (handleOrUrl?: string) => {
  if (!handleOrUrl) return '';
  if (handleOrUrl.startsWith('http')) return handleOrUrl;
  return `https://instagram.com/${handleOrUrl.replace('@', '')}`;
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
