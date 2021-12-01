import React, { useCallback, useContext, useEffect } from "react";
import { blueGrey, grey } from "@mui/material/colors";

import Routes from "./routes";
import AppLayout from "./layouts/AppLayout";
import { ThemeProvider, createTheme } from "@mui/material/styles";

import ColorModeContext from "./contexts/ColorModeContext";
import CssBaseline from "@mui/material/CssBaseline";
import LoginLayout from "./layouts/LoginLayout";
import { UserContext } from "./contexts/UserContext";
import Loader from "./Loader";

export default function ToggleColorMode() {
  const [mode, setMode] = React.useState<"light" | "dark">("light");
  const { userContext, setUserContext } = useContext(UserContext);
  const verifyUser = useCallback(() => {
    fetch("http://localhost:8080/" + "users/refreshToken", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    }).then(async (response) => {
      if (response.ok) {
        const data = await response.json();
        setUserContext((oldValues: any) => {
          return { ...oldValues, token: data.token };
        });
      } else {
        setUserContext((oldValues: any) => {
          return { ...oldValues, token: null };
        });
      }
      // call refreshToken every 5 minutes to renew the authentication token.
      setTimeout(verifyUser, 5 * 60 * 1000);
    });
  }, [setUserContext]);

  useEffect(() => {
    verifyUser();
  }, [verifyUser]);
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
        {userContext.token === null ? (
          <LoginLayout />
        ) : userContext.token ? (
          <AppLayout>
            <Routes />
          </AppLayout>
        ) : (
          <Loader />
        )}
        {/* <AppLayout>
          <Routes />
        </AppLayout> */}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
