import { describe, it, expect, vi, beforeEach } from "vitest";
import HomePage from "./HomePage.svelte";
import { renderWithProviders } from "../../../test-utils";
import { coursesStore } from "../states/coursesStore";
import * as toolsHelper from "../../../helpers/toolsHelper";

const tick = () => new Promise((r) => setTimeout(r, 20));
const click = (wrapper: any, id: string) => (wrapper.find(`[data-testid="${id}"]`).element as HTMLElement).click();

const profile = { id: 1, name: "Martha", email: "m@d.id", photo: null };
const courses = [
  { id: 10, user_id: 1, title: "Svelte Dasar", description: "Belajar Svelte", cover: "https://x.test/c.jpg", total_contents: 3, avg_ratings: 4.5 },
  { id: 11, user_id: 2, title: "Algoritma", description: "Struktur data", cover: null },
];

function renderHome(state: Record<string, any> = {}) {
  return renderWithProviders(HomePage, { preloadedState: { courses, profile, ...state } });
}

describe("HomePage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(coursesStore, "asyncSetCourses").mockImplementation(() => Promise.resolve());
  });

  it("memuat dan menampilkan kartu kursus dengan nilai bawaan", async () => {
    const { wrapper } = renderHome();
    await tick();
    expect(coursesStore.asyncSetCourses).toHaveBeenCalledWith(false);
    expect(wrapper.text()).toContain("Semua Kursus");
    expect(wrapper.text()).toContain("Svelte Dasar");
    expect(wrapper.text()).toContain("3 konten");
    expect(wrapper.text()).toContain("4.5");
    expect(wrapper.text()).toContain("0 konten");
    expect(wrapper.find('[data-testid="course-card-10"] img').exists()).toBe(true);
    expect(wrapper.find('[data-testid="course-card-11"] img').exists()).toBe(false);
  });

  it("tombol hapus hanya muncul pada kursus milik pengguna", async () => {
    const { wrapper } = renderHome();
    await tick();
    expect(wrapper.find('[data-testid="delete-course-10"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="delete-course-11"]').exists()).toBe(false);
  });

  it("tidak ada tombol hapus bila profil belum tersedia", async () => {
    const { wrapper } = renderHome({ profile: null });
    await tick();
    expect(wrapper.find('[data-testid="delete-course-10"]').exists()).toBe(false);
  });

  it("mencari berdasarkan judul dan deskripsi, serta menampilkan keadaan kosong", async () => {
    const { wrapper } = renderHome();
    await tick();
    const input = wrapper.find('[data-testid="search-course-input"]');
    await input.setValue("svelte");
    expect(wrapper.text()).toContain("Svelte Dasar");
    expect(wrapper.text()).not.toContain("Algoritma");
    await input.setValue("struktur");
    expect(wrapper.text()).toContain("Algoritma");
    expect(wrapper.text()).not.toContain("Svelte Dasar");
    await input.setValue("tidak-ada");
    expect(wrapper.find('[data-testid="empty-courses"]').exists()).toBe(true);
  });

  it("menampilkan loading saat data belum ada", async () => {
    (coursesStore.asyncSetCourses as any).mockImplementation(() => new Promise(() => {}));
    const { wrapper } = renderHome({ courses: [] });
    await tick();
    expect(wrapper.find('[data-testid="loading-courses"]').exists()).toBe(true);
  });

  it("filter 'Kursus saya' memuat ulang dengan is_me", async () => {
    const { wrapper } = renderHome();
    await tick();
    (wrapper.find('[data-testid="only-mine-checkbox"]').element as HTMLInputElement).click();
    await tick();
    expect(coursesStore.asyncSetCourses).toHaveBeenLastCalledWith(true);
  });

  it("menghapus kursus setelah konfirmasi lalu memuat ulang", async () => {
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: true } as any);
    const del = vi.spyOn(coursesStore, "asyncSetIsCourseDelete").mockImplementation(async () => {
      coursesStore.setIsCourseDeleted(true);
      coursesStore.setIsCourseDelete(true);
    });
    const { wrapper } = renderHome();
    await tick();
    click(wrapper, "delete-course-10");
    await tick();
    expect(del).toHaveBeenCalledWith(10);
    expect(coursesStore.asyncSetCourses).toHaveBeenCalledTimes(2);
    expect(coursesStore.isCourseDelete).toBe(false);
  });

  it("tidak memuat ulang bila penghapusan gagal", async () => {
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: true } as any);
    vi.spyOn(coursesStore, "asyncSetIsCourseDelete").mockImplementation(async () => {
      coursesStore.setIsCourseDeleted(false);
      coursesStore.setIsCourseDelete(true);
    });
    const { wrapper } = renderHome();
    await tick();
    click(wrapper, "delete-course-10");
    await tick();
    expect(coursesStore.asyncSetCourses).toHaveBeenCalledTimes(1);
  });

  it("membatalkan penghapusan bila konfirmasi ditolak", async () => {
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: false } as any);
    const del = vi.spyOn(coursesStore, "asyncSetIsCourseDelete");
    const { wrapper } = renderHome();
    await tick();
    click(wrapper, "delete-course-10");
    await tick();
    expect(del).not.toHaveBeenCalled();
  });

  it("membuka dan menutup modal tambah kursus", async () => {
    const { wrapper } = renderHome();
    await tick();
    expect(wrapper.find('[data-testid="add-modal"]').exists()).toBe(false);
    click(wrapper, "add-course-button");
    await tick();
    expect(wrapper.find('[data-testid="add-modal"]').exists()).toBe(true);
    click(wrapper, "add-modal-cancel");
    await tick();
    expect(wrapper.find('[data-testid="add-modal"]').exists()).toBe(false);
  });

  it("menutup modal dan memuat ulang setelah kursus ditambahkan", async () => {
    vi.spyOn(coursesStore, "asyncSetIsCourseAdd").mockImplementation(async () => {
      coursesStore.setIsCourseAdded(true);
      coursesStore.setIsCourseAdd(true);
    });
    const { wrapper } = renderHome();
    await tick();
    click(wrapper, "add-course-button");
    await tick();
    await wrapper.find('[data-testid="course-title-input"]').setValue("Baru");
    await wrapper.find('[data-testid="course-description-input"]').setValue("Deskripsi");
    (wrapper.find('[data-testid="add-form"]').element as HTMLFormElement).dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true })
    );
    await tick();
    expect(wrapper.find('[data-testid="add-modal"]').exists()).toBe(false);
    expect(coursesStore.asyncSetCourses).toHaveBeenCalledTimes(2);
  });
});
