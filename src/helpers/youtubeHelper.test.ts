import { describe, it, expect } from "vitest";
import { getYoutubeEmbedUrl } from "./youtubeHelper";

const embed = (id: string) => `https://www.youtube.com/embed/${id}`;

describe("getYoutubeEmbedUrl", () => {
  it("mengubah tautan watch", () => {
    expect(getYoutubeEmbedUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(embed("dQw4w9WgXcQ"));
  });

  it("mendukung youtu.be, subdomain m., dan spasi di sekitar tautan", () => {
    expect(getYoutubeEmbedUrl("https://youtu.be/dQw4w9WgXcQ")).toBe(embed("dQw4w9WgXcQ"));
    expect(getYoutubeEmbedUrl("https://m.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(embed("dQw4w9WgXcQ"));
    expect(getYoutubeEmbedUrl("  https://youtube.com/watch?v=dQw4w9WgXcQ  ")).toBe(embed("dQw4w9WgXcQ"));
  });

  it("mendukung bentuk embed, shorts, dan live", () => {
    expect(getYoutubeEmbedUrl("https://www.youtube.com/embed/dQw4w9WgXcQ")).toBe(embed("dQw4w9WgXcQ"));
    expect(getYoutubeEmbedUrl("https://www.youtube.com/shorts/dQw4w9WgXcQ")).toBe(embed("dQw4w9WgXcQ"));
    expect(getYoutubeEmbedUrl("https://www.youtube.com/live/dQw4w9WgXcQ?feature=share")).toBe(embed("dQw4w9WgXcQ"));
  });

  it("mengembalikan null untuk tautan yang tidak valid", () => {
    expect(getYoutubeEmbedUrl("bukan url")).toBeNull();
    expect(getYoutubeEmbedUrl("https://example.com/watch?v=dQw4w9WgXcQ")).toBeNull();
    expect(getYoutubeEmbedUrl("https://www.youtube.com/channel/abc")).toBeNull();
    expect(getYoutubeEmbedUrl("https://www.youtube.com/watch")).toBeNull();
    expect(getYoutubeEmbedUrl("https://youtu.be/")).toBeNull();
    expect(getYoutubeEmbedUrl("https://youtu.be/abc")).toBeNull();
  });
});
