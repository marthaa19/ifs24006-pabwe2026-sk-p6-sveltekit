<script lang="ts">
  import type { Snippet } from "svelte";
  import { page } from "$app/state";
  import "../index.css";
  import CourseLayout from "../features/courses/layouts/CourseLayout.svelte";

  let { children }: { children?: Snippet } = $props();

  // Halaman /auth memakai AuthLayout sendiri; halaman lain dibungkus CourseLayout
  // (navbar + sidebar + pengecekan sesi login).
  let isAuthRoute = $derived(page.url.pathname.startsWith("/auth"));
</script>

{#if isAuthRoute}
  {@render children?.()}
{:else}
  <CourseLayout>
    {@render children?.()}
  </CourseLayout>
{/if}
