<script>
    import {getContext, onMount, tick} from 'svelte';
    import {
        createEventClasses,
        createEventContent,
        height,
        toEventWithLocalDates,
        toViewWithLocalDates,
        setContent,
        repositionEvent,
        resourceBackgroundColor,
        resourceTextColor,
        helperEvent,
        keyEnter,
        task, rect, ancestor, bgEvent,
        isFunction
    } from '@kokoro-calendar/core';

    const {chunk, longChunks} = $props();

    let {displayEventEnd, eventAllUpdated, eventBackgroundColor, eventTextColor, eventClick, eventColor, eventContent,
        eventClassNames, eventDidMount, eventWrapper, eventMouseEnter, eventMouseLeave, resources, theme,
        _view, _intlEventTime, _interaction, _iClasses, _tasks} = getContext('state');

    let el;
    let event = $derived(chunk.event);
    let margin = 1;
    const display = $derived(event.display);

    const style = $derived.by(() => {
        // Class & Style
        let bgColor = event.backgroundColor || resourceBackgroundColor(event, $resources) || $eventBackgroundColor || $eventColor;
        let txtColor = event.textColor || resourceTextColor(event, $resources) || $eventTextColor;
        let style = '';
        if (bgEvent(display)) {
            style = `width:calc(${chunk.days * 100}% + ${(chunk.days - 1)}px);`;
        } else {
            style =
                `width:calc(${chunk.days * 100}% + ${(chunk.days - 1) * 7}px);` +
                `margin-top:${event._margin ?? margin}px;`
            ;
        }
        if (bgColor) {
            style += `background-color:${bgColor};`;
        }
        if (txtColor) {
            style += `color:${txtColor};`;
        }
        style += event.styles.join(';');

        return style;
    })

    const classes = $derived([
        bgEvent(display) ? $theme.bgEvent : $theme.event,
        ...$_iClasses([], event),
        ...createEventClasses($eventClassNames, event, $_view)
    ].join(' '))

    // Content
    const [timeText, content] = $derived(createEventContent(chunk, $displayEventEnd, $eventContent, $theme, $_intlEventTime, $_view));

    onMount(() => {
        if (isFunction($eventDidMount)) {
            $eventDidMount({
                event: toEventWithLocalDates(event),
                timeText,
                el,
                view: toViewWithLocalDates($_view)
            });
        }
    });

    $effect(async() => {
        await tick();
        if (isFunction($eventAllUpdated) && !helperEvent(display)) {
            task(() => $eventAllUpdated({view: toViewWithLocalDates($_view)}), 'eau', _tasks);
        }
    })

    function createHandler(fn, display) {
        return !helperEvent(display) && isFunction(fn)
            ? jsEvent => fn({event: toEventWithLocalDates(event), el, jsEvent, view: toViewWithLocalDates($_view)})
            : undefined;
    }

    function createDragHandler(interaction, resize) {
        return interaction.action
            ? jsEvent => interaction.action.drag(
                event,
                jsEvent,
                resize,
                null,
                rect(el).top - rect(ancestor(el, 1)).top,
                chunk.zeroDuration
            )
            : undefined;
    }

    export function reposition() {
        if (!el) {
            return;
        }
        margin = repositionEvent(chunk, longChunks, height(el));
    }

    // Onclick handler
    const onclick = $derived(createHandler($eventClick, display));

    const SvelteComponent = $derived($_interaction.resizer);
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
{#snippet eventComponent()}
    <article
        bind:this={el}
        class="{classes}"
        {style}
        role="{onclick ? 'button' : undefined}"
        tabindex="{onclick ? 0 : undefined}"
        {onclick}
        onkeydown={onclick && keyEnter(onclick)}
        onmouseenter={createHandler($eventMouseEnter, display)}
        onmouseleave={createHandler($eventMouseLeave, display)}
        onpointerdown={!helperEvent(display) && createDragHandler($_interaction)}
    >
        <SvelteComponent
            start
            {event}
            onpointerdown={createDragHandler($_interaction, ['x', 'start'])}
        />
        <div class="{$theme.eventBody}" use:setContent={content}></div>
        <SvelteComponent
            {event}
            onpointerdown={createDragHandler($_interaction, ['x', 'end'])}
        />
    </article>
{/snippet}

{#if isFunction($eventWrapper)}
    {@render $eventWrapper({
        event,
        timeText,
        view: toViewWithLocalDates($_view),
        children: eventComponent
    })}
{:else}
    {@render eventComponent()}
{/if}