/** @jsxImportSource @emotion/react */

import React from "react";
import { css } from "@emotion/react";
import MovieList from "../components/MovieList";
import { Box, Typography } from "@mui/material";

const RecommendationPageStyle = css`
  h1 {
    font-size: 5rem;
    font-weight: 600;
    text-align: center;
  }
`;

const RecommendationPage = () => {
  return (
    <Box
      height="100%"
      alignContent="center"
      display="flex"
      flexDirection="column"
    >
      <Typography variant="h3" textAlign="center">
        Explore the Recommendations!
      </Typography>
      <MovieList />
    </Box>
  );
};

export default RecommendationPage;
