<script>
    import {getContext} from 'svelte';
    import {bgEvent, helperEvent} from '@kokoro-calendar/core';

    const {event, start = false, onpointerdown} = $props();

    let {theme, eventDurationEditable, eventResizableFromStart, editable} = getContext('state');

    const resizable = $derived(
        !bgEvent(event.display) &&
        !helperEvent(event.display) &&
        (!start || $eventResizableFromStart) && (
            (event.durationEditable ?? $eventDurationEditable) ||
            (event.editable ?? $editable)
        )
    )
</script>

{#if resizable}
    <div
        class="{$theme.resizer}{start ? ' ' + $theme.start : ''}"
        {onpointerdown}
    ></div>
{/if}