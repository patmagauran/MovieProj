import React from "react";
import { Global, css } from "@emotion/react";

import Header from "./Header";
import Footer from "./Footer";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import LoginPage from "../pages/LoginPage";
import SignUpPage from "../pages/SignUpPage";
import { TabPanel } from "../components/TabPanel";

const AppLayout: React.FC<{}> = ({ children }) => {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
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
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="basic tabs example"
        >
          <Tab label="Sign In" />
          <Tab label="Sign Up" />
        </Tabs>
        <TabPanel value={value} index={0}>
          <LoginPage />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <SignUpPage />
        </TabPanel>
        {children}
      </Box>
    </Box>
  );
};

export default AppLayout;
