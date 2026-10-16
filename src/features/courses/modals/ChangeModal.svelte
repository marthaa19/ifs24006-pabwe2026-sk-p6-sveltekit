<script lang="ts">
  import { untrack } from "svelte";
  import { X, LoaderCircle } from "lucide-svelte";
  import { coursesStore } from "../states/coursesStore";
  import type { Course } from "../api/courseApi";

  let { course, onClose, onChanged }: { course: Course; onClose: () => void; onChanged: () => void } = $props();

  let title = $state(untrack(() => course.title));
  let description = $state(untrack(() => course.description));
  let loading = $state(false);

  // Hasil ubah kursus dibaca dari bendera di store, lalu bendera direset.
  $effect(() => {
    if ($coursesStore.isCourseChange) {
      const changed = $coursesStore.isCourseChanged;
      coursesStore.setIsCourseChange(false);
      coursesStore.setIsCourseChanged(false);
      loading = false;
      if (changed) onChanged();
    }
  });

  async function onSubmit(event: Event) {
    event.preventDefault();
    loading = true;
    await coursesStore.asyncSetIsCourseChange(course.id, title, description);
  }
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50" data-testid="change-modal">
  <div class="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8">
    <div class="flex items-start justify-between mb-5">
      <h2 class="text-xl font-extrabold text-slate-900">Ubah Data Kursus</h2>
      <button type="button" data-testid="change-modal-close" onclick={onClose} class="p-2 rounded-xl text-slate-500 hover:bg-slate-100" aria-label="Tutup">
        <X size={18} />
      </button>
    </div>

    <form onsubmit={onSubmit} class="space-y-4" data-testid="change-form">
      <div>
        <label for="change-title" class="block text-sm font-semibold text-slate-700 mb-1.5">Judul</label>
        <input id="change-title" data-testid="change-title-input" type="text" required bind:value={title}
          class="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600" />
      </div>
      <div>
        <label for="change-description" class="block text-sm font-semibold text-slate-700 mb-1.5">Deskripsi</label>
        <textarea id="change-description" data-testid="change-description-input" required rows="4" bind:value={description}
          class="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"></textarea>
      </div>
      <div class="flex justify-end gap-3 pt-2">
        <button type="button" data-testid="change-modal-cancel" onclick={onClose} class="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50">Batal</button>
        <button type="submit" data-testid="change-modal-submit" disabled={loading}
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-sm font-semibold text-white shadow-md shadow-indigo-600/25">
          {#if loading}<LoaderCircle size={16} class="animate-spin" />{/if}
          Simpan
        </button>
      </div>
    </form>
  </div>
</div>
