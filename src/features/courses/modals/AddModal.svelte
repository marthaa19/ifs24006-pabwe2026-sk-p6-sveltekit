<script lang="ts">
  import { X, LoaderCircle } from "lucide-svelte";
  import { coursesStore } from "../states/coursesStore";

  let { onClose, onAdded }: { onClose: () => void; onAdded: () => void } = $props();

  let title = $state("");
  let description = $state("");
  let loading = $state(false);

  // Hasil tambah kursus dibaca dari bendera di store, lalu bendera direset.
  $effect(() => {
    if ($coursesStore.isCourseAdd) {
      const added = $coursesStore.isCourseAdded;
      coursesStore.setIsCourseAdd(false);
      coursesStore.setIsCourseAdded(false);
      loading = false;
      if (added) onAdded();
    }
  });

  async function onSubmit(event: Event) {
    event.preventDefault();
    loading = true;
    await coursesStore.asyncSetIsCourseAdd(title, description);
  }
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50" data-testid="add-modal">
  <div class="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8">
    <div class="flex items-start justify-between mb-5">
      <div>
        <h2 class="text-xl font-extrabold text-slate-900">Tambah Kursus</h2>
        <p class="text-sm text-slate-500 mt-0.5">Isi judul dan deskripsi kursus baru.</p>
      </div>
      <button type="button" data-testid="add-modal-close" onclick={onClose} class="p-2 rounded-xl text-slate-500 hover:bg-slate-100" aria-label="Tutup">
        <X size={18} />
      </button>
    </div>

    <form onsubmit={onSubmit} class="space-y-4" data-testid="add-form">
      <div>
        <label for="course-title" class="block text-sm font-semibold text-slate-700 mb-1.5">Judul</label>
        <input
          id="course-title"
          data-testid="course-title-input"
          type="text"
          required
          bind:value={title}
          placeholder="Contoh: Pemrograman Web dengan SvelteKit"
          class="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
        />
      </div>
      <div>
        <label for="course-description" class="block text-sm font-semibold text-slate-700 mb-1.5">Deskripsi</label>
        <textarea
          id="course-description"
          data-testid="course-description-input"
          required
          rows="4"
          bind:value={description}
          placeholder="Jelaskan isi kursus ini..."
          class="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
        ></textarea>
      </div>
      <div class="flex justify-end gap-3 pt-2">
        <button type="button" data-testid="add-modal-cancel" onclick={onClose} class="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          Batal
        </button>
        <button
          type="submit"
          data-testid="add-modal-submit"
          disabled={loading}
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-sm font-semibold text-white shadow-md shadow-indigo-600/25"
        >
          {#if loading}<LoaderCircle size={16} class="animate-spin" />{/if}
          Simpan
        </button>
      </div>
    </form>
  </div>
</div>
