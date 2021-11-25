import React from "react";
import { blueGrey, grey } from "@mui/material/colors";

import Routes from "./routes";
import AppLayout from "./layouts/AppLayout";
import { ThemeProvider, createTheme } from "@mui/material/styles";

import ColorModeContext from "./contexts/ColorModeContext";
import CssBaseline from "@mui/material/CssBaseline";

export default function ToggleColorMode() {
  const [mode, setMode] = React.useState<"light" | "dark">("light");
  const colorMode = React.useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
      },
    }),
    []
  );

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === "light"
            ? {}
            : {
                background: {
                  default: "#292929",
                  paper: "#414141",
                },
                text: {
                  primary: grey.A100,
                },
              }),
        },
      }),
    [mode]
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppLayout>
          <Routes />
        </AppLayout>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
