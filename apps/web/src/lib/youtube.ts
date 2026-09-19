/**
 * Detecta si una URL es de YouTube (en cualquiera de sus formatos comunes:
 * youtube.com/watch?v=, youtu.be/, o ya en formato embed) y devuelve la
 * URL lista para usar en un <iframe>. Si no es de YouTube, devuelve null
 * (el llamador debe entonces tratarla como un archivo de video directo).
 */
export function getYoutubeEmbedUrl(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}
