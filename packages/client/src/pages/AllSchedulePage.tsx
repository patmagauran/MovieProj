/** @jsxImportSource @emotion/react */

import React from "react";
import { css } from "@emotion/react";
import { Box, Tab, Tabs, Typography } from "@mui/material";
import MovieList from "../components/MovieList";
import MultiSchedule from "../components/Schedules/MultiSchedule";
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
  return (
    <Box
      height="100%"
      alignContent="center"
      display="flex"
      flexDirection="column"
    >
      <Typography variant="h3" textAlign="center">
        All User's Schedule
      </Typography>

      <Box
        height="100%"
        alignContent="center"
        display="flex"
        flexDirection="column"
      >
        <MultiSchedule />
      </Box>
    </Box>
  );
};

export default SettingsPage;
