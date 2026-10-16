import { describe, it, expect, vi, beforeEach } from "vitest";
import ChangeModal from "./ChangeModal.svelte";
import { renderWithProviders } from "../../../test-utils";
import { coursesStore } from "../states/coursesStore";

const tick = () => new Promise((r) => setTimeout(r, 20));
const course: any = { id: 7, user_id: 1, title: "Judul Lama", description: "Deskripsi Lama" };
const submit = (w: any) =>
  (w.find('[data-testid="change-form"]').element as HTMLFormElement).dispatchEvent(
    new Event("submit", { bubbles: true, cancelable: true })
  );

describe("ChangeModal", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("terisi data kursus dan bisa ditutup", () => {
    const onClose = vi.fn();
    const { wrapper } = renderWithProviders(ChangeModal, { props: { course, onClose, onChanged: vi.fn() } });
    expect((wrapper.find('[data-testid="change-title-input"]').element as HTMLInputElement).value).toBe("Judul Lama");
    expect((wrapper.find('[data-testid="change-description-input"]').element as HTMLTextAreaElement).value).toBe("Deskripsi Lama");
    (wrapper.find('[data-testid="change-modal-close"]').element as HTMLElement).click();
    (wrapper.find('[data-testid="change-modal-cancel"]').element as HTMLElement).click();
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("mengirim perubahan dan memanggil onChanged saat berhasil", async () => {
    const change = vi.spyOn(coursesStore, "asyncSetIsCourseChange").mockImplementation(async () => {
      coursesStore.setIsCourseChanged(true);
      coursesStore.setIsCourseChange(true);
    });
    const onChanged = vi.fn();
    const { wrapper } = renderWithProviders(ChangeModal, { props: { course, onClose: vi.fn(), onChanged } });
    await wrapper.find('[data-testid="change-title-input"]').setValue("Judul Baru");
    await wrapper.find('[data-testid="change-description-input"]').setValue("Deskripsi Baru");
    submit(wrapper);
    await tick();
    expect(change).toHaveBeenCalledWith(7, "Judul Baru", "Deskripsi Baru");
    expect(onChanged).toHaveBeenCalledTimes(1);
  });

  it("tidak memanggil onChanged saat gagal", async () => {
    vi.spyOn(coursesStore, "asyncSetIsCourseChange").mockImplementation(async () => {
      coursesStore.setIsCourseChanged(false);
      coursesStore.setIsCourseChange(true);
    });
    const onChanged = vi.fn();
    const { wrapper } = renderWithProviders(ChangeModal, { props: { course, onClose: vi.fn(), onChanged } });
    submit(wrapper);
    await tick();
    expect(onChanged).not.toHaveBeenCalled();
    expect((wrapper.find('[data-testid="change-modal-submit"]').element as HTMLButtonElement).disabled).toBe(false);
  });

  it("menampilkan loading selama menunggu", async () => {
    vi.spyOn(coursesStore, "asyncSetIsCourseChange").mockImplementation(() => new Promise(() => {}));
    const { wrapper } = renderWithProviders(ChangeModal, { props: { course, onClose: vi.fn(), onChanged: vi.fn() } });
    submit(wrapper);
    await tick();
    expect((wrapper.find('[data-testid="change-modal-submit"]').element as HTMLButtonElement).disabled).toBe(true);
  });
});
