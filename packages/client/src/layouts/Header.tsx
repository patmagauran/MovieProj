/** @jsxImportSource @emotion/react */
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { css } from "@emotion/react";
import { useTheme } from "@mui/material/styles";
import { Paper } from "@mui/material";
import IconButton from "@mui/material/IconButton";

import { ReactComponent as LogoIcon } from "../assets/zap.svg";
import { ReactComponent as SunIcon } from "../assets/sun.svg";
import { ReactComponent as MoonIcon } from "../assets/moon.svg";
import media from "../styles/media";
import { palette } from "../styles/palette";
import ColorModeContext from "../contexts/ColorModeContext";

const headerStyle = (isLight: boolean) => css`
  height: 60px;
  ${media.medium} {
    height: 50px;
  }

  & > nav {
    height: 100%;
    display: flex;
    padding: 0 12px;
    margin: 0 auto;
    align-items: center;
    justify-content: space-between;

    .logo a {
      height: 100%;
      display: flex;
      align-items: center;
      font-size: 2rem;
      font-weight: bold;
      text-decoration: none;
      text-transform: uppercase;

      svg {
        width: 2rem;
        height: 2rem;
        margin-right: 0.5rem;
      }
    }

    svg {
      color: ${isLight ? "inherit" : palette.yellow[4]};
      fill: ${isLight ? palette.yellow[6] : palette.yellow[4]};
    }

    svg.theme {
      cursor: pointer;
      display: flex;
      user-select: none;
    }
  }
`;

const Header = () => {
  const { pathname } = useLocation();
  const colorMode = React.useContext(ColorModeContext);
  const theme = useTheme();
  const isLight = theme.palette.mode === "light";
  return (
    <Paper elevation={3}>
      <header css={[headerStyle(isLight)]}>
        <nav>
          <div className="logo">
            <Link to="/" replace={pathname === "/"}>
              <LogoIcon />
              Movie Finder
            </Link>
          </div>
          <div>
            <IconButton
              sx={{ ml: 1 }}
              onClick={colorMode.toggleColorMode}
              color="inherit"
            >
              {theme.palette.mode === "dark" ? <MoonIcon /> : <SunIcon />}
            </IconButton>
          </div>
        </nav>
      </header>
    </Paper>
  );
};

export default Header;
