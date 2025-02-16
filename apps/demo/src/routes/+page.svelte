<script lang="ts">
  import Calendar from "@kokoro-calendar/core";
  import DayGrid from "@kokoro-calendar/day-grid";
  import CalendarInteraction from "@kokoro-calendar/interaction";
  import TimeGrid from "@kokoro-calendar/time-grid";
	import type { Snippet } from "svelte";

  const initialOptions: Calendar.ComponentProps = {
    plugins: [TimeGrid, DayGrid, CalendarInteraction],
    options: {
      view: "timeGridWeek",
      eventWrapper: eventWrapper,
      events: [
        {
          id: 1,
          start: new Date("2025-02-16"),
          end: new Date("2025-02-16"),
          title: "Event 1",
        },
        {
          id: 2,
          start: new Date("2025-02-17"),
          end: new Date("2025-02-17"),
          title: "Event 2",
        },
      ],
      buttonText: (texts) => ({
        ...texts,
        today: "Today",
        prev: "Previous",
        next: "Next",
      }),
      eventMouseEnter(info) {
        console.log("EVENT MOUSE ENTER", info);
      },
      eventMouseLeave(info) {
        console.log("EVENT MOUSE LEAVE", info);
      },
      eventDidMount(info) {
        console.log("EVENT DID MOUNT", info);
        // Deleting htmlelement
      },
      lazyFetching: false,
      // TODO: Handle this to modify events
      eventResize(info) {
        console.log("RESIZED EVENT", info);
      },
      eventDrop(info) {
        console.log("DROPPED EVENT1", info);
        if (!info.newResource) {
          return;
        }
        // It's not arriving here
        info.event.display = "preview";
        console.log("DROPPED EVENT2", info.event);
      },
    },
  };
</script>

{#snippet eventWrapper({event, timeText, view, children}: {event: Calendar.Event, timeText: string, view: Calendar.View, children: Snippet})}
    <div onclick={() => {
      alert("CLICKED EVENT2");
    }}>
      {@render children()}
    </div>
{/snippet}


<main class="p-4">
  <h1 class="text-3xl font-bold">Kokoro Calendar Demo</h1>
<p><em>No docs currently. Only works with Svelte 5. Git repo: <a href="https://github.com/wosherco/kokoro-calendar" target="_blank" class="text-blue-500 underline">wosherco/kokoro-calendar</a>. Forked from <a href="https://github.com/vkurko/calendar" target="_blank" class="text-blue-500 underline">event-calendar</a></em></p>

<Calendar {...initialOptions} />
</main>