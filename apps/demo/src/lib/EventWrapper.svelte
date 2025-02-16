<script lang="ts">
  import type Calendar from "@kokoro-calendar/core";
	import { onMount } from "svelte";

  const { event, timeText, view, children }: Calendar.EventWrapperProps = $props();
</script>

<div class="border border-red-500 w-full" onclick={() => {
  alert("CLICKED EVENT2");
}}>
  {@render children()}
</div>
