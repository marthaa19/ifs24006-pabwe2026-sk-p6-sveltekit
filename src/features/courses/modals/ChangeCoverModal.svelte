<script lang="ts">
  import { X, LoaderCircle } from "lucide-svelte";
  import { coursesStore } from "../states/coursesStore";
  import type { Course } from "../api/courseApi";

  let { course, onClose, onChanged }: { course: Course; onClose: () => void; onChanged: () => void } = $props();

  let file = $state<File | null>(null);
  let loading = $state(false);

  // Hasil ubah sampul dibaca dari bendera di store, lalu bendera direset.
  $effect(() => {
    if ($coursesStore.isCourseChangeCover) {
      const changed = $coursesStore.isCourseChangedCover;
      coursesStore.setIsCourseChangeCover(false);
      coursesStore.setIsCourseChangedCover(false);
      loading = false;
      if (changed) onChanged();
    }
  });

  function onFileChange(event: Event) {
    file = (event.target as HTMLInputElement).files?.[0] ?? null;
  }

  async function onSubmit(event: Event) {
    event.preventDefault();
    loading = true;
    await coursesStore.asyncSetIsCourseChangeCover(course.id, file as File);
  }
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50" data-testid="cover-modal">
  <div class="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8">
    <div class="flex items-start justify-between mb-5">
      <h2 class="text-xl font-extrabold text-slate-900">Ubah Sampul Kursus</h2>
      <button type="button" data-testid="cover-modal-close" onclick={onClose} class="p-2 rounded-xl text-slate-500 hover:bg-slate-100" aria-label="Tutup">
        <X size={18} />
      </button>
    </div>

    <form onsubmit={onSubmit} class="space-y-4" data-testid="cover-form">
      <div>
        <label for="cover-file" class="block text-sm font-semibold text-slate-700 mb-1.5">Berkas gambar</label>
        <input id="cover-file" data-testid="cover-file-input" type="file" accept="image/*" onchange={onFileChange}
          class="w-full text-sm text-slate-600 file:mr-3 file:px-4 file:py-2 file:rounded-xl file:border-0 file:bg-indigo-50 file:text-indigo-700 file:font-semibold" />
      </div>
      <div class="flex justify-end gap-3 pt-2">
        <button type="button" data-testid="cover-modal-cancel" onclick={onClose} class="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50">Batal</button>
        <button type="submit" data-testid="cover-modal-submit" disabled={loading || !file}
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-sm font-semibold text-white shadow-md shadow-indigo-600/25">
          {#if loading}<LoaderCircle size={16} class="animate-spin" />{/if}
          Unggah
        </button>
      </div>
    </form>
  </div>
</div>
