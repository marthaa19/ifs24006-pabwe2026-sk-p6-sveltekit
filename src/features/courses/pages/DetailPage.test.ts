import { describe, it, expect, vi, beforeEach } from "vitest";
import DetailPage from "./DetailPage.svelte";
import { renderWithProviders } from "../../../test-utils";
import { coursesStore } from "../states/coursesStore";
import * as toolsHelper from "../../../helpers/toolsHelper";

const tick = () => new Promise((r) => setTimeout(r, 20));
const click = (w: any, id: string) => (w.find(`[data-testid="${id}"]`).element as HTMLElement).click();
const has = (w: any, id: string) => w.find(`[data-testid="${id}"]`).exists();
const submit = (w: any, id: string) =>
  (w.find(`[data-testid="${id}"]`).element as HTMLFormElement).dispatchEvent(
    new Event("submit", { bubbles: true, cancelable: true })
  );

const me = { id: 1, name: "Martha", email: "m@d.id", photo: null };
const baseCourse: any = {
  id: 5, user_id: 2, title: "Svelte Dasar", description: "Belajar Svelte", cover: "https://x.test/c.jpg",
  created_at: "2026-01-01T00:00:00Z", author: { name: "Pak Dosen" }, students: [], avg_ratings: 4.5,
  contents: [
    { id: 11, course_id: 5, title: "Bab 1", youtube: "https://youtu.be/a", my_status_finished: 1 },
    { id: 12, course_id: 5, title: "Bab 2", youtube: "https://youtu.be/b" },
  ],
  ratings: [{ name: "Budi", ratings: 5, comment: "Bagus" }],
};

function renderDetail(course: any = baseCourse, profile: any = me) {
  return renderWithProviders(DetailPage, { params: { courseId: "5" }, preloadedState: { course, profile } });
}

describe("DetailPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(coursesStore, "asyncSetCourse").mockImplementation(() => Promise.resolve());
  });

  it("memuat kursus berdasarkan parameter rute", async () => {
    renderDetail();
    await tick();
    expect(coursesStore.asyncSetCourse).toHaveBeenCalledWith("5");
  });

  it("menampilkan loading selama memuat", async () => {
    (coursesStore.asyncSetCourse as any).mockImplementation(() => new Promise(() => {}));
    const { wrapper } = renderDetail();
    await tick();
    expect(has(wrapper, "loading-course")).toBe(true);
  });

  it("menampilkan pesan bila kursus tidak ditemukan", async () => {
    const { wrapper } = renderDetail(null);
    await tick();
    expect(has(wrapper, "course-not-found")).toBe(true);
  });

  it("menampilkan detail lengkap, konten, dan ulasan", async () => {
    const { wrapper } = renderDetail();
    await tick();
    expect(wrapper.find('[data-testid="course-title"]').text()).toBe("Svelte Dasar");
    expect(wrapper.text()).toContain("Pak Dosen");
    expect(wrapper.text()).toContain("4.5");
    expect(has(wrapper, "course-cover")).toBe(true);
    expect(wrapper.text()).toContain("Bab 1");
    expect(has(wrapper, "finished-11")).toBe(true);
    expect(has(wrapper, "finished-12")).toBe(false);
    expect(wrapper.text()).toContain("Bagus");
    expect(wrapper.find('[data-testid="content-item-11"] a').attributes("href")).toBe("/courses/5/contents/11");
  });

  it("memakai nilai bawaan bila data opsional kosong", async () => {
    const { wrapper } = renderDetail({ id: 5, user_id: 2, title: "T", description: "D", cover: null }, null);
    await tick();
    expect(has(wrapper, "course-cover-empty")).toBe(true);
    expect(wrapper.text()).toContain("Tidak diketahui");
    expect(wrapper.text()).toContain("0 konten");
    expect(has(wrapper, "empty-contents")).toBe(true);
    expect(has(wrapper, "empty-reviews")).toBe(true);
    expect(has(wrapper, "join-button")).toBe(true);
  });

  it("pemilik melihat tombol kelola, bukan gabung/keluar/rating", async () => {
    const { wrapper } = renderDetail({ ...baseCourse, user_id: 1, students: [1] });
    await tick();
    expect(has(wrapper, "change-button")).toBe(true);
    expect(has(wrapper, "cover-button")).toBe(true);
    expect(has(wrapper, "add-content-button")).toBe(true);
    expect(has(wrapper, "edit-content-11")).toBe(true);
    expect(has(wrapper, "leave-button")).toBe(false);
    expect(has(wrapper, "join-button")).toBe(false);
    expect(has(wrapper, "rating-form")).toBe(false);
  });

  it("peserta melihat tombol keluar, progres, dan form rating", async () => {
    const { wrapper } = renderDetail({ ...baseCourse, students: [1], my_percentage_finished: 50 });
    await tick();
    expect(has(wrapper, "leave-button")).toBe(true);
    expect(has(wrapper, "rating-form")).toBe(true);
    expect(wrapper.find('[data-testid="my-progress"]').text()).toContain("50%");
    expect(has(wrapper, "add-content-button")).toBe(false);
    expect(has(wrapper, "edit-content-11")).toBe(false);
  });

  it("progres peserta bernilai 0 bila belum ada data", async () => {
    const { wrapper } = renderDetail({ ...baseCourse, students: [1] });
    await tick();
    expect(wrapper.find('[data-testid="my-progress"]').text()).toContain("0%");
  });

  it("pengguna login tanpa data peserta dianggap bukan peserta", async () => {
    const { wrapper } = renderDetail({ id: 5, user_id: 2, title: "T", description: "D" });
    await tick();
    expect(has(wrapper, "join-button")).toBe(true);
    expect(wrapper.text()).toContain("0 peserta");
  });

  it("bukan peserta melihat tombol gabung", async () => {
    const { wrapper } = renderDetail();
    await tick();
    expect(has(wrapper, "join-button")).toBe(true);
    expect(has(wrapper, "my-progress")).toBe(false);
  });

  it("gabung: sukses memuat ulang, gagal tidak", async () => {
    vi.spyOn(coursesStore, "asyncSetIsCourseJoin").mockImplementation(async () => {
      coursesStore.setIsCourseJoined(true);
      coursesStore.setIsCourseJoin(true);
    });
    const { wrapper } = renderDetail();
    await tick();
    click(wrapper, "join-button");
    await tick();
    expect(coursesStore.asyncSetIsCourseJoin).toHaveBeenCalledWith("5");
    expect(coursesStore.asyncSetCourse).toHaveBeenCalledTimes(2);

    (coursesStore.asyncSetIsCourseJoin as any).mockImplementation(async () => {
      coursesStore.setIsCourseJoined(false);
      coursesStore.setIsCourseJoin(true);
    });
    click(wrapper, "join-button");
    await tick();
    expect(coursesStore.asyncSetCourse).toHaveBeenCalledTimes(2);
  });

  it("keluar: sukses memuat ulang, gagal tidak", async () => {
    vi.spyOn(coursesStore, "asyncSetIsCourseLeave").mockImplementation(async () => {
      coursesStore.setIsCourseLeft(true);
      coursesStore.setIsCourseLeave(true);
    });
    const { wrapper } = renderDetail({ ...baseCourse, students: [1] });
    await tick();
    click(wrapper, "leave-button");
    await tick();
    expect(coursesStore.asyncSetIsCourseLeave).toHaveBeenCalledWith("5");
    expect(coursesStore.asyncSetCourse).toHaveBeenCalledTimes(2);

    (coursesStore.asyncSetIsCourseLeave as any).mockImplementation(async () => {
      coursesStore.setIsCourseLeft(false);
      coursesStore.setIsCourseLeave(true);
    });
    click(wrapper, "leave-button");
    await tick();
    expect(coursesStore.asyncSetCourse).toHaveBeenCalledTimes(2);
  });

  it("rating: sukses mengosongkan komentar dan memuat ulang, gagal tidak", async () => {
    const rate = vi.spyOn(coursesStore, "asyncSetIsCourseRating").mockImplementation(async () => {
      coursesStore.setIsCourseRated(true);
      coursesStore.setIsCourseRating(true);
    });
    const { wrapper } = renderDetail({ ...baseCourse, students: [1] });
    await tick();
    await wrapper.find('[data-testid="rating-select"]').setValue("4");
    await wrapper.find('[data-testid="rating-comment"]').setValue("Mantap");
    submit(wrapper, "rating-form");
    await tick();
    expect(rate).toHaveBeenCalledWith("5", 4, "Mantap");
    expect((wrapper.find('[data-testid="rating-comment"]').element as HTMLTextAreaElement).value).toBe("");
    expect(coursesStore.asyncSetCourse).toHaveBeenCalledTimes(2);

    rate.mockImplementation(async () => {
      coursesStore.setIsCourseRated(false);
      coursesStore.setIsCourseRating(true);
    });
    submit(wrapper, "rating-form");
    await tick();
    expect(coursesStore.asyncSetCourse).toHaveBeenCalledTimes(2);
  });

  it("hapus konten: konfirmasi ya memuat ulang, gagal tidak, batal tidak memanggil", async () => {
    const confirm = vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: true } as any);
    const del = vi.spyOn(coursesStore, "asyncSetIsContentDelete").mockImplementation(async () => {
      coursesStore.setIsContentDeleted(true);
      coursesStore.setIsContentDelete(true);
    });
    const { wrapper } = renderDetail({ ...baseCourse, user_id: 1 });
    await tick();
    click(wrapper, "delete-content-11");
    await tick();
    expect(del).toHaveBeenCalledWith(11);
    expect(coursesStore.asyncSetCourse).toHaveBeenCalledTimes(2);

    del.mockImplementation(async () => {
      coursesStore.setIsContentDeleted(false);
      coursesStore.setIsContentDelete(true);
    });
    click(wrapper, "delete-content-11");
    await tick();
    expect(coursesStore.asyncSetCourse).toHaveBeenCalledTimes(2);

    confirm.mockResolvedValue({ isConfirmed: false } as any);
    del.mockClear();
    click(wrapper, "delete-content-12");
    await tick();
    expect(del).not.toHaveBeenCalled();
  });

  it("modal ubah data: buka, tutup, dan simpan memuat ulang", async () => {
    vi.spyOn(coursesStore, "asyncSetIsCourseChange").mockImplementation(async () => {
      coursesStore.setIsCourseChanged(true);
      coursesStore.setIsCourseChange(true);
    });
    const { wrapper } = renderDetail({ ...baseCourse, user_id: 1 });
    await tick();
    click(wrapper, "change-button");
    await tick();
    expect(has(wrapper, "change-modal")).toBe(true);
    click(wrapper, "change-modal-cancel");
    await tick();
    expect(has(wrapper, "change-modal")).toBe(false);

    click(wrapper, "change-button");
    await tick();
    submit(wrapper, "change-form");
    await tick();
    expect(has(wrapper, "change-modal")).toBe(false);
    expect(coursesStore.asyncSetCourse).toHaveBeenCalledTimes(2);
  });

  it("modal sampul: buka dan tutup", async () => {
    const { wrapper } = renderDetail({ ...baseCourse, user_id: 1 });
    await tick();
    click(wrapper, "cover-button");
    await tick();
    expect(has(wrapper, "cover-modal")).toBe(true);
    click(wrapper, "cover-modal-cancel");
    await tick();
    expect(has(wrapper, "cover-modal")).toBe(false);
  });

  it("modal konten: tambah dan ubah", async () => {
    const { wrapper } = renderDetail({ ...baseCourse, user_id: 1 });
    await tick();
    click(wrapper, "add-content-button");
    await tick();
    expect(wrapper.text()).toContain("Tambah Konten");
    expect((wrapper.find('[data-testid="content-title-input"]').element as HTMLInputElement).value).toBe("");
    click(wrapper, "content-modal-cancel");
    await tick();
    expect(has(wrapper, "content-modal")).toBe(false);

    click(wrapper, "edit-content-11");
    await tick();
    expect(wrapper.text()).toContain("Ubah Konten");
    expect((wrapper.find('[data-testid="content-title-input"]').element as HTMLInputElement).value).toBe("Bab 1");
    click(wrapper, "content-modal-cancel");
    await tick();

    click(wrapper, "add-content-button");
    await tick();
    expect((wrapper.find('[data-testid="content-title-input"]').element as HTMLInputElement).value).toBe("");
  });

  it("simpan sampul menutup modal dan memuat ulang detail", async () => {
    vi.spyOn(coursesStore, "asyncSetIsCourseChangeCover").mockImplementation(async () => {
      coursesStore.setIsCourseChangedCover(true);
      coursesStore.setIsCourseChangeCover(true);
    });
    const { wrapper } = renderDetail({ ...baseCourse, user_id: 1 });
    await tick();
    click(wrapper, "cover-button");
    await tick();
    const input = wrapper.find('[data-testid="cover-file-input"]').element as HTMLInputElement;
    Object.defineProperty(input, "files", { value: [new File(["x"], "c.png")], configurable: true });
    input.dispatchEvent(new Event("change", { bubbles: true }));
    await tick();
    submit(wrapper, "cover-form");
    await tick();
    expect(has(wrapper, "cover-modal")).toBe(false);
    expect(coursesStore.asyncSetCourse).toHaveBeenCalledTimes(2);
  });

  it("simpan konten menutup modal dan memuat ulang detail", async () => {
    vi.spyOn(coursesStore, "asyncSetIsContentAdd").mockImplementation(async () => {
      coursesStore.setIsContentAdded(true);
      coursesStore.setIsContentAdd(true);
    });
    const { wrapper } = renderDetail({ ...baseCourse, user_id: 1 });
    await tick();
    click(wrapper, "add-content-button");
    await tick();
    submit(wrapper, "content-form");
    await tick();
    expect(has(wrapper, "content-modal")).toBe(false);
    expect(coursesStore.asyncSetCourse).toHaveBeenCalledTimes(2);
  });
});
