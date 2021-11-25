/** @jsxImportSource @emotion/react */

import React from "react";
import { css } from "@emotion/react";
import { Box, Typography } from "@mui/material";
import MovieList from "../components/MovieList";

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
      <Typography textAlign="center">
        WIP Will have a method for the user to select their availability and
        edit their personal information. It will likely be a 7 lists(one for
        each day) that you can add to via a dialog with start/end times
      </Typography>
    </Box>
  );
};

export default SettingsPage;
