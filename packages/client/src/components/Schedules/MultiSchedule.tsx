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
  const [users, setUsers] = React.useState<{ [key: number]: string }>({});
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
          let usrTemp: { [key: number]: string } = {};
          response.data.data.forEach((usr: IUser) => {
            usrTemp[usr.id] = usr.full_name;
          });
          resolve(usrTemp);
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
  }, []);

  const handleChange = (event: SelectChangeEvent<typeof selectedUser>) => {
    const {
      target: { value },
    } = event;
    setSelectedUser(
      // On autofill we get a the stringified value.
      typeof value === "string" ? value.split(",") : value
    );
    if (calendarRef != null && calendarRef.current != null) {
      // calendarRef.current.getApi().refetchEvents();
    }
  };
  const getEventFeed = (
    info: any,
    successCallback: (arg0: any) => any,
    failureCallback: (arg0: any) => any
  ): void => {
    let selection: number[] = selectedUser.map((usr: string) => Number(usr));
    fetch("http://localhost:8080/" + "users/allSchedules", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userContext.token}`,
      },
      body: JSON.stringify({
        users: selection,
      }),
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
    <Paper
      sx={{ height: "100%", display: "flex", flexDirection: "column" }}
      elevation={1}
    >
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
              {selected.map((value: any) => (
                <Chip key={value} label={users[Number(value)]} />
              ))}
            </Box>
          )}
          MenuProps={MenuProps}
        >
          {Object.keys(users).map((id: any) => (
            <MenuItem key={id} value={id}>
              {users[Number(id)]}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Box sx={{ height: "100%" }}>
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
      </Box>
    </Paper>
  );
}

function renderEventContent(eventContent: EventContentArg) {
  return (
    <>
      <b>{eventContent.event.title}</b>

      <b>{eventContent.timeText}</b>
    </>
  );
}
