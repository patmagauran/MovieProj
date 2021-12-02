import React from "react";
import FullCalendar, {
  EventApi,
  DateSelectArg,
  EventClickArg,
  EventContentArg,
  EventAddArg,
  EventChangeArg,
  EventRemoveArg,
} from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { createEventId } from "./eventUtils";
import {
  Box,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import { UserContext } from "../../contexts/UserContext";
import axios from "axios";
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

interface IUser {
  [key: string]: any;
  id: number;
  full_name: string;
}
export default function Schedule() {
  const { userContext, setUserContext } = React.useContext(UserContext);
  const [users, setUsers] = React.useState<IUser[]>([]);
  const calendarRef = React.createRef<FullCalendar>();
  const [selectedUser, setSelectedUser] = React.useState<string[]>([]);
  const loadUsers = async () => {
    return new Promise<any>((resolve) => {
      axios
        .get("http://localhost:8080/users/getUsers", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userContext.token}`,
          },
        })
        .then((response) => {
          resolve(response.data.data);
        })
        .catch((err) => {
          console.log(err);
        });
    });
  };
  React.useEffect(() => {
    let active = true;

    (async () => {
      const newRows = await loadUsers();

      if (!active) {
        return;
      }

      setUsers(newRows);
    })();

    return () => {
      active = false;
    };
  }, [loadUsers]);

  const handleChange = (event: SelectChangeEvent<typeof selectedUser>) => {
    const {
      target: { value },
    } = event;
    setSelectedUser(
      // On autofill we get a the stringified value.
      typeof value === "string" ? value.split(",") : value
    );
    if (calendarRef != null && calendarRef.current != null) {
      calendarRef.current.getApi().refetchEvents();
    }
  };
  const getEventFeed = (
    info: any,
    successCallback: (arg0: any) => any,
    failureCallback: (arg0: any) => any
  ): void => {
    fetch("http://localhost:8080/" + "users/allSchedules", {
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
              title: eventEl.full_name,
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

  return (
    <Paper sx={{ height: "100%" }} elevation={1}>
      <FormControl sx={{ m: 1, width: 300 }}>
        <InputLabel id="demo-multiple-chip-label">Chip</InputLabel>
        <Select
          labelId="demo-multiple-chip-label"
          id="demo-multiple-chip"
          multiple
          value={selectedUser}
          onChange={handleChange}
          input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
          renderValue={(selected) => (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {selected.map((value) => (
                <Chip key={value} label={value} />
              ))}
            </Box>
          )}
          MenuProps={MenuProps}
        >
          {users.map(
            (user: { [key: string]: any; id: number; full_name: string }) => (
              <MenuItem
                key={user.id}
                value={user.id}
                //   style={getStyles(name, personName, theme)}
              >
                {user.full_name}
              </MenuItem>
            )
          )}
        </Select>
      </FormControl>
      <div style={{ display: "flex", height: "100%" }}>
        <div style={{ flexGrow: 1 }}>
          <FullCalendar
            ref={calendarRef}
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
            editable={false}
            selectable={false}
            selectMirror={true}
            dayMaxEvents={true}
            weekends={true}
            events={getEventFeed} // alternatively, use the `events` setting to fetch from a feed
            eventContent={renderEventContent} // custom render function
          />
        </div>
      </div>
    </Paper>
  );
}

function renderEventContent(eventContent: EventContentArg) {
  return (
    <>
      <b>{eventContent.title}</b>

      <b>{eventContent.timeText}</b>
    </>
  );
}
