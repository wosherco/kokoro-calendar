<script>
    import {getContext, onMount, tick} from 'svelte';
    import {
        ancestor,
        createEventClasses,
        createEventContent,
        height,
        max,
        toEventWithLocalDates,
        toViewWithLocalDates,
        setContent,
        repositionEvent,
        resourceBackgroundColor,
        resourceTextColor,
        helperEvent,
        keyEnter,
        task,
        rect,
        bgEvent,
        isFunction
    } from '@kokoro-calendar/core';

    const {chunk, longChunks, inPopup, dates} = $props();

    let {dayMaxEvents, displayEventEnd, eventAllUpdated, eventBackgroundColor, eventTextColor, eventClick, eventColor,
        eventContent, eventClassNames, eventDidMount, eventWrapper, eventMouseEnter, eventMouseLeave, resources, theme,
        _view, _intlEventTime, _interaction, _iClasses, _hiddenEvents, _popupDate, _tasks} = getContext('state');

    let el;
    let margin = 1;
    let hidden = false;

    const event = $derived(chunk.event);
    const display = $derived(event.display);

    const style = $derived.by(() => {
        // Class & Style
        let bgColor = event.backgroundColor || resourceBackgroundColor(event, $resources) || $eventBackgroundColor || $eventColor;
        let txtColor = event.textColor || resourceTextColor(event, $resources) || $eventTextColor;
        let style = '';
        if (bgEvent(display)) {
            style = `width:calc(${chunk.days * 100}% + ${(chunk.days - 1)}px);`;
        } else {
            let marginTop = margin;
            if (event._margin) {
                // Force margin for helper events
                let [_margin, _dates] = event._margin;
                if (chunk.date >= _dates[0] && chunk.date <= _dates.at(-1)) {
                    marginTop = _margin;
                }
            }
            style =
                `width:calc(${chunk.days * 100}% + ${(chunk.days - 1) * 7}px);` +
                `margin-top:${marginTop}px;`;
        }
        if (bgColor) {
            style += `background-color:${bgColor};`;
        }
        if (txtColor) {
            style += `color:${txtColor};`;
        }
        if (hidden) {
            style += 'visibility:hidden;';
        }
        style += event.styles.join(';');

        return style;
    });

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

    $effect(async () => {
        await tick();

        if (isFunction($eventAllUpdated) && !helperEvent(display)) {
            task(() => $eventAllUpdated({view: toViewWithLocalDates($_view)}), 'eau', _tasks);
        }
    });

    function createHandler(fn, display) {
        return !helperEvent(display) && isFunction(fn)
            ? jsEvent => fn({event: toEventWithLocalDates(event), el, jsEvent, view: toViewWithLocalDates($_view)})
            : undefined;
    }

    function createDragHandler(interaction, resize) {
        return interaction.action
            ? jsEvent =>
                $_interaction.action.drag(
                    event,
                    jsEvent,
                    resize,
                    inPopup ? $_popupDate : null,
                    [rect(el).top - rect(ancestor(el, 1)).top, dates],
                    chunk.zeroDuration
                )
            : undefined;
    }

    export function reposition() {
        if (!el) {
            return;
        }
        margin = repositionEvent(chunk, longChunks, height(el));
        if ($dayMaxEvents === true) {
            hide();
        } else {
            hidden = false;
        }
    }

    function hide() {
        let dayEl = ancestor(el, 2);
        let h = height(dayEl) - height(dayEl.firstElementChild) - footHeight(dayEl);
        hidden = chunk.bottom > h;
        let update = false;
        // Hide or show the event throughout all days
        for (let date of chunk.dates) {
            let hiddenEvents = $_hiddenEvents[date.getTime()];
            if (hiddenEvents) {
                let size = hiddenEvents.size;
                if (hidden) {
                    hiddenEvents.add(chunk.event);
                } else {
                    hiddenEvents.delete(chunk.event);
                }
                if (size !== hiddenEvents.size) {
                    update = true;
                }
            }
        }
        if (update) {
            $_hiddenEvents = $_hiddenEvents;
        }
    }

    function footHeight(dayEl) {
        let h = 0;
        for (let i = 0; i < chunk.days; ++i) {
            h = max(h, height(dayEl.lastElementChild));
            dayEl = dayEl.nextElementSibling;
            if (!dayEl) {
                break;
            }
        }
        return h;
    }

    // Onclick handler
    const onclick = $derived(!helperEvent(display) && createHandler($eventClick, display));

    const SvelteComponent = $derived($_interaction.resizer);
</script>

{#snippet eventComponent()}
<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<article
    bind:this={el}
    class="{classes}"
    {style}
    role="{onclick ? 'button' : undefined}"
    tabindex="{onclick ? 0 : undefined}"
    onclick={onclick || undefined}
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
