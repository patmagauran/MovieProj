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
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        color: "text.primary",
        borderRadius: 0,
        p: 3,
      }}
    >
      <Header />
      <Box>{children}</Box>
      <Footer />
    </Box>
  );
};

export default AppLayout;
