// Mengubah tautan YouTube (watch, youtu.be, embed, shorts, live) menjadi URL embed.
// Mengembalikan null bila tautan bukan YouTube atau ID videonya tidak valid.
export function getYoutubeEmbedUrl(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url.trim());
  } catch {
    return null;
  }

  const host = parsed.hostname.replace(/^(www|m)\./, "");
  let id: string | null = null;

  if (host === "youtu.be") {
    id = parsed.pathname.slice(1);
  } else if (host === "youtube.com") {
    if (parsed.pathname === "/watch") {
      id = parsed.searchParams.get("v");
    } else {
      const match = parsed.pathname.match(/^\/(embed|shorts|live)\/([^/?]+)/);
      id = match ? match[2] : null;
    }
  }

  return id && /^[\w-]{6,}$/.test(id) ? `https://www.youtube.com/embed/${id}` : null;
}
