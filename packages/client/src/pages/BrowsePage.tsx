/** @jsxImportSource @emotion/react */

import React from "react";
import { css } from "@emotion/react";
import { Box, Typography } from "@mui/material";
import MovieList from "../components/MovieList";

const BrowsePageStyle = css`
  h1 {
    font-size: 5rem;
    font-weight: 600;
    text-align: center;
  }
`;

const BrowsePage = () => {
  return (
    <Box
      height="100%"
      alignContent="center"
      display="flex"
      flexDirection="column"
    >
      <Typography variant="h3" textAlign="center">
        Explore the Selection!
      </Typography>
      <MovieList />
    </Box>
  );
};

export default BrowsePage;
