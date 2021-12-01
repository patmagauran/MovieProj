/** @jsxImportSource @emotion/react */

import React from "react";
import { css } from "@emotion/react";
import { Box, Tab, Tabs, Typography } from "@mui/material";
import MovieList from "../components/MovieList";
import SingleSchedule from "../components/Schedules/SingleSchedule";
import Profile from "../components/Profile";
import { TabPanel } from "../components/TabPanel";
import LoginPage from "./LoginPage";
import SignUpPage from "./SignUpPage";
const SettingsPageStyle = css`
  h1 {
    font-size: 5rem;
    font-weight: 600;
    text-align: center;
  }
`;

const SettingsPage = () => {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  return (
    <Box
      height="100%"
      alignContent="center"
      display="flex"
      flexDirection="column"
    >
      <Typography variant="h3" textAlign="center">
        Settings
      </Typography>
      <Tabs
        value={value}
        onChange={handleChange}
        aria-label="basic tabs example"
      >
        <Tab label="Profile" />
        <Tab label="Availability" />
      </Tabs>
      <TabPanel value={value} index={0}>
        <Box
          height="100%"
          alignContent="center"
          display="flex"
          flexDirection="column"
        >
          <Profile />
        </Box>
      </TabPanel>
      <TabPanel value={value} index={1}>
        <Box
          height="100%"
          alignContent="center"
          display="flex"
          flexDirection="column"
        >
          <SingleSchedule />
        </Box>
      </TabPanel>
    </Box>
  );
};

export default SettingsPage;
