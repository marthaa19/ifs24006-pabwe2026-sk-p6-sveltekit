<script lang="ts">
  import { onMount } from "svelte";
  import { Plus, Search, Trash2, Video, Star, ImageOff, LoaderCircle, BookOpen } from "lucide-svelte";
  import { coursesStore } from "../states/coursesStore";
  import { usersStore } from "../../users/states/usersStore";
  import { showConfirmDialog } from "../../../helpers/toolsHelper";
  import AddModal from "../modals/AddModal.svelte";
  import type { Course } from "../api/courseApi";

  let search = $state("");
  let onlyMine = $state(false);
  let loading = $state(false);
  let showAdd = $state(false);

  let profile = $derived($usersStore.profile);
  let courses = $derived($coursesStore.courses);
  let filtered = $derived(
    courses
      .filter((c: Course) => {
        const q = search.trim().toLowerCase();
        return c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q);
      })
      .map((c: Course) => ({
        ...c,
        contentsLabel: `${c.total_contents ?? 0} konten`,
        ratingLabel: String(c.avg_ratings ?? 0),
      }))
  );
  let totalLabel = $derived(`Total: ${filtered.length} Kursus`);

  async function loadCourses() {
    loading = true;
    await coursesStore.asyncSetCourses(onlyMine);
    loading = false;
  }

  onMount(loadCourses);

  // Setelah hapus selesai: reset bendera, muat ulang daftar bila berhasil.
  $effect(() => {
    if ($coursesStore.isCourseDelete) {
      const deleted = $coursesStore.isCourseDeleted;
      coursesStore.setIsCourseDelete(false);
      coursesStore.setIsCourseDeleted(false);
      if (deleted) loadCourses();
    }
  });

  async function handleDelete(course: Course) {
    const result = await showConfirmDialog(`Hapus kursus "${course.title}"?`);
    if (result.isConfirmed) {
      await coursesStore.asyncSetIsCourseDelete(course.id);
    }
  }

  function handleAdded() {
    showAdd = false;
    loadCourses();
  }
</script>

<div class="space-y-6">
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div>
      <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Semua Kursus</h1>
      <p class="text-sm text-slate-500 mt-1">Jelajahi kursus, bergabung, atau buat kursus sendiri.</p>
    </div>
    <button
      type="button"
      data-testid="add-course-button"
      onclick={() => (showAdd = true)}
      class="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-sm font-semibold text-white shadow-md shadow-indigo-600/25"
    >
      <Plus size={16} /> Tambah Kursus
    </button>
  </div>

  <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
    <div class="relative flex-1 max-w-md">
      <Search size={18} class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        type="text"
        data-testid="search-course-input"
        bind:value={search}
        placeholder="Cari kursus berdasarkan judul atau deskripsi..."
        class="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
      />
    </div>
    <label class="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
      <input type="checkbox" data-testid="only-mine-checkbox" bind:checked={onlyMine} onchange={loadCourses} class="rounded border-slate-300 text-indigo-600" />
      Kursus saya
    </label>
    <span class="text-xs font-semibold text-slate-700 px-3 py-1 bg-slate-100 rounded-lg sm:ml-auto">{totalLabel}</span>
  </div>

  {#if loading && filtered.length === 0}
    <div class="py-16 text-center text-slate-400" data-testid="loading-courses">
      <LoaderCircle size={36} class="mx-auto text-indigo-600 animate-spin mb-2" />
      <p class="font-medium text-slate-600">Memuat kursus...</p>
    </div>
  {:else if filtered.length === 0}
    <div class="py-16 text-center text-slate-400" data-testid="empty-courses">
      <BookOpen size={40} class="mx-auto text-slate-300 mb-2" />
      <p class="font-medium">Tidak ada kursus ditemukan.</p>
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {#each filtered as course (course.id)}
        <article data-testid={`course-card-${course.id}`} class="bg-white rounded-2xl border border-slate-200/80 overflow-hidden hover:border-indigo-300 hover:shadow-md transition-all flex flex-col">
          <a href={`/courses/${course.id}`} class="block">
            {#if course.cover}
              <img src={course.cover} alt={course.title} class="w-full h-40 object-cover" />
            {:else}
              <div class="w-full h-40 bg-slate-100 flex items-center justify-center text-slate-300">
                <ImageOff size={32} />
              </div>
            {/if}
          </a>
          <div class="p-5 flex flex-col flex-1 gap-3">
            <div>
              <a href={`/courses/${course.id}`} class="font-bold text-slate-900 hover:text-indigo-700 line-clamp-1">{course.title}</a>
              <p class="text-sm text-slate-500 line-clamp-2 mt-1">{course.description}</p>
            </div>
            <div class="mt-auto flex items-center justify-between text-xs text-slate-500">
              <span class="flex items-center gap-1"><Video size={14} /><span>{course.contentsLabel}</span></span>
              <span class="flex items-center gap-1"><Star size={14} class="text-amber-500" /><span>{course.ratingLabel}</span></span>
            </div>
            {#if profile && String(course.user_id) === String(profile.id)}
              <button
                type="button"
                data-testid={`delete-course-${course.id}`}
                onclick={() => handleDelete(course)}
                class="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100"
              >
                <Trash2 size={14} /> Hapus
              </button>
            {/if}
          </div>
        </article>
      {/each}
    </div>
  {/if}
</div>

{#if showAdd}
  <AddModal onClose={() => (showAdd = false)} onAdded={handleAdded} />
{/if}
