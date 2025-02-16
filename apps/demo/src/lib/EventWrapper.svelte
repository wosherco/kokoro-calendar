<script lang="ts">
  import type Calendar from "@kokoro-calendar/core";
	import { onMount } from "svelte";

  const { event, timeText, view, children }: Calendar.EventWrapperProps = $props();
</script>

<div onclick={() => {
  alert("CLICKED EVENT2");
}}>
  {@render children()}
</div>
