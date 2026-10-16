<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/state";
  import {
    ArrowLeft, ImageOff, Pencil, ImagePlus, Plus, Trash2, Video, Star, Users,
    UserPlus, UserMinus, LoaderCircle, CircleCheck,
  } from "lucide-svelte";
  import { coursesStore } from "../states/coursesStore";
  import { usersStore } from "../../users/states/usersStore";
  import { showConfirmDialog, formatDate } from "../../../helpers/toolsHelper";
  import ChangeModal from "../modals/ChangeModal.svelte";
  import ChangeCoverModal from "../modals/ChangeCoverModal.svelte";
  import ContentModal from "../modals/ContentModal.svelte";
  import type { CourseContent } from "../api/courseApi";

  let courseId = $derived(page.params.courseId as string);

  let loading = $state(true);
  let busy = $state(false);
  let modal = $state<"change" | "cover" | "content" | null>(null);
  let editingContent = $state<CourseContent | null>(null);
  let ratings = $state(5);
  let comment = $state("");

  let course = $derived($coursesStore.course);
  let profile = $derived($usersStore.profile);

  function authorLabel(c: { author?: { name: string }; created_at?: string }): string {
    return `Oleh ${c.author ? c.author.name : "Tidak diketahui"} · Dibuat ${formatDate(c.created_at)}`;
  }

  async function reload() {
    await coursesStore.asyncSetCourse(courseId);
  }

  onMount(async () => {
    await reload();
    loading = false;
  });

  // Setiap aksi selesai: reset bendera, muat ulang detail bila berhasil.
  $effect(() => {
    if ($coursesStore.isCourseJoin) {
      const ok = $coursesStore.isCourseJoined;
      coursesStore.setIsCourseJoin(false);
      coursesStore.setIsCourseJoined(false);
      busy = false;
      if (ok) reload();
    }
  });

  $effect(() => {
    if ($coursesStore.isCourseLeave) {
      const ok = $coursesStore.isCourseLeft;
      coursesStore.setIsCourseLeave(false);
      coursesStore.setIsCourseLeft(false);
      busy = false;
      if (ok) reload();
    }
  });

  $effect(() => {
    if ($coursesStore.isCourseRating) {
      const ok = $coursesStore.isCourseRated;
      coursesStore.setIsCourseRating(false);
      coursesStore.setIsCourseRated(false);
      busy = false;
      if (ok) {
        comment = "";
        reload();
      }
    }
  });

  $effect(() => {
    if ($coursesStore.isContentDelete) {
      const ok = $coursesStore.isContentDeleted;
      coursesStore.setIsContentDelete(false);
      coursesStore.setIsContentDeleted(false);
      if (ok) reload();
    }
  });

  function closeModal() {
    modal = null;
    editingContent = null;
  }

  function handleSaved() {
    closeModal();
    reload();
  }

  function openAddContent() {
    editingContent = null;
    modal = "content";
  }

  function openEditContent(content: CourseContent) {
    editingContent = content;
    modal = "content";
  }

  async function handleJoin() {
    busy = true;
    await coursesStore.asyncSetIsCourseJoin(courseId);
  }

  async function handleLeave() {
    busy = true;
    await coursesStore.asyncSetIsCourseLeave(courseId);
  }

  async function handleRating(event: Event) {
    event.preventDefault();
    busy = true;
    await coursesStore.asyncSetIsCourseRating(courseId, Number(ratings), comment);
  }

  async function handleDeleteContent(content: CourseContent) {
    const result = await showConfirmDialog(`Hapus konten "${content.title}"?`);
    if (result.isConfirmed) {
      await coursesStore.asyncSetIsContentDelete(content.id);
    }
  }
</script>

<div class="space-y-6">
  <a href="/" data-testid="back-link" class="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-700">
    <ArrowLeft size={16} /> Semua Kursus
  </a>

  {#if loading}
    <div class="py-16 text-center" data-testid="loading-course">
      <LoaderCircle size={36} class="mx-auto text-indigo-600 animate-spin mb-2" />
      <p class="font-medium text-slate-600">Memuat kursus...</p>
    </div>
  {:else if !course}
    <div class="py-16 text-center text-slate-500" data-testid="course-not-found">
      <p class="font-bold text-slate-700">Kursus tidak ditemukan.</p>
    </div>
  {:else}
    {@const owner = profile !== null && String(course.user_id) === String(profile.id)}
    {@const student = profile !== null && (course.students ?? []).map(String).includes(String(profile.id))}
    {@const contents = course.contents ?? []}
    {@const reviews = course.ratings ?? []}

    <section class="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
      {#if course.cover}
        <img src={course.cover} alt={course.title} class="w-full h-56 sm:h-72 object-cover" data-testid="course-cover" />
      {:else}
        <div class="w-full h-56 sm:h-72 bg-slate-100 flex items-center justify-center text-slate-300" data-testid="course-cover-empty">
          <ImageOff size={48} />
        </div>
      {/if}

      <div class="p-6 sm:p-8 space-y-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight" data-testid="course-title">{course.title}</h1>
          <p class="text-sm text-slate-500 mt-1">{authorLabel(course)}</p>
        </div>
        <p class="text-slate-700 leading-relaxed whitespace-pre-line">{course.description}</p>

        <div class="flex flex-wrap items-center gap-4 text-sm text-slate-500">
          <span class="flex items-center gap-1.5"><Video size={16} /><span>{`${contents.length} konten`}</span></span>
          <span class="flex items-center gap-1.5"><Star size={16} class="text-amber-500" /><span>{String(course.avg_ratings ?? 0)}</span></span>
          <span class="flex items-center gap-1.5"><Users size={16} /><span>{`${(course.students ?? []).length} peserta`}</span></span>
          {#if student}
            <span class="flex items-center gap-1.5 text-indigo-700 font-semibold" data-testid="my-progress">
              <CircleCheck size={16} /><span>{`Progres ${course.my_percentage_finished ?? 0}%`}</span>
            </span>
          {/if}
        </div>

        <div class="flex flex-wrap gap-3 pt-2">
          {#if owner}
            <button type="button" data-testid="change-button" onclick={() => (modal = "change")}
              class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              <Pencil size={16} /> Ubah Data
            </button>
            <button type="button" data-testid="cover-button" onclick={() => (modal = "cover")}
              class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              <ImagePlus size={16} /> Ubah Sampul
            </button>
          {:else if student}
            <button type="button" data-testid="leave-button" disabled={busy} onclick={handleLeave}
              class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 disabled:opacity-60 text-sm font-semibold text-red-600">
              <UserMinus size={16} /> Keluar dari Kursus
            </button>
          {:else}
            <button type="button" data-testid="join-button" disabled={busy} onclick={handleJoin}
              class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-sm font-semibold text-white shadow-md shadow-indigo-600/25">
              <UserPlus size={16} /> Gabung Kursus
            </button>
          {/if}
        </div>
      </div>
    </section>

    <section class="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-4">
      <div class="flex items-center justify-between gap-3">
        <h2 class="text-lg font-extrabold text-slate-900">Daftar Konten</h2>
        {#if owner}
          <button type="button" data-testid="add-content-button" onclick={openAddContent}
            class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-sm font-semibold text-white">
            <Plus size={16} /> Tambah Konten
          </button>
        {/if}
      </div>

      <ul class="divide-y divide-slate-100">
        {#each contents as content (content.id)}
          <li class="py-3 flex items-center justify-between gap-3" data-testid={`content-item-${content.id}`}>
            <a href={`/courses/${course.id}/contents/${content.id}`} class="flex items-center gap-3 min-w-0 hover:text-indigo-700">
              <Video size={18} class="shrink-0 text-slate-400" />
              <span class="font-semibold text-slate-800 truncate">{content.title}</span>
              {#if content.my_status_finished}
                <span class="shrink-0 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg" data-testid={`finished-${content.id}`}>Selesai</span>
              {/if}
            </a>
            {#if owner}
              <div class="flex items-center gap-1 shrink-0">
                <button type="button" data-testid={`edit-content-${content.id}`} onclick={() => openEditContent(content)}
                  class="p-2 rounded-xl text-slate-500 hover:bg-slate-100" aria-label="Ubah konten"><Pencil size={16} /></button>
                <button type="button" data-testid={`delete-content-${content.id}`} onclick={() => handleDeleteContent(content)}
                  class="p-2 rounded-xl text-red-500 hover:bg-red-50" aria-label="Hapus konten"><Trash2 size={16} /></button>
              </div>
            {/if}
          </li>
        {:else}
          <li class="py-8 text-center text-slate-400" data-testid="empty-contents">Belum ada konten.</li>
        {/each}
      </ul>
    </section>

    <section class="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-5">
      <h2 class="text-lg font-extrabold text-slate-900">Rating & Ulasan</h2>

      {#if student && !owner}
        <form onsubmit={handleRating} class="space-y-3 p-4 rounded-2xl bg-slate-50" data-testid="rating-form">
          <div class="flex items-center gap-3">
            <label for="rating-value" class="text-sm font-semibold text-slate-700">Rating</label>
            <select id="rating-value" data-testid="rating-select" bind:value={ratings} class="px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white">
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
              <option value={5}>5</option>
            </select>
          </div>
          <textarea data-testid="rating-comment" required rows="2" bind:value={comment} placeholder="Tulis ulasanmu..."
            class="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"></textarea>
          <button type="submit" data-testid="rating-submit" disabled={busy}
            class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-sm font-semibold text-white">Kirim Rating</button>
        </form>
      {/if}

      <ul class="space-y-3">
        {#each reviews as review, i (i)}
          <li class="p-4 rounded-2xl border border-slate-100" data-testid={`review-${i}`}>
            <div class="flex items-center justify-between">
              <span class="font-semibold text-slate-800">{review.name}</span>
              <span class="flex items-center gap-1 text-sm text-slate-600"><Star size={14} class="text-amber-500" /><span>{String(review.ratings)}</span></span>
            </div>
            <p class="text-sm text-slate-600 mt-1">{review.comment}</p>
          </li>
        {:else}
          <li class="py-6 text-center text-slate-400" data-testid="empty-reviews">Belum ada ulasan.</li>
        {/each}
      </ul>
    </section>

    {#if modal === "change"}
      <ChangeModal {course} onClose={closeModal} onChanged={handleSaved} />
    {:else if modal === "cover"}
      <ChangeCoverModal {course} onClose={closeModal} onChanged={handleSaved} />
    {:else if modal === "content"}
      <ContentModal courseId={course.id} content={editingContent} onClose={closeModal} onSaved={handleSaved} />
    {/if}
  {/if}
</div>
