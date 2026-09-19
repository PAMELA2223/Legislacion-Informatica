import { describe, it, expect } from "vitest";
import { getYoutubeEmbedUrl } from "./youtube";

describe("getYoutubeEmbedUrl", () => {
  it("convierte una URL youtube.com/watch?v=", () => {
    expect(getYoutubeEmbedUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(
      "https://www.youtube.com/embed/dQw4w9WgXcQ"
    );
  });

  it("convierte una URL acortada youtu.be/", () => {
    expect(getYoutubeEmbedUrl("https://youtu.be/dQw4w9WgXcQ")).toBe(
      "https://www.youtube.com/embed/dQw4w9WgXcQ"
    );
  });

  it("acepta una URL ya en formato embed", () => {
    expect(getYoutubeEmbedUrl("https://www.youtube.com/embed/dQw4w9WgXcQ")).toBe(
      "https://www.youtube.com/embed/dQw4w9WgXcQ"
    );
  });

  it("ignora parámetros extra (?t=, &list=)", () => {
    expect(
      getYoutubeEmbedUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30s&list=PL123")
    ).toBe("https://www.youtube.com/embed/dQw4w9WgXcQ");
  });

  it("devuelve null para una URL que no es de YouTube", () => {
    expect(getYoutubeEmbedUrl("https://ejemplo.com/video.mp4")).toBeNull();
  });
});
