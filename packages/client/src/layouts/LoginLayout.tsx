import React from "react";
import { Global, css } from "@emotion/react";

import Header from "./Header";
import Footer from "./Footer";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import LoginPage from "../pages/LoginPage";
import SignUpPage from "../pages/SignUpPage";
function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}
interface TabPanelProps {
  children?: React.ReactNode;
  dir?: string;
  index: number;
  value: number;
}
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}
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
          <Tab label="Sign In" {...a11yProps(0)} />
          <Tab label="Sign Up" {...a11yProps(1)} />
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
