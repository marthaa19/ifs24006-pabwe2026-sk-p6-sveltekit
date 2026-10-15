import apiHelper from "../../../helpers/apiHelper";

declare const DELCOM_BASEURL: string;

export interface CourseAuthor {
  name: string;
  photo?: string | null;
}

export interface CourseRating {
  name: string;
  ratings: number;
  comment: string;
}

export interface CourseContent {
  id: number | string;
  course_id: number | string;
  title: string;
  youtube: string;
  created_at?: string;
  updated_at?: string;
  my_status_finished?: boolean | number;
}

export interface Course {
  id: number | string;
  user_id: number | string;
  title: string;
  description: string;
  cover?: string | null;
  created_at?: string;
  updated_at?: string;
  author?: CourseAuthor;
  students?: (number | string)[];
  contents?: CourseContent[];
  total_contents?: number;
  ratings?: CourseRating[];
  avg_ratings?: number;
  my_percentage_finished?: number;
}

const courseApi = (() => {
  const BASE_URL = `${DELCOM_BASEURL}/courses`;

  function _url(path: string): string {
    return BASE_URL + path;
  }

  const JSON_HEADERS = { "Content-Type": "application/json" };

  // Satu pintu untuk semua request: kirim, baca JSON, lempar error jika gagal.
  async function _request(path: string, init: RequestInit, fallbackMessage: string): Promise<any> {
    const response = await apiHelper.fetchData(_url(path), init);
    const result = await response.json();
    if (result.status !== "success" && !result.success) {
      throw new Error(result.message || fallbackMessage);
    }
    return result;
  }

  function _json(method: string, body: unknown): RequestInit {
    return { method, headers: JSON_HEADERS, body: JSON.stringify(body) };
  }

  // ---------- Course ----------
  async function postCourse(title: string, description: string): Promise<any> {
    const result = await _request("", _json("POST", { title, description }), "Gagal menambahkan kursus");
    return result.data;
  }

  async function postCourseCover(courseId: string | number, cover: Blob): Promise<string> {
    const formData = new FormData();
    formData.append("cover", cover, (cover as File).name || "cover.jpg");
    const result = await _request(`/${courseId}/cover`, { method: "POST", body: formData }, "Gagal mengubah cover");
    return result.message;
  }

  async function putCourse(courseId: string | number, title: string, description: string): Promise<string> {
    const result = await _request(`/${courseId}`, _json("PUT", { title, description }), "Gagal mengubah kursus");
    return result.message;
  }

  async function getCourses(isMe: boolean = false): Promise<Course[]> {
    const result = await _request(isMe ? "?is_me=1" : "", { method: "GET" }, "Gagal mengambil data kursus");
    return result.data?.courses || [];
  }

  async function getCourseById(courseId: string | number): Promise<Course> {
    const result = await _request(`/${courseId}`, { method: "GET" }, "Gagal mengambil detail kursus");
    return result.data?.course;
  }

  async function deleteCourse(courseId: string | number): Promise<string> {
    const result = await _request(`/${courseId}`, { method: "DELETE" }, "Gagal menghapus kursus");
    return result.message;
  }

  async function deleteAllCourses(): Promise<string> {
    const result = await _request("", { method: "DELETE" }, "Gagal menghapus semua kursus");
    return result.message;
  }

  // ---------- Peserta & rating ----------
  async function postStudent(courseId: string | number): Promise<string> {
    const result = await _request(`/${courseId}/students`, { method: "POST" }, "Gagal bergabung ke kursus");
    return result.message;
  }

  async function deleteStudent(courseId: string | number): Promise<string> {
    const result = await _request(`/${courseId}/students`, { method: "DELETE" }, "Gagal keluar dari kursus");
    return result.message;
  }

  async function putRating(courseId: string | number, ratings: number, comment: string): Promise<string> {
    const result = await _request(
      `/${courseId}/students/ratings`,
      _json("PUT", { ratings, comment }),
      "Gagal menyimpan rating"
    );
    return result.message;
  }

  // ---------- Konten ----------
  async function postContent(courseId: string | number, title: string, youtube: string): Promise<any> {
    const result = await _request(`/${courseId}/contents`, _json("POST", { title, youtube }), "Gagal menambahkan konten");
    return result.data;
  }

  async function putContent(contentId: string | number, title: string, youtube: string): Promise<string> {
    const result = await _request(`/-/contents/${contentId}`, _json("PUT", { title, youtube }), "Gagal mengubah konten");
    return result.message;
  }

  async function getContentById(contentId: string | number): Promise<CourseContent> {
    const result = await _request(`/-/contents/${contentId}`, { method: "GET" }, "Gagal mengambil detail konten");
    return result.data?.course_content;
  }

  async function deleteContent(contentId: string | number): Promise<string> {
    const result = await _request(`/-/contents/${contentId}`, { method: "DELETE" }, "Gagal menghapus konten");
    return result.message;
  }

  async function postContentStatus(contentId: string | number, status: 0 | 1): Promise<string> {
    const result = await _request(
      `/-/contents/${contentId}/learns`,
      _json("POST", { status }),
      "Gagal mengubah status belajar"
    );
    return result.message;
  }

  return {
    postCourse,
    postCourseCover,
    putCourse,
    getCourses,
    getCourseById,
    deleteCourse,
    deleteAllCourses,
    postStudent,
    deleteStudent,
    putRating,
    postContent,
    putContent,
    getContentById,
    deleteContent,
    postContentStatus,
  };
})();

export default courseApi;
