import { describe, it, expect, vi, beforeEach } from "vitest";
import AddModal from "./AddModal.svelte";
import { renderWithProviders } from "../../../test-utils";
import { coursesStore } from "../states/coursesStore";

const tick = () => new Promise((r) => setTimeout(r, 20));

async function fillAndSubmit(wrapper: any) {
  await wrapper.find('[data-testid="course-title-input"]').setValue("Svelte Dasar");
  await wrapper.find('[data-testid="course-description-input"]').setValue("Belajar Svelte 5");
  (wrapper.find('[data-testid="add-form"]').element as HTMLFormElement).dispatchEvent(
    new Event("submit", { bubbles: true, cancelable: true })
  );
  await tick();
}

describe("AddModal", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("menutup modal lewat tombol X dan Batal", () => {
    const onClose = vi.fn();
    const { wrapper } = renderWithProviders(AddModal, { props: { onClose, onAdded: vi.fn() } });
    expect(wrapper.text()).toContain("Tambah Kursus");
    (wrapper.find('[data-testid="add-modal-close"]').element as HTMLElement).click();
    (wrapper.find('[data-testid="add-modal-cancel"]').element as HTMLElement).click();
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("mengirim data dan memanggil onAdded saat berhasil", async () => {
    const add = vi.spyOn(coursesStore, "asyncSetIsCourseAdd").mockImplementation(async () => {
      coursesStore.setIsCourseAdded(true);
      coursesStore.setIsCourseAdd(true);
    });
    const onAdded = vi.fn();
    const { wrapper } = renderWithProviders(AddModal, { props: { onClose: vi.fn(), onAdded } });
    await fillAndSubmit(wrapper);
    expect(add).toHaveBeenCalledWith("Svelte Dasar", "Belajar Svelte 5");
    expect(onAdded).toHaveBeenCalledTimes(1);
    expect(coursesStore.isCourseAdd).toBe(false);
    expect(coursesStore.isCourseAdded).toBe(false);
  });

  it("tidak memanggil onAdded saat gagal dan tombol aktif kembali", async () => {
    vi.spyOn(coursesStore, "asyncSetIsCourseAdd").mockImplementation(async () => {
      coursesStore.setIsCourseAdded(false);
      coursesStore.setIsCourseAdd(true);
    });
    const onAdded = vi.fn();
    const { wrapper } = renderWithProviders(AddModal, { props: { onClose: vi.fn(), onAdded } });
    await fillAndSubmit(wrapper);
    expect(onAdded).not.toHaveBeenCalled();
    expect((wrapper.find('[data-testid="add-modal-submit"]').element as HTMLButtonElement).disabled).toBe(false);
  });

  it("menonaktifkan tombol simpan selama menunggu respons", async () => {
    vi.spyOn(coursesStore, "asyncSetIsCourseAdd").mockImplementation(() => new Promise(() => {}));
    const { wrapper } = renderWithProviders(AddModal, { props: { onClose: vi.fn(), onAdded: vi.fn() } });
    await fillAndSubmit(wrapper);
    expect((wrapper.find('[data-testid="add-modal-submit"]').element as HTMLButtonElement).disabled).toBe(true);
    expect(wrapper.find('[data-testid="add-modal-submit"] [data-testid="icon"]').exists()).toBe(true);
  });
});
