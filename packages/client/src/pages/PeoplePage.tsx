/** @jsxImportSource @emotion/react */

import React from "react";
import { css } from "@emotion/react";
import { Box, Typography } from "@mui/material";
import CastList from "../components/CastList";
import axios from "axios";
import { UserContext } from "../contexts/UserContext";

const BrowsePageStyle = css`
  h1 {
    font-size: 5rem;
    font-weight: 600;
    text-align: center;
  }
`;

const BrowsePage = () => {
  const { userContext, setUserContext } = React.useContext(UserContext);

  function loadServerRows(page: number, searchText?: string): Promise<any> {
    return new Promise<any>((resolve) => {
      axios
        .get("http://localhost:8080/people", {
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
  return (
    <Box
      height="100%"
      alignContent="center"
      display="flex"
      flexDirection="column"
    >
      <Typography variant="h3" textAlign="center">
        Explore the most famous Actors and Crew!
      </Typography>
      <CastList loadServerRows={loadServerRows} />
    </Box>
  );
};

export default BrowsePage;
