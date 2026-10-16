import { describe, it, expect, vi, beforeEach } from "vitest";
import ContentPage from "./ContentPage.svelte";
import { renderWithProviders } from "../../../test-utils";
import { coursesStore } from "../states/coursesStore";

const tick = () => new Promise((r) => setTimeout(r, 20));
const has = (w: any, id: string) => w.find(`[data-testid="${id}"]`).exists();
const click = (w: any, id: string) => (w.find(`[data-testid="${id}"]`).element as HTMLElement).click();

const content: any = { id: 11, course_id: 5, title: "Bab 1", youtube: "https://youtu.be/dQw4w9WgXcQ" };

function renderContent(c: any = content) {
  return renderWithProviders(ContentPage, {
    params: { courseId: "5", contentId: "11" },
    preloadedState: { content: c },
  });
}

describe("ContentPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(coursesStore, "asyncSetContent").mockImplementation(() => Promise.resolve());
  });

  it("memuat materi berdasarkan parameter rute dan tautan kembali ke kursus", async () => {
    const { wrapper } = renderContent();
    await tick();
    expect(coursesStore.asyncSetContent).toHaveBeenCalledWith("11");
    expect(wrapper.find('[data-testid="back-link"]').attributes("href")).toBe("/courses/5");
    expect(coursesStore.isContent).toBe(false);
  });

  it("menampilkan loading selama memuat", async () => {
    (coursesStore.asyncSetContent as any).mockImplementation(() => new Promise(() => {}));
    const { wrapper } = renderContent();
    await tick();
    expect(has(wrapper, "loading-content")).toBe(true);
  });

  it("menampilkan pesan bila materi tidak ditemukan", async () => {
    const { wrapper } = renderContent(null);
    await tick();
    expect(has(wrapper, "content-not-found")).toBe(true);
  });

  it("menampilkan pemutar YouTube dan status belum selesai", async () => {
    const { wrapper } = renderContent();
    await tick();
    expect(wrapper.find('[data-testid="content-title"]').text()).toBe("Bab 1");
    expect(wrapper.find('[data-testid="youtube-player"]').attributes("src")).toBe(
      "https://www.youtube.com/embed/dQw4w9WgXcQ"
    );
    expect(wrapper.find('[data-testid="status-text"]').text()).toContain("Belum selesai");
    expect(wrapper.find('[data-testid="toggle-status-button"]').text()).toBe("Tandai Selesai");
  });

  it("menampilkan status selesai bila materi sudah diselesaikan", async () => {
    const { wrapper } = renderContent({ ...content, my_status_finished: 1 });
    await tick();
    expect(wrapper.find('[data-testid="status-text"]').text()).toContain("selesai dipelajari");
    expect(wrapper.find('[data-testid="toggle-status-button"]').text()).toBe("Tandai Belum Selesai");
  });

  it("menampilkan peringatan dan tautan asli bila URL YouTube tidak valid", async () => {
    const { wrapper } = renderContent({ ...content, youtube: "https://example.com/video" });
    await tick();
    expect(has(wrapper, "youtube-player")).toBe(false);
    expect(wrapper.find('[data-testid="invalid-youtube"]').text()).toContain("tidak valid");
    expect(wrapper.find('[data-testid="invalid-youtube"] a').attributes("href")).toBe("https://example.com/video");
  });

  it("menandai selesai: sukses memuat ulang, gagal tidak", async () => {
    const change = vi.spyOn(coursesStore, "asyncSetIsContentStatusChange").mockImplementation(async () => {
      coursesStore.setIsContentStatusChanged(true);
      coursesStore.setIsContentStatusChange(true);
    });
    const { wrapper } = renderContent();
    await tick();
    click(wrapper, "toggle-status-button");
    await tick();
    expect(change).toHaveBeenCalledWith("11", 1);
    expect(coursesStore.asyncSetContent).toHaveBeenCalledTimes(2);

    change.mockImplementation(async () => {
      coursesStore.setIsContentStatusChanged(false);
      coursesStore.setIsContentStatusChange(true);
    });
    click(wrapper, "toggle-status-button");
    await tick();
    expect(coursesStore.asyncSetContent).toHaveBeenCalledTimes(2);
    expect((wrapper.find('[data-testid="toggle-status-button"]').element as HTMLButtonElement).disabled).toBe(false);
  });

  it("membatalkan status selesai mengirim nilai 0", async () => {
    const change = vi.spyOn(coursesStore, "asyncSetIsContentStatusChange").mockImplementation(() => new Promise(() => {}));
    const { wrapper } = renderContent({ ...content, my_status_finished: true });
    await tick();
    click(wrapper, "toggle-status-button");
    await tick();
    expect(change).toHaveBeenCalledWith("11", 0);
    expect((wrapper.find('[data-testid="toggle-status-button"]').element as HTMLButtonElement).disabled).toBe(true);
  });
});
