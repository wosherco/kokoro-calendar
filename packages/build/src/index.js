import Calendar from '@kokoro-calendar/core';
import DayGrid from '@kokoro-calendar/day-grid';
import List from '@kokoro-calendar/list';
import TimeGrid from '@kokoro-calendar/time-grid';
import ResourceTimeGrid from '@kokoro-calendar/resource-time-grid';
import ResourceTimeline from '@kokoro-calendar/resource-timeline';
import Interaction from '@kokoro-calendar/interaction';
import '@kokoro-calendar/core/index.css';

export default class extends Calendar {
    constructor(el, options) {
        super({
            target: el,
            props: {
                plugins: [DayGrid, List, TimeGrid, ResourceTimeGrid, ResourceTimeline, Interaction],
                options
            }
        });
    }
}
