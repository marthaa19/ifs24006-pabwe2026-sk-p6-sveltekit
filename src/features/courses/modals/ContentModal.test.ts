import { describe, it, expect, vi, beforeEach } from "vitest";
import ContentModal from "./ContentModal.svelte";
import { renderWithProviders } from "../../../test-utils";
import { coursesStore } from "../states/coursesStore";

const tick = () => new Promise((r) => setTimeout(r, 20));
const existing: any = { id: 99, course_id: 7, title: "Bab 1", youtube: "https://youtu.be/abc" };
const submit = (w: any) =>
  (w.find('[data-testid="content-form"]').element as HTMLFormElement).dispatchEvent(
    new Event("submit", { bubbles: true, cancelable: true })
  );

describe("ContentModal", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("mode tambah: form kosong dan bisa ditutup", () => {
    const onClose = vi.fn();
    const { wrapper } = renderWithProviders(ContentModal, { props: { courseId: 7, onClose, onSaved: vi.fn() } });
    expect(wrapper.text()).toContain("Tambah Konten");
    expect((wrapper.find('[data-testid="content-title-input"]').element as HTMLInputElement).value).toBe("");
    (wrapper.find('[data-testid="content-modal-close"]').element as HTMLElement).click();
    (wrapper.find('[data-testid="content-modal-cancel"]').element as HTMLElement).click();
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("mode tambah: sukses memanggil onSaved", async () => {
    const add = vi.spyOn(coursesStore, "asyncSetIsContentAdd").mockImplementation(async () => {
      coursesStore.setIsContentAdded(true);
      coursesStore.setIsContentAdd(true);
    });
    const onSaved = vi.fn();
    const { wrapper } = renderWithProviders(ContentModal, { props: { courseId: 7, onClose: vi.fn(), onSaved } });
    await wrapper.find('[data-testid="content-title-input"]').setValue("Bab 2");
    await wrapper.find('[data-testid="content-youtube-input"]').setValue("https://youtu.be/xyz");
    submit(wrapper);
    await tick();
    expect(add).toHaveBeenCalledWith(7, "Bab 2", "https://youtu.be/xyz");
    expect(onSaved).toHaveBeenCalledTimes(1);
  });

  it("mode tambah: gagal tidak memanggil onSaved", async () => {
    vi.spyOn(coursesStore, "asyncSetIsContentAdd").mockImplementation(async () => {
      coursesStore.setIsContentAdded(false);
      coursesStore.setIsContentAdd(true);
    });
    const onSaved = vi.fn();
    const { wrapper } = renderWithProviders(ContentModal, { props: { courseId: 7, onClose: vi.fn(), onSaved } });
    submit(wrapper);
    await tick();
    expect(onSaved).not.toHaveBeenCalled();
  });

  it("mode ubah: terisi data konten dan sukses memanggil onSaved", async () => {
    const change = vi.spyOn(coursesStore, "asyncSetIsContentChange").mockImplementation(async () => {
      coursesStore.setIsContentChanged(true);
      coursesStore.setIsContentChange(true);
    });
    const onSaved = vi.fn();
    const { wrapper } = renderWithProviders(ContentModal, { props: { courseId: 7, content: existing, onClose: vi.fn(), onSaved } });
    expect(wrapper.text()).toContain("Ubah Konten");
    expect((wrapper.find('[data-testid="content-title-input"]').element as HTMLInputElement).value).toBe("Bab 1");
    submit(wrapper);
    await tick();
    expect(change).toHaveBeenCalledWith(99, "Bab 1", "https://youtu.be/abc");
    expect(onSaved).toHaveBeenCalledTimes(1);
  });

  it("mode ubah: gagal tidak memanggil onSaved dan loading berhenti", async () => {
    vi.spyOn(coursesStore, "asyncSetIsContentChange").mockImplementation(async () => {
      coursesStore.setIsContentChanged(false);
      coursesStore.setIsContentChange(true);
    });
    const onSaved = vi.fn();
    const { wrapper } = renderWithProviders(ContentModal, { props: { courseId: 7, content: existing, onClose: vi.fn(), onSaved } });
    submit(wrapper);
    await tick();
    expect(onSaved).not.toHaveBeenCalled();
    expect((wrapper.find('[data-testid="content-modal-submit"]').element as HTMLButtonElement).disabled).toBe(false);
  });

  it("menampilkan loading selama menunggu", async () => {
    vi.spyOn(coursesStore, "asyncSetIsContentAdd").mockImplementation(() => new Promise(() => {}));
    const { wrapper } = renderWithProviders(ContentModal, { props: { courseId: 7, onClose: vi.fn(), onSaved: vi.fn() } });
    submit(wrapper);
    await tick();
    expect((wrapper.find('[data-testid="content-modal-submit"]').element as HTMLButtonElement).disabled).toBe(true);
  });
});
