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
  EventAddArg,
  EventChangeArg,
  EventRemoveArg,
} from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { INITIAL_EVENTS, createEventId } from "./eventUtils";
import { Paper } from "@mui/material";
import axios from "axios";
import { UserContext } from "../../contexts/UserContext";
import { resolvePtr } from "dns";

export default function Schedule() {
  const [weekendsVisible, setWeekendsVisible] = React.useState(true);
  const [currentEvents, setcurrentEvents] = React.useState<EventApi[]>([]);

  const { userContext, setUserContext } = React.useContext(UserContext);

  const getEventFeed = (
    info: any,
    successCallback: (arg0: any) => any,
    failureCallback: (arg0: any) => any
  ): void => {
    fetch("http://localhost:8080/" + "users/schedule", {
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

        const events: Array<{ [key: string]: any }> = data.data;
        successCallback(
          events.map((eventEl: any) => {
            return {
              title: "Busy",
              start: eventEl.start_time,
              end: eventEl.end_time,
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
    let calendarApi = selectInfo.view.calendar;

    calendarApi.unselect(); // clear date selection

    calendarApi.addEvent({
      id: createEventId(),
      title: "busy",
      start: selectInfo.startStr,
      end: selectInfo.endStr,
      allDay: selectInfo.allDay,
    });
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    clickInfo.event.remove();
  };

  const addEvent = (addInfo: EventAddArg) => {
    fetch("http://localhost:8080/" + "users/schedule", {
      method: "POST",
      credentials: "include",
      // Pass authentication token as bearer token in header
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userContext.token}`,
      },
      body: JSON.stringify({
        start_time: addInfo.event.start,
        end_time: addInfo.event.end,
      }),
    })
      .then(async (response) => {
        //Possibly have a loading symbol / checkmark to signify saving of calendar
      })
      .catch((err) => {
        addInfo.revert();
      });
  };

  const removeEvent = (removeInfo: EventRemoveArg) => {
    fetch("http://localhost:8080/" + "users/schedule/delete", {
      method: "POST",
      credentials: "include",
      // Pass authentication token as bearer token in header
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userContext.token}`,
      },
      body: JSON.stringify({
        start_time: removeInfo.event.start,
        end_time: removeInfo.event.end,
      }),
    })
      .then(async (response) => {
        //Possibly have a loading symbol / checkmark to signify saving of calendar
      })
      .catch((err) => {
        removeInfo.revert();
      });
  };
  const updateEvent = (changeInfo: EventChangeArg) => {
    fetch("http://localhost:8080/" + "users/schedule", {
      method: "PUT",
      credentials: "include",
      // Pass authentication token as bearer token in header
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userContext.token}`,
      },
      body: JSON.stringify({
        old_start_time: changeInfo.oldEvent.start,
        old_end_time: changeInfo.oldEvent.end,
        start_time: changeInfo.event.start,
        end_time: changeInfo.event.end,
      }),
    })
      .then(async (response) => {
        //Possibly have a loading symbol / checkmark to signify saving of calendar
      })
      .catch((err) => {
        changeInfo.revert();
      });
  };

  return (
    <Paper sx={{ height: "100%" }} elevation={1}>
      <div style={{ display: "flex", height: "100%" }}>
        <div style={{ flexGrow: 1 }}>
          <FullCalendar
            height="100%"
            plugins={[timeGridPlugin, interactionPlugin]}
            headerToolbar={false}
            initialDate={new Date(2021, 10, 18)}
            nowIndicator={false}
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
            //     eventsSet={handleEvents} // called after events are initialized/added/changed/removed
            eventAdd={addEvent}
            eventChange={updateEvent}
            eventRemove={removeEvent}
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
    </>
  );
}
