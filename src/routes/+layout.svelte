<script lang="ts">
  import type { Snippet } from "svelte";
  import "../index.css";

  let { children }: { children?: Snippet } = $props();
  // Tahap 3: layout utama masih sederhana.
  // CourseLayout (navbar + sidebar) dipasang pada Tahap 6.
</script>

{@render children?.()}
