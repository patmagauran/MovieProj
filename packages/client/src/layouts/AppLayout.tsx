import React from "react";
import { Global, css } from "@emotion/react";

import Header from "./Header";
import Footer from "./Footer";

import Box from "@mui/material/Box";

const AppLayout: React.FC<{}> = ({ children }) => {
  return (
    <Box
      sx={{
        width: "100%",

        bgcolor: "background.default",
        color: "text.primary",
        height: "100vh",
        borderRadius: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Header />
      <Box
        sx={{
          maxWidth: "1280px",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignSelf: "center",
        }}
      >
        {children}
      </Box>
      <Footer />
    </Box>
  );
};

export default AppLayout;
