import { describe, it, expect, vi, beforeEach } from "vitest";
import courseApi from "./courseApi";
import apiHelper from "../../../helpers/apiHelper";

const BASE = "https://open-api.delcom.org/api/v1/courses";

function mockJson(body: any) {
  return vi.spyOn(apiHelper, "fetchData").mockResolvedValue({ json: async () => body } as any);
}

describe("courseApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("pengecekan hasil (helper _request)", () => {
    it("menerima status success", async () => {
      mockJson({ status: "success", message: "ok" });
      expect(await courseApi.deleteCourse(1)).toBe("ok");
    });

    it("menerima success: true tanpa status", async () => {
      mockJson({ success: true, message: "ok2" });
      expect(await courseApi.deleteCourse(1)).toBe("ok2");
    });

    it("melempar pesan dari server", async () => {
      mockJson({ status: "fail", message: "Pesan server" });
      await expect(courseApi.deleteCourse(1)).rejects.toThrow("Pesan server");
    });

    it("memakai pesan bawaan jika server tidak mengirim pesan", async () => {
      mockJson({ status: "fail" });
      await expect(courseApi.deleteCourse(1)).rejects.toThrow("Gagal menghapus kursus");
    });
  });

  describe("course", () => {
    it("postCourse", async () => {
      const spy = mockJson({ status: "success", data: { course_id: 3 } });
      expect(await courseApi.postCourse("T", "D")).toEqual({ course_id: 3 });
      expect(spy).toHaveBeenCalledWith(BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "T", description: "D" }),
      });
    });

    it("postCourse gagal", async () => {
      mockJson({ status: "fail" });
      await expect(courseApi.postCourse("", "")).rejects.toThrow("Gagal menambahkan kursus");
    });

    it("postCourseCover dengan File", async () => {
      const spy = mockJson({ status: "success", message: "cover ok" });
      const file = new File(["x"], "a.png", { type: "image/png" });
      expect(await courseApi.postCourseCover(7, file)).toBe("cover ok");
      const [url, init] = spy.mock.calls[0] as any;
      expect(url).toBe(`${BASE}/7/cover`);
      expect(init.method).toBe("POST");
      expect(init.body).toBeInstanceOf(FormData);
      expect((init.body.get("cover") as File).name).toBe("a.png");
    });

    it("postCourseCover dengan Blob tanpa nama memakai cover.jpg", async () => {
      const spy = mockJson({ status: "success", message: "ok" });
      await courseApi.postCourseCover(7, new Blob(["x"]));
      const init = (spy.mock.calls[0] as any)[1];
      expect((init.body.get("cover") as File).name).toBe("cover.jpg");
    });

    it("postCourseCover gagal", async () => {
      mockJson({ status: "fail" });
      await expect(courseApi.postCourseCover(1, new Blob([]))).rejects.toThrow("Gagal mengubah cover");
    });

    it("putCourse", async () => {
      const spy = mockJson({ status: "success", message: "diubah" });
      expect(await courseApi.putCourse(2, "T", "D")).toBe("diubah");
      expect(spy).toHaveBeenCalledWith(`${BASE}/2`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "T", description: "D" }),
      });
    });

    it("putCourse gagal", async () => {
      mockJson({ status: "fail" });
      await expect(courseApi.putCourse(2, "", "")).rejects.toThrow("Gagal mengubah kursus");
    });

    it("getCourses semua", async () => {
      const spy = mockJson({ status: "success", data: { courses: [{ id: 1 }] } });
      expect(await courseApi.getCourses()).toEqual([{ id: 1 }]);
      expect(spy).toHaveBeenCalledWith(BASE, { method: "GET" });
    });

    it("getCourses milik saya memakai is_me=1", async () => {
      const spy = mockJson({ status: "success", data: { courses: [] } });
      await courseApi.getCourses(true);
      expect(spy).toHaveBeenCalledWith(`${BASE}?is_me=1`, { method: "GET" });
    });

    it("getCourses mengembalikan array kosong jika data tidak ada", async () => {
      mockJson({ status: "success" });
      expect(await courseApi.getCourses()).toEqual([]);
    });

    it("getCourses gagal", async () => {
      mockJson({ status: "fail" });
      await expect(courseApi.getCourses()).rejects.toThrow("Gagal mengambil data kursus");
    });

    it("getCourseById", async () => {
      const spy = mockJson({ status: "success", data: { course: { id: 5 } } });
      expect(await courseApi.getCourseById(5)).toEqual({ id: 5 });
      expect(spy).toHaveBeenCalledWith(`${BASE}/5`, { method: "GET" });
    });

    it("getCourseById tanpa data", async () => {
      mockJson({ status: "success" });
      expect(await courseApi.getCourseById(5)).toBeUndefined();
    });

    it("getCourseById gagal", async () => {
      mockJson({ status: "fail" });
      await expect(courseApi.getCourseById(5)).rejects.toThrow("Gagal mengambil detail kursus");
    });

    it("deleteCourse", async () => {
      const spy = mockJson({ status: "success", message: "dihapus" });
      expect(await courseApi.deleteCourse(4)).toBe("dihapus");
      expect(spy).toHaveBeenCalledWith(`${BASE}/4`, { method: "DELETE" });
    });

    it("deleteAllCourses", async () => {
      const spy = mockJson({ status: "success", message: "semua dihapus" });
      expect(await courseApi.deleteAllCourses()).toBe("semua dihapus");
      expect(spy).toHaveBeenCalledWith(BASE, { method: "DELETE" });
    });

    it("deleteAllCourses gagal", async () => {
      mockJson({ status: "fail" });
      await expect(courseApi.deleteAllCourses()).rejects.toThrow("Gagal menghapus semua kursus");
    });
  });

  describe("peserta dan rating", () => {
    it("postStudent", async () => {
      const spy = mockJson({ status: "success", message: "gabung" });
      expect(await courseApi.postStudent(1)).toBe("gabung");
      expect(spy).toHaveBeenCalledWith(`${BASE}/1/students`, { method: "POST" });
    });

    it("postStudent gagal", async () => {
      mockJson({ status: "fail" });
      await expect(courseApi.postStudent(1)).rejects.toThrow("Gagal bergabung ke kursus");
    });

    it("deleteStudent", async () => {
      const spy = mockJson({ status: "success", message: "keluar" });
      expect(await courseApi.deleteStudent(1)).toBe("keluar");
      expect(spy).toHaveBeenCalledWith(`${BASE}/1/students`, { method: "DELETE" });
    });

    it("deleteStudent gagal", async () => {
      mockJson({ status: "fail" });
      await expect(courseApi.deleteStudent(1)).rejects.toThrow("Gagal keluar dari kursus");
    });

    it("putRating", async () => {
      const spy = mockJson({ status: "success", message: "rating ok" });
      expect(await courseApi.putRating(1, 5, "Bagus")).toBe("rating ok");
      expect(spy).toHaveBeenCalledWith(`${BASE}/1/students/ratings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ratings: 5, comment: "Bagus" }),
      });
    });

    it("putRating gagal", async () => {
      mockJson({ status: "fail" });
      await expect(courseApi.putRating(1, 5, "")).rejects.toThrow("Gagal menyimpan rating");
    });
  });

  describe("konten", () => {
    it("postContent", async () => {
      const spy = mockJson({ status: "success", data: { content_id: 8 } });
      expect(await courseApi.postContent(1, "Bab 1", "https://youtu.be/abc")).toEqual({ content_id: 8 });
      expect(spy).toHaveBeenCalledWith(`${BASE}/1/contents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Bab 1", youtube: "https://youtu.be/abc" }),
      });
    });

    it("postContent gagal", async () => {
      mockJson({ status: "fail" });
      await expect(courseApi.postContent(1, "", "")).rejects.toThrow("Gagal menambahkan konten");
    });

    it("putContent memakai path /-/contents", async () => {
      const spy = mockJson({ status: "success", message: "konten diubah" });
      expect(await courseApi.putContent(3, "B", "https://youtu.be/x")).toBe("konten diubah");
      expect(spy).toHaveBeenCalledWith(`${BASE}/-/contents/3`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "B", youtube: "https://youtu.be/x" }),
      });
    });

    it("putContent gagal", async () => {
      mockJson({ status: "fail" });
      await expect(courseApi.putContent(3, "", "")).rejects.toThrow("Gagal mengubah konten");
    });

    it("getContentById", async () => {
      const spy = mockJson({ status: "success", data: { course_content: { id: 3 } } });
      expect(await courseApi.getContentById(3)).toEqual({ id: 3 });
      expect(spy).toHaveBeenCalledWith(`${BASE}/-/contents/3`, { method: "GET" });
    });

    it("getContentById tanpa data", async () => {
      mockJson({ status: "success" });
      expect(await courseApi.getContentById(3)).toBeUndefined();
    });

    it("getContentById gagal", async () => {
      mockJson({ status: "fail" });
      await expect(courseApi.getContentById(3)).rejects.toThrow("Gagal mengambil detail konten");
    });

    it("deleteContent", async () => {
      const spy = mockJson({ status: "success", message: "konten dihapus" });
      expect(await courseApi.deleteContent(3)).toBe("konten dihapus");
      expect(spy).toHaveBeenCalledWith(`${BASE}/-/contents/3`, { method: "DELETE" });
    });

    it("deleteContent gagal", async () => {
      mockJson({ status: "fail" });
      await expect(courseApi.deleteContent(3)).rejects.toThrow("Gagal menghapus konten");
    });

    it("postContentStatus", async () => {
      const spy = mockJson({ status: "success", message: "status ok" });
      expect(await courseApi.postContentStatus(3, 1)).toBe("status ok");
      expect(spy).toHaveBeenCalledWith(`${BASE}/-/contents/3/learns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: 1 }),
      });
    });

    it("postContentStatus gagal", async () => {
      mockJson({ status: "fail" });
      await expect(courseApi.postContentStatus(3, 0)).rejects.toThrow("Gagal mengubah status belajar");
    });
  });
});
