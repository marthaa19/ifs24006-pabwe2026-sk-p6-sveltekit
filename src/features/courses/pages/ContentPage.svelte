<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/state";
  import { ArrowLeft, LoaderCircle, CircleCheck, Circle, TriangleAlert } from "lucide-svelte";
  import { coursesStore } from "../states/coursesStore";
  import { getYoutubeEmbedUrl } from "../../../helpers/youtubeHelper";

  let courseId = $derived(page.params.courseId as string);
  let contentId = $derived(page.params.contentId as string);

  let loading = $state(true);
  let busy = $state(false);

  let content = $derived($coursesStore.content);

  async function reload() {
    await coursesStore.asyncSetContent(contentId);
  }

  onMount(async () => {
    await reload();
    coursesStore.setIsContent(false);
    loading = false;
  });

  // Setelah status diubah: reset bendera, muat ulang konten bila berhasil.
  $effect(() => {
    if ($coursesStore.isContentStatusChange) {
      const ok = $coursesStore.isContentStatusChanged;
      coursesStore.setIsContentStatusChange(false);
      coursesStore.setIsContentStatusChanged(false);
      busy = false;
      if (ok) reload();
    }
  });

  async function toggleStatus(finished: boolean) {
    busy = true;
    await coursesStore.asyncSetIsContentStatusChange(contentId, finished ? 0 : 1);
  }
</script>

<div class="space-y-6 max-w-4xl">
  <a href={`/courses/${courseId}`} data-testid="back-link" class="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-700">
    <ArrowLeft size={16} /> Kembali ke Kursus
  </a>

  {#if loading}
    <div class="py-16 text-center" data-testid="loading-content">
      <LoaderCircle size={36} class="mx-auto text-indigo-600 animate-spin mb-2" />
      <p class="font-medium text-slate-600">Memuat materi...</p>
    </div>
  {:else if !content}
    <div class="py-16 text-center text-slate-500" data-testid="content-not-found">
      <p class="font-bold text-slate-700">Materi tidak ditemukan.</p>
    </div>
  {:else}
    {@const embedUrl = getYoutubeEmbedUrl(content.youtube)}
    {@const finished = Boolean(content.my_status_finished)}
    {@const statusLabel = finished ? "Tandai Belum Selesai" : "Tandai Selesai"}
    <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight" data-testid="content-title">{content.title}</h1>

    <div class="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
      {#if embedUrl}
        <div class="aspect-video bg-black">
          <iframe
            data-testid="youtube-player"
            src={embedUrl}
            title={content.title}
            class="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
        </div>
      {:else}
        <div class="p-10 text-center space-y-3" data-testid="invalid-youtube">
          <TriangleAlert size={36} class="mx-auto text-amber-500" />
          <p class="font-semibold text-slate-700">Tautan YouTube tidak valid.</p>
          <a href={content.youtube} target="_blank" rel="noopener noreferrer" class="text-sm text-indigo-600 hover:underline break-all">{content.youtube}</a>
        </div>
      {/if}
    </div>

    <div class="flex items-center justify-between gap-3 bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5">
      <div class="flex items-center gap-2 text-sm font-semibold" data-testid="status-text">
        {#if finished}
          <CircleCheck size={18} class="text-emerald-600" /><span class="text-emerald-700">Materi selesai dipelajari</span>
        {:else}
          <Circle size={18} class="text-slate-400" /><span class="text-slate-600">Belum selesai</span>
        {/if}
      </div>
      <button
        type="button"
        data-testid="toggle-status-button"
        disabled={busy}
        onclick={() => toggleStatus(finished)}
        class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-sm font-semibold text-white shadow-md shadow-indigo-600/25"
      >
        <span>{statusLabel}</span>
      </button>
    </div>
  {/if}
</div>
