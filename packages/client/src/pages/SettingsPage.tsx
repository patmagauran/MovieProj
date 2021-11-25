/** @jsxImportSource @emotion/react */

import React from "react";
import { css } from "@emotion/react";
import { Box, Typography } from "@mui/material";
import MovieList from "../components/MovieList";
import SingleSchedule from "../components/Schedules/SingleSchedule";
import Profile from "../components/Profile";
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
        Settings
      </Typography>
      <Profile />
      <SingleSchedule />
    </Box>
  );
};

export default SettingsPage;
