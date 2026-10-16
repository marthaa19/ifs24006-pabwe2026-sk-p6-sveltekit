<script lang="ts">
  import { untrack } from "svelte";
  import { X, LoaderCircle } from "lucide-svelte";
  import { coursesStore } from "../states/coursesStore";
  import type { CourseContent } from "../api/courseApi";

  // Tanpa `content` = mode tambah; dengan `content` = mode ubah.
  let {
    courseId,
    content = null,
    onClose,
    onSaved,
  }: {
    courseId: string | number;
    content?: CourseContent | null;
    onClose: () => void;
    onSaved: () => void;
  } = $props();

  let title = $state(untrack(() => content?.title ?? ""));
  let youtube = $state(untrack(() => content?.youtube ?? ""));
  let loading = $state(false);

  $effect(() => {
    if ($coursesStore.isContentAdd) {
      const added = $coursesStore.isContentAdded;
      coursesStore.setIsContentAdd(false);
      coursesStore.setIsContentAdded(false);
      loading = false;
      if (added) onSaved();
    }
  });

  $effect(() => {
    if ($coursesStore.isContentChange) {
      const changed = $coursesStore.isContentChanged;
      coursesStore.setIsContentChange(false);
      coursesStore.setIsContentChanged(false);
      loading = false;
      if (changed) onSaved();
    }
  });

  async function onSubmit(event: Event) {
    event.preventDefault();
    loading = true;
    if (content) {
      await coursesStore.asyncSetIsContentChange(content.id, title, youtube);
    } else {
      await coursesStore.asyncSetIsContentAdd(courseId, title, youtube);
    }
  }
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50" data-testid="content-modal">
  <div class="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8">
    <div class="flex items-start justify-between mb-5">
      <h2 class="text-xl font-extrabold text-slate-900">{content ? "Ubah Konten" : "Tambah Konten"}</h2>
      <button type="button" data-testid="content-modal-close" onclick={onClose} class="p-2 rounded-xl text-slate-500 hover:bg-slate-100" aria-label="Tutup">
        <X size={18} />
      </button>
    </div>

    <form onsubmit={onSubmit} class="space-y-4" data-testid="content-form">
      <div>
        <label for="content-title" class="block text-sm font-semibold text-slate-700 mb-1.5">Judul konten</label>
        <input id="content-title" data-testid="content-title-input" type="text" required bind:value={title}
          class="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600" />
      </div>
      <div>
        <label for="content-youtube" class="block text-sm font-semibold text-slate-700 mb-1.5">Tautan YouTube</label>
        <input id="content-youtube" data-testid="content-youtube-input" type="text" required bind:value={youtube}
          placeholder="https://www.youtube.com/watch?v=..."
          class="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600" />
      </div>
      <div class="flex justify-end gap-3 pt-2">
        <button type="button" data-testid="content-modal-cancel" onclick={onClose} class="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50">Batal</button>
        <button type="submit" data-testid="content-modal-submit" disabled={loading}
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-sm font-semibold text-white shadow-md shadow-indigo-600/25">
          {#if loading}<LoaderCircle size={16} class="animate-spin" />{/if}
          Simpan
        </button>
      </div>
    </form>
  </div>
</div>
