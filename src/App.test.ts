import { describe, it, expect, vi, beforeEach } from "vitest";
import { createRawSnippet } from "svelte";
import { renderWithProviders } from "./test-utils";
import { mockGoto } from "./setupTests";
import apiHelper from "./helpers/apiHelper";
import { usersStore } from "./features/users/states/usersStore";
import { coursesStore } from "./features/courses/states/coursesStore";

import RootLayout from "./routes/+layout.svelte";
import RootPage from "./routes/+page.svelte";
import ErrorPage from "./routes/+error.svelte";
import AuthRouteLayout from "./routes/auth/+layout.svelte";
import LoginRoute from "./routes/auth/login/+page.svelte";
import RegisterRoute from "./routes/auth/register/+page.svelte";
import UsersRoute from "./routes/users/+page.svelte";
import ProfileRoute from "./routes/profile/+page.svelte";
import CourseDetailRoute from "./routes/courses/[courseId]/+page.svelte";
import ContentRoute from "./routes/courses/[courseId]/contents/[contentId]/+page.svelte";
import { ssr } from "./routes/+layout";

const childSnippet = createRawSnippet(() => ({
  render: () => '<p data-testid="route-child">Isi Halaman</p>',
}));

describe("Routes", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("+layout.ts", () => {
    it("should enable server side rendering", () => {
      expect(ssr).toBe(true);
    });
  });

  describe("+layout.svelte", () => {
    it("should render children directly on auth routes", () => {
      const { wrapper } = renderWithProviders(RootLayout, {
        props: { children: childSnippet },
        route: "/auth/login",
      });

      expect(wrapper.find('[data-testid="route-child"]').exists()).toBe(true);
      expect(wrapper.text()).toContain("Isi Halaman");
      expect(wrapper.text()).not.toContain("Semua Kursus");
    });

    it("should render nothing on auth routes when children is not provided", () => {
      const { wrapper } = renderWithProviders(RootLayout, { route: "/auth/login" });

      expect(wrapper.find('[data-testid="route-child"]').exists()).toBe(false);
    });

    it("should wrap other routes with course layout when user is logged in", () => {
      vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("token");
      vi.spyOn(usersStore, "asyncSetProfile").mockImplementation(() => Promise.resolve());

      const { wrapper } = renderWithProviders(RootLayout, {
        props: { children: childSnippet },
        route: "/users",
        preloadedState: { profile: { id: 1, name: "Test User", email: "test@delcom.org" } },
      });

      expect(wrapper.text()).toContain("Delcom Courses");
      expect(wrapper.text()).toContain("Semua Kursus");
      expect(wrapper.find('[data-testid="route-child"]').exists()).toBe(true);
    });

    it("should redirect to login on other routes when there is no session", () => {
      vi.spyOn(apiHelper, "getAccessToken").mockReturnValue(null);
      mockGoto.mockClear();

      renderWithProviders(RootLayout, {
        props: { children: childSnippet },
        route: "/users",
      });

      expect(mockGoto).toHaveBeenCalledWith("/auth/login");
    });
  });

  describe("+page.svelte", () => {
    it("should render course list home page", () => {
      vi.spyOn(coursesStore, "asyncSetCourses").mockImplementation(() => Promise.resolve());
      const { wrapper } = renderWithProviders(RootPage);

      expect(wrapper.text()).toContain("Semua Kursus");
      expect(coursesStore.asyncSetCourses).toHaveBeenCalledWith(false);
    });
  });

  describe("+error.svelte", () => {
    it("should render not found page", () => {
      const { wrapper } = renderWithProviders(ErrorPage);

      expect(wrapper.text()).toContain("404");
      expect(wrapper.text()).toContain("Halaman Tidak Ditemukan");
    });
  });

  describe("auth routes", () => {
    it("should render auth layout with tabs", () => {
      vi.spyOn(apiHelper, "getAccessToken").mockReturnValue(null);

      const { wrapper } = renderWithProviders(AuthRouteLayout, {
        route: "/auth/login",
      });

      expect(wrapper.text()).toContain("Masuk Akun");
      expect(wrapper.text()).toContain("Daftar Baru");
    });

    it("should render login page", () => {
      const { wrapper } = renderWithProviders(LoginRoute, {
        route: "/auth/login",
      });

      expect(wrapper.find('[data-testid="login-email-input"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="login-password-input"]').exists()).toBe(true);
    });

    it("should render register page", () => {
      const { wrapper } = renderWithProviders(RegisterRoute, {
        route: "/auth/register",
      });

      expect(wrapper.find('[data-testid="register-name-input"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="register-email-input"]').exists()).toBe(true);
    });
  });

  describe("users routes", () => {
    it("should render users page", () => {
      vi.spyOn(usersStore, "asyncSetUsers").mockImplementation(() => Promise.resolve());

      const { wrapper } = renderWithProviders(UsersRoute, {
        route: "/users",
        preloadedState: { users: [] },
      });

      expect(wrapper.text()).toContain("Semua Pengguna");
    });

    it("should render profile page", () => {
      const { wrapper } = renderWithProviders(ProfileRoute, {
        route: "/profile",
        preloadedState: { profile: null },
      });

      expect(wrapper.text()).toContain("Memuat data profil...");
    });
  });

  describe("courses/[courseId]/+page.svelte", () => {
    it("should render the course detail page using the route param", async () => {
      const load = vi.spyOn(coursesStore, "asyncSetCourse").mockImplementation(() => Promise.resolve());
      const { wrapper } = renderWithProviders(CourseDetailRoute, {
        route: "/courses/5",
        params: { courseId: "5" },
      });
      await new Promise((r) => setTimeout(r, 20));
      expect(load).toHaveBeenCalledWith("5");
      expect(wrapper.text()).toContain("Semua Kursus");
    });
  });

  describe("courses/[courseId]/contents/[contentId]/+page.svelte", () => {
    it("should render the content page using the route params", async () => {
      const load = vi.spyOn(coursesStore, "asyncSetContent").mockImplementation(() => Promise.resolve());
      const { wrapper } = renderWithProviders(ContentRoute, {
        route: "/courses/5/contents/11",
        params: { courseId: "5", contentId: "11" },
      });
      await new Promise((r) => setTimeout(r, 20));
      expect(load).toHaveBeenCalledWith("11");
      expect(wrapper.text()).toContain("Kembali ke Kursus");
    });
  });
});
