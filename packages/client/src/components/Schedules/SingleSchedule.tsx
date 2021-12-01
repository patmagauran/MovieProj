import React from "react";
import FullCalendar, {
  EventApi,
  DateSelectArg,
  EventClickArg,
  EventContentArg,
  formatDate,
  EventInput,
  render,
  EventSourceFunc,
} from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { INITIAL_EVENTS, createEventId } from "./eventUtils";
import { Paper } from "@mui/material";
import axios from "axios";
import { UserContext } from "../../contexts/UserContext";

interface DemoAppState {
  weekendsVisible: boolean;
  currentEvents: EventApi[];
}

export function Schedule() {
  const [weekendsVisible, setWeekendsVisible] = React.useState(true);
  const [currentEvents, setcurrentEvents] = React.useState<EventApi[]>([]);

  const { userContext, setUserContext } = React.useContext(UserContext);

  const getEventFeed = (
    info: any,
    successCallback: (arg0: any) => any,
    failureCallback: (arg0: any) => any
  ): void => {
    fetch("http://localhost:8080/" + "users/me", {
      method: "GET",
      credentials: "include",
      // Pass authentication token as bearer token in header
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userContext.token}`,
      },
    })
      .then(async (response) => {
        const data = await response.json();

        const events: Array<{ [key: string]: any }> = data.data.data;
        successCallback(
          data.map((eventEl: any) => {
            return {
              title: "Busy",
              start: eventEl.start_time,
              end: eventEl.end_tme,
            };
          })
        );
      })
      .catch((err) => {
        failureCallback(err);
      });
  };

  const handleWeekendsToggle = () => {
    setWeekendsVisible(!weekendsVisible);
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    let title = prompt("Please enter a new title for your event");
    let calendarApi = selectInfo.view.calendar;

    calendarApi.unselect(); // clear date selection

    if (title) {
      calendarApi.addEvent({
        id: createEventId(),
        title,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        allDay: selectInfo.allDay,
      });
    }
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    if (
      window.confirm(
        `Are you sure you want to delete the event '${clickInfo.event.title}'`
      )
    ) {
      clickInfo.event.remove();
    }
  };

  const handleEvents = (events: EventApi[]) => {
    setcurrentEvents(events);
  };
  return (
    <Paper sx={{ height: "100%" }} elevation={1}>
      <div style={{ display: "flex", height: "100%" }}>
        <div style={{ flexGrow: 1 }}>
          <FullCalendar
            height="100%"
            plugins={[timeGridPlugin, interactionPlugin]}
            headerToolbar={false}
            initialDate="2021-11-21"
            nowIndicator={false}
            now="2021-01-01"
            longPressDelay={400}
            views={{
              timeGridWeek: {
                // name of view
                allDaySlot: false,
                nowIndicator: false,
                expandRows: true,
                dayHeaderFormat: { weekday: "short" },
                // other view-specific options here
              },
            }}
            initialView="timeGridWeek"
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            weekends={weekendsVisible}
            events={getEventFeed} // alternatively, use the `events` setting to fetch from a feed
            select={handleDateSelect}
            eventContent={renderEventContent} // custom render function
            eventClick={handleEventClick}
            eventsSet={handleEvents} // called after events are initialized/added/changed/removed
            /* you can update a remote database when these fire:
            eventAdd={function(){}}
            eventChange={function(){}}
            eventRemove={function(){}}
            */
          />
        </div>
      </div>
    </Paper>
  );
}

function renderEventContent(eventContent: EventContentArg) {
  return (
    <>
      <b>{eventContent.timeText}</b>
      <i>{eventContent.event.title}</i>
    </>
  );
}

function renderSidebarEvent(event: EventApi) {
  return (
    <li key={event.id}>
      <b>
        {formatDate(event.start!, {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </b>
      <i>{event.title}</i>
    </li>
  );
}
