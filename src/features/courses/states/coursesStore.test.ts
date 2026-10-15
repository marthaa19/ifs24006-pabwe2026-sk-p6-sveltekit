import { describe, it, expect, vi, beforeEach } from "vitest";
import { useCoursesStore, coursesStore } from "./coursesStore";
import courseApi from "../api/courseApi";
import * as toolsHelper from "../../../helpers/toolsHelper";

describe("coursesStore", () => {
  beforeEach(() => {
    coursesStore.reset();
    vi.restoreAllMocks();
  });

  it("should have correct default state", () => {
    const store = useCoursesStore();
    expect(store.courses).toEqual([]);
    expect(store.course).toBeNull();
    expect(store.content).toBeNull();
    expect(store.isCourse).toBe(false);
    expect(store.isContent).toBe(false);
    expect(store.isCourseAdd).toBe(false);
    expect(store.isCourseAdded).toBe(false);
    expect(store.isCourseChange).toBe(false);
    expect(store.isCourseChanged).toBe(false);
    expect(store.isCourseChangeCover).toBe(false);
    expect(store.isCourseChangedCover).toBe(false);
    expect(store.isCourseDelete).toBe(false);
    expect(store.isCourseDeleted).toBe(false);
    expect(store.isCourseDeleteAll).toBe(false);
    expect(store.isCourseDeletedAll).toBe(false);
    expect(store.isCourseJoin).toBe(false);
    expect(store.isCourseJoined).toBe(false);
    expect(store.isCourseLeave).toBe(false);
    expect(store.isCourseLeft).toBe(false);
    expect(store.isCourseRating).toBe(false);
    expect(store.isCourseRated).toBe(false);
    expect(store.isContentAdd).toBe(false);
    expect(store.isContentAdded).toBe(false);
    expect(store.isContentChange).toBe(false);
    expect(store.isContentChanged).toBe(false);
    expect(store.isContentDelete).toBe(false);
    expect(store.isContentDeleted).toBe(false);
    expect(store.isContentStatusChange).toBe(false);
    expect(store.isContentStatusChanged).toBe(false);
    expect(store.$state.courses).toEqual([]);
  });

  it("should update state with setters", () => {
    const store = useCoursesStore();
    store.setCourses([{ id: 1 } as any]);
    expect(store.courses).toEqual([{ id: 1 }]);
    store.setCourse({ id: 1 } as any);
    expect(store.course).toEqual({ id: 1 });
    store.setContent({ id: 2 } as any);
    expect(store.content).toEqual({ id: 2 });
    store.setIsCourse(true);
    expect(store.isCourse).toBe(true);
    store.setIsContent(true);
    expect(store.isContent).toBe(true);
    store.setIsCourseAdd(true);
    expect(store.isCourseAdd).toBe(true);
    store.setIsCourseAdded(true);
    expect(store.isCourseAdded).toBe(true);
    store.setIsCourseChange(true);
    expect(store.isCourseChange).toBe(true);
    store.setIsCourseChanged(true);
    expect(store.isCourseChanged).toBe(true);
    store.setIsCourseChangeCover(true);
    expect(store.isCourseChangeCover).toBe(true);
    store.setIsCourseChangedCover(true);
    expect(store.isCourseChangedCover).toBe(true);
    store.setIsCourseDelete(true);
    expect(store.isCourseDelete).toBe(true);
    store.setIsCourseDeleted(true);
    expect(store.isCourseDeleted).toBe(true);
    store.setIsCourseDeleteAll(true);
    expect(store.isCourseDeleteAll).toBe(true);
    store.setIsCourseDeletedAll(true);
    expect(store.isCourseDeletedAll).toBe(true);
    store.setIsCourseJoin(true);
    expect(store.isCourseJoin).toBe(true);
    store.setIsCourseJoined(true);
    expect(store.isCourseJoined).toBe(true);
    store.setIsCourseLeave(true);
    expect(store.isCourseLeave).toBe(true);
    store.setIsCourseLeft(true);
    expect(store.isCourseLeft).toBe(true);
    store.setIsCourseRating(true);
    expect(store.isCourseRating).toBe(true);
    store.setIsCourseRated(true);
    expect(store.isCourseRated).toBe(true);
    store.setIsContentAdd(true);
    expect(store.isContentAdd).toBe(true);
    store.setIsContentAdded(true);
    expect(store.isContentAdded).toBe(true);
    store.setIsContentChange(true);
    expect(store.isContentChange).toBe(true);
    store.setIsContentChanged(true);
    expect(store.isContentChanged).toBe(true);
    store.setIsContentDelete(true);
    expect(store.isContentDelete).toBe(true);
    store.setIsContentDeleted(true);
    expect(store.isContentDeleted).toBe(true);
    store.setIsContentStatusChange(true);
    expect(store.isContentStatusChange).toBe(true);
    store.setIsContentStatusChanged(true);
    expect(store.isContentStatusChanged).toBe(true);
  });

  it("should reset state with partial override", () => {
    const store = useCoursesStore();
    store.setCourse({ id: 1 } as any);
    store.reset({ isCourse: true });
    expect(store.course).toBeNull();
    expect(store.isCourse).toBe(true);
    store.reset();
    expect(store.isCourse).toBe(false);
  });

  it("subscribe should emit the current state", () => {
    const store = useCoursesStore();
    let seen: any;
    const unsub = store.subscribe((s) => (seen = s));
    store.setCourses([{ id: 9 } as any]);
    expect(seen.courses).toEqual([{ id: 9 }]);
    unsub();
  });

  describe("loaders", () => {
    it("asyncSetCourses success and failure", async () => {
      const spy = vi.spyOn(courseApi, "getCourses").mockResolvedValue([{ id: 1 } as any]);
      await coursesStore.asyncSetCourses();
      expect(spy).toHaveBeenCalledWith(false);
      expect(coursesStore.courses).toEqual([{ id: 1 }]);

      await coursesStore.asyncSetCourses(true);
      expect(spy).toHaveBeenCalledWith(true);

      spy.mockRejectedValue(new Error("x"));
      await coursesStore.asyncSetCourses();
      expect(coursesStore.courses).toEqual([]);
    });

    it("asyncSetCourse success and failure", async () => {
      const spy = vi.spyOn(courseApi, "getCourseById").mockResolvedValue({ id: 1 } as any);
      await coursesStore.asyncSetCourse(1);
      expect(coursesStore.course).toEqual({ id: 1 });
      expect(coursesStore.isCourse).toBe(true);

      spy.mockRejectedValue(new Error("x"));
      await coursesStore.asyncSetCourse(1);
      expect(coursesStore.course).toBeNull();
      expect(coursesStore.isCourse).toBe(true);
    });

    it("asyncSetContent success and failure", async () => {
      const spy = vi.spyOn(courseApi, "getContentById").mockResolvedValue({ id: 5 } as any);
      await coursesStore.asyncSetContent(5);
      expect(coursesStore.content).toEqual({ id: 5 });
      expect(coursesStore.isContent).toBe(true);

      spy.mockRejectedValue(new Error("x"));
      await coursesStore.asyncSetContent(5);
      expect(coursesStore.content).toBeNull();
      expect(coursesStore.isContent).toBe(true);
    });
  });

  describe("actions", () => {
    it("asyncSetIsCourseAdd success", async () => {
      const ok = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {} as any);
      vi.spyOn(courseApi, "postCourse").mockResolvedValue({} as any);
      await coursesStore.asyncSetIsCourseAdd("a", "a");
      expect(ok).toHaveBeenCalledWith("Kursus berhasil ditambahkan!");
      expect(coursesStore.isCourseAdded).toBe(true);
      expect(coursesStore.isCourseAdd).toBe(true);
    });

    it("asyncSetIsCourseAdd failure", async () => {
      const err = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {} as any);
      vi.spyOn(courseApi, "postCourse").mockRejectedValue(new Error("Gagal"));
      await coursesStore.asyncSetIsCourseAdd("a", "a");
      expect(err).toHaveBeenCalledWith("Gagal");
      expect(coursesStore.isCourseAdded).toBe(false);
      expect(coursesStore.isCourseAdd).toBe(true);
    });

    it("asyncSetIsCourseChange success", async () => {
      const ok = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {} as any);
      vi.spyOn(courseApi, "putCourse").mockResolvedValue("Pesan API" as any);
      await coursesStore.asyncSetIsCourseChange(1, "a", "a");
      expect(ok).toHaveBeenCalledWith("Pesan API");
      expect(coursesStore.isCourseChanged).toBe(true);
      expect(coursesStore.isCourseChange).toBe(true);
    });

    it("asyncSetIsCourseChange success with default message", async () => {
      const ok = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {} as any);
      vi.spyOn(courseApi, "putCourse").mockResolvedValue("" as any);
      await coursesStore.asyncSetIsCourseChange(1, "a", "a");
      expect(ok).toHaveBeenCalledWith("Kursus berhasil diubah!");
    });

    it("asyncSetIsCourseChange failure", async () => {
      const err = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {} as any);
      vi.spyOn(courseApi, "putCourse").mockRejectedValue(new Error("Gagal"));
      await coursesStore.asyncSetIsCourseChange(1, "a", "a");
      expect(err).toHaveBeenCalledWith("Gagal");
      expect(coursesStore.isCourseChanged).toBe(false);
      expect(coursesStore.isCourseChange).toBe(true);
    });

    it("asyncSetIsCourseChangeCover success", async () => {
      const ok = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {} as any);
      vi.spyOn(courseApi, "postCourseCover").mockResolvedValue("Pesan API" as any);
      await coursesStore.asyncSetIsCourseChangeCover(1, new File(["x"], "c.jpg"));
      expect(ok).toHaveBeenCalledWith("Pesan API");
      expect(coursesStore.isCourseChangedCover).toBe(true);
      expect(coursesStore.isCourseChangeCover).toBe(true);
    });

    it("asyncSetIsCourseChangeCover success with default message", async () => {
      const ok = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {} as any);
      vi.spyOn(courseApi, "postCourseCover").mockResolvedValue("" as any);
      await coursesStore.asyncSetIsCourseChangeCover(1, new File(["x"], "c.jpg"));
      expect(ok).toHaveBeenCalledWith("Cover kursus berhasil diubah!");
    });

    it("asyncSetIsCourseChangeCover failure", async () => {
      const err = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {} as any);
      vi.spyOn(courseApi, "postCourseCover").mockRejectedValue(new Error("Gagal"));
      await coursesStore.asyncSetIsCourseChangeCover(1, new File(["x"], "c.jpg"));
      expect(err).toHaveBeenCalledWith("Gagal");
      expect(coursesStore.isCourseChangedCover).toBe(false);
      expect(coursesStore.isCourseChangeCover).toBe(true);
    });

    it("asyncSetIsCourseDelete success", async () => {
      const ok = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {} as any);
      vi.spyOn(courseApi, "deleteCourse").mockResolvedValue("Pesan API" as any);
      await coursesStore.asyncSetIsCourseDelete(1);
      expect(ok).toHaveBeenCalledWith("Pesan API");
      expect(coursesStore.isCourseDeleted).toBe(true);
      expect(coursesStore.isCourseDelete).toBe(true);
    });

    it("asyncSetIsCourseDelete success with default message", async () => {
      const ok = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {} as any);
      vi.spyOn(courseApi, "deleteCourse").mockResolvedValue("" as any);
      await coursesStore.asyncSetIsCourseDelete(1);
      expect(ok).toHaveBeenCalledWith("Kursus berhasil dihapus!");
    });

    it("asyncSetIsCourseDelete failure", async () => {
      const err = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {} as any);
      vi.spyOn(courseApi, "deleteCourse").mockRejectedValue(new Error("Gagal"));
      await coursesStore.asyncSetIsCourseDelete(1);
      expect(err).toHaveBeenCalledWith("Gagal");
      expect(coursesStore.isCourseDeleted).toBe(false);
      expect(coursesStore.isCourseDelete).toBe(true);
    });

    it("asyncSetIsCourseDeleteAll success", async () => {
      const ok = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {} as any);
      vi.spyOn(courseApi, "deleteAllCourses").mockResolvedValue("Pesan API" as any);
      await coursesStore.asyncSetIsCourseDeleteAll();
      expect(ok).toHaveBeenCalledWith("Pesan API");
      expect(coursesStore.isCourseDeletedAll).toBe(true);
      expect(coursesStore.isCourseDeleteAll).toBe(true);
    });

    it("asyncSetIsCourseDeleteAll success with default message", async () => {
      const ok = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {} as any);
      vi.spyOn(courseApi, "deleteAllCourses").mockResolvedValue("" as any);
      await coursesStore.asyncSetIsCourseDeleteAll();
      expect(ok).toHaveBeenCalledWith("Semua kursus berhasil dihapus!");
    });

    it("asyncSetIsCourseDeleteAll failure", async () => {
      const err = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {} as any);
      vi.spyOn(courseApi, "deleteAllCourses").mockRejectedValue(new Error("Gagal"));
      await coursesStore.asyncSetIsCourseDeleteAll();
      expect(err).toHaveBeenCalledWith("Gagal");
      expect(coursesStore.isCourseDeletedAll).toBe(false);
      expect(coursesStore.isCourseDeleteAll).toBe(true);
    });

    it("asyncSetIsCourseJoin success", async () => {
      const ok = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {} as any);
      vi.spyOn(courseApi, "postStudent").mockResolvedValue("Pesan API" as any);
      await coursesStore.asyncSetIsCourseJoin(1);
      expect(ok).toHaveBeenCalledWith("Pesan API");
      expect(coursesStore.isCourseJoined).toBe(true);
      expect(coursesStore.isCourseJoin).toBe(true);
    });

    it("asyncSetIsCourseJoin success with default message", async () => {
      const ok = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {} as any);
      vi.spyOn(courseApi, "postStudent").mockResolvedValue("" as any);
      await coursesStore.asyncSetIsCourseJoin(1);
      expect(ok).toHaveBeenCalledWith("Berhasil bergabung ke kursus!");
    });

    it("asyncSetIsCourseJoin failure", async () => {
      const err = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {} as any);
      vi.spyOn(courseApi, "postStudent").mockRejectedValue(new Error("Gagal"));
      await coursesStore.asyncSetIsCourseJoin(1);
      expect(err).toHaveBeenCalledWith("Gagal");
      expect(coursesStore.isCourseJoined).toBe(false);
      expect(coursesStore.isCourseJoin).toBe(true);
    });

    it("asyncSetIsCourseLeave success", async () => {
      const ok = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {} as any);
      vi.spyOn(courseApi, "deleteStudent").mockResolvedValue("Pesan API" as any);
      await coursesStore.asyncSetIsCourseLeave(1);
      expect(ok).toHaveBeenCalledWith("Pesan API");
      expect(coursesStore.isCourseLeft).toBe(true);
      expect(coursesStore.isCourseLeave).toBe(true);
    });

    it("asyncSetIsCourseLeave success with default message", async () => {
      const ok = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {} as any);
      vi.spyOn(courseApi, "deleteStudent").mockResolvedValue("" as any);
      await coursesStore.asyncSetIsCourseLeave(1);
      expect(ok).toHaveBeenCalledWith("Berhasil keluar dari kursus!");
    });

    it("asyncSetIsCourseLeave failure", async () => {
      const err = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {} as any);
      vi.spyOn(courseApi, "deleteStudent").mockRejectedValue(new Error("Gagal"));
      await coursesStore.asyncSetIsCourseLeave(1);
      expect(err).toHaveBeenCalledWith("Gagal");
      expect(coursesStore.isCourseLeft).toBe(false);
      expect(coursesStore.isCourseLeave).toBe(true);
    });

    it("asyncSetIsCourseRating success", async () => {
      const ok = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {} as any);
      vi.spyOn(courseApi, "putRating").mockResolvedValue("Pesan API" as any);
      await coursesStore.asyncSetIsCourseRating(1, 5, "a");
      expect(ok).toHaveBeenCalledWith("Pesan API");
      expect(coursesStore.isCourseRated).toBe(true);
      expect(coursesStore.isCourseRating).toBe(true);
    });

    it("asyncSetIsCourseRating success with default message", async () => {
      const ok = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {} as any);
      vi.spyOn(courseApi, "putRating").mockResolvedValue("" as any);
      await coursesStore.asyncSetIsCourseRating(1, 5, "a");
      expect(ok).toHaveBeenCalledWith("Rating berhasil disimpan!");
    });

    it("asyncSetIsCourseRating failure", async () => {
      const err = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {} as any);
      vi.spyOn(courseApi, "putRating").mockRejectedValue(new Error("Gagal"));
      await coursesStore.asyncSetIsCourseRating(1, 5, "a");
      expect(err).toHaveBeenCalledWith("Gagal");
      expect(coursesStore.isCourseRated).toBe(false);
      expect(coursesStore.isCourseRating).toBe(true);
    });

    it("asyncSetIsContentAdd success", async () => {
      const ok = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {} as any);
      vi.spyOn(courseApi, "postContent").mockResolvedValue({} as any);
      await coursesStore.asyncSetIsContentAdd(1, "a", "a");
      expect(ok).toHaveBeenCalledWith("Konten berhasil ditambahkan!");
      expect(coursesStore.isContentAdded).toBe(true);
      expect(coursesStore.isContentAdd).toBe(true);
    });

    it("asyncSetIsContentAdd failure", async () => {
      const err = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {} as any);
      vi.spyOn(courseApi, "postContent").mockRejectedValue(new Error("Gagal"));
      await coursesStore.asyncSetIsContentAdd(1, "a", "a");
      expect(err).toHaveBeenCalledWith("Gagal");
      expect(coursesStore.isContentAdded).toBe(false);
      expect(coursesStore.isContentAdd).toBe(true);
    });

    it("asyncSetIsContentChange success", async () => {
      const ok = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {} as any);
      vi.spyOn(courseApi, "putContent").mockResolvedValue("Pesan API" as any);
      await coursesStore.asyncSetIsContentChange(1, "a", "a");
      expect(ok).toHaveBeenCalledWith("Pesan API");
      expect(coursesStore.isContentChanged).toBe(true);
      expect(coursesStore.isContentChange).toBe(true);
    });

    it("asyncSetIsContentChange success with default message", async () => {
      const ok = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {} as any);
      vi.spyOn(courseApi, "putContent").mockResolvedValue("" as any);
      await coursesStore.asyncSetIsContentChange(1, "a", "a");
      expect(ok).toHaveBeenCalledWith("Konten berhasil diubah!");
    });

    it("asyncSetIsContentChange failure", async () => {
      const err = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {} as any);
      vi.spyOn(courseApi, "putContent").mockRejectedValue(new Error("Gagal"));
      await coursesStore.asyncSetIsContentChange(1, "a", "a");
      expect(err).toHaveBeenCalledWith("Gagal");
      expect(coursesStore.isContentChanged).toBe(false);
      expect(coursesStore.isContentChange).toBe(true);
    });

    it("asyncSetIsContentDelete success", async () => {
      const ok = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {} as any);
      vi.spyOn(courseApi, "deleteContent").mockResolvedValue("Pesan API" as any);
      await coursesStore.asyncSetIsContentDelete(1);
      expect(ok).toHaveBeenCalledWith("Pesan API");
      expect(coursesStore.isContentDeleted).toBe(true);
      expect(coursesStore.isContentDelete).toBe(true);
    });

    it("asyncSetIsContentDelete success with default message", async () => {
      const ok = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {} as any);
      vi.spyOn(courseApi, "deleteContent").mockResolvedValue("" as any);
      await coursesStore.asyncSetIsContentDelete(1);
      expect(ok).toHaveBeenCalledWith("Konten berhasil dihapus!");
    });

    it("asyncSetIsContentDelete failure", async () => {
      const err = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {} as any);
      vi.spyOn(courseApi, "deleteContent").mockRejectedValue(new Error("Gagal"));
      await coursesStore.asyncSetIsContentDelete(1);
      expect(err).toHaveBeenCalledWith("Gagal");
      expect(coursesStore.isContentDeleted).toBe(false);
      expect(coursesStore.isContentDelete).toBe(true);
    });

    it("asyncSetIsContentStatusChange success", async () => {
      const ok = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {} as any);
      vi.spyOn(courseApi, "postContentStatus").mockResolvedValue({} as any);
      await coursesStore.asyncSetIsContentStatusChange(1, 1);
      expect(ok).not.toHaveBeenCalled();
      expect(coursesStore.isContentStatusChanged).toBe(true);
      expect(coursesStore.isContentStatusChange).toBe(true);
    });

    it("asyncSetIsContentStatusChange failure", async () => {
      const err = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {} as any);
      vi.spyOn(courseApi, "postContentStatus").mockRejectedValue(new Error("Gagal"));
      await coursesStore.asyncSetIsContentStatusChange(1, 1);
      expect(err).toHaveBeenCalledWith("Gagal");
      expect(coursesStore.isContentStatusChanged).toBe(false);
      expect(coursesStore.isContentStatusChange).toBe(true);
    });

  });
});
