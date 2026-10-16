import { describe, it, expect, vi, beforeEach } from "vitest";
import ChangeCoverModal from "./ChangeCoverModal.svelte";
import { renderWithProviders } from "../../../test-utils";
import { coursesStore } from "../states/coursesStore";

const tick = () => new Promise((r) => setTimeout(r, 20));
const course: any = { id: 7, user_id: 1, title: "J", description: "D" };
const submit = (w: any) =>
  (w.find('[data-testid="cover-form"]').element as HTMLFormElement).dispatchEvent(
    new Event("submit", { bubbles: true, cancelable: true })
  );

async function pick(wrapper: any, files: any) {
  const input = wrapper.find('[data-testid="cover-file-input"]').element as HTMLInputElement;
  Object.defineProperty(input, "files", { value: files, configurable: true });
  input.dispatchEvent(new Event("change", { bubbles: true }));
  await tick();
}
const isDisabled = (w: any) => (w.find('[data-testid="cover-modal-submit"]').element as HTMLButtonElement).disabled;

describe("ChangeCoverModal", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("bisa ditutup lewat X dan Batal", () => {
    const onClose = vi.fn();
    const { wrapper } = renderWithProviders(ChangeCoverModal, { props: { course, onClose, onChanged: vi.fn() } });
    (wrapper.find('[data-testid="cover-modal-close"]').element as HTMLElement).click();
    (wrapper.find('[data-testid="cover-modal-cancel"]').element as HTMLElement).click();
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("tombol unggah nonaktif sampai berkas dipilih", async () => {
    const { wrapper } = renderWithProviders(ChangeCoverModal, { props: { course, onClose: vi.fn(), onChanged: vi.fn() } });
    expect(isDisabled(wrapper)).toBe(true);
    await pick(wrapper, [new File(["x"], "c.png", { type: "image/png" })]);
    expect(isDisabled(wrapper)).toBe(false);
    await pick(wrapper, []);
    expect(isDisabled(wrapper)).toBe(true);
    await pick(wrapper, null);
    expect(isDisabled(wrapper)).toBe(true);
  });

  it("mengunggah sampul dan memanggil onChanged saat berhasil", async () => {
    const file = new File(["x"], "c.png", { type: "image/png" });
    const up = vi.spyOn(coursesStore, "asyncSetIsCourseChangeCover").mockImplementation(async () => {
      coursesStore.setIsCourseChangedCover(true);
      coursesStore.setIsCourseChangeCover(true);
    });
    const onChanged = vi.fn();
    const { wrapper } = renderWithProviders(ChangeCoverModal, { props: { course, onClose: vi.fn(), onChanged } });
    await pick(wrapper, [file]);
    submit(wrapper);
    await tick();
    expect(up).toHaveBeenCalledWith(7, file);
    expect(onChanged).toHaveBeenCalledTimes(1);
  });

  it("tidak memanggil onChanged saat gagal", async () => {
    vi.spyOn(coursesStore, "asyncSetIsCourseChangeCover").mockImplementation(async () => {
      coursesStore.setIsCourseChangedCover(false);
      coursesStore.setIsCourseChangeCover(true);
    });
    const onChanged = vi.fn();
    const { wrapper } = renderWithProviders(ChangeCoverModal, { props: { course, onClose: vi.fn(), onChanged } });
    await pick(wrapper, [new File(["x"], "c.png")]);
    submit(wrapper);
    await tick();
    expect(onChanged).not.toHaveBeenCalled();
    expect(isDisabled(wrapper)).toBe(false);
  });

  it("menampilkan loading selama menunggu", async () => {
    vi.spyOn(coursesStore, "asyncSetIsCourseChangeCover").mockImplementation(() => new Promise(() => {}));
    const { wrapper } = renderWithProviders(ChangeCoverModal, { props: { course, onClose: vi.fn(), onChanged: vi.fn() } });
    await pick(wrapper, [new File(["x"], "c.png")]);
    submit(wrapper);
    await tick();
    expect(isDisabled(wrapper)).toBe(true);
    expect(wrapper.find('[data-testid="cover-modal-submit"] [data-testid="icon"]').exists()).toBe(true);
  });
});
