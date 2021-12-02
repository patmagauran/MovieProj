/** @jsxImportSource @emotion/react */

import React from "react";
import { css } from "@emotion/react";
import MovieList from "../components/MovieList";
import { Box, Typography } from "@mui/material";
import axios from "axios";
import { UserContext } from "../contexts/UserContext";
import { GridValueFormatterParams } from "@mui/x-data-grid";

const RecommendationPageStyle = css`
  h1 {
    font-size: 5rem;
    font-weight: 600;
    text-align: center;
  }
`;

const RecommendationPage = () => {
  const { userContext, setUserContext } = React.useContext(UserContext);

  function loadServerRows(page: number, searchText?: string): Promise<any> {
    return new Promise<any>((resolve) => {
      axios
        .get("http://localhost:8080/movies/userMoviesToSee", {
          params: {
            page: page,
            pageSize: 25,
            searchText: searchText,
          },
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
  }
  const additionalColumns = [
    {
      field: "max_can_see",
      headerName: "# Can See",
      description: "How many people can see it at the same time",
      flex: 1,
    },
  ];
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
      <MovieList
        loadServerRows={loadServerRows}
        additonalColumns={additionalColumns}
      />
    </Box>
  );
};

export default RecommendationPage;
