/** @jsxImportSource @emotion/react */
import { Link as RouterLink } from "react-router-dom";
import { css } from "@emotion/react";
import { BottomNavigation, BottomNavigationAction, Paper } from "@mui/material";
import MovieIcon from "@mui/icons-material/Movie";
import LocalMoviesIcon from "@mui/icons-material/LocalMovies";
import { useLocation, matchPath } from "react-router-dom";
import SettingsIcon from "@mui/icons-material/Settings";
import PeopleIcon from "@mui/icons-material/People";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
const footerStyle = css`
  padding: 40px 16px;
  & > nav {
    margin: 0 auto;
    max-width: 1280px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    svg {
      width: 2rem;
      height: 2rem;
    }
  }
`;

const Footer = () => {
  const paths = ["/recommend", "/browse", "/settings"];
  const location = useLocation();
  const match = paths.findIndex((path) => matchPath(path, location.pathname));
  return (
    <Paper
      sx={{
        marginTop: "10px",
      }}
      elevation={3}
    >
      <BottomNavigation showLabels value={match}>
        <BottomNavigationAction
          label="Group Watchlist"
          icon={<LocalMoviesIcon />}
          component={RouterLink}
          to="/recommend"
        />
        <BottomNavigationAction
          label="Browse"
          icon={<MovieIcon />}
          component={RouterLink}
          to="/browse"
        />
        <BottomNavigationAction
          label="Cast/Crew"
          icon={<PeopleIcon />}
          component={RouterLink}
          to="/people"
        />
        <BottomNavigationAction
          label="Schedule Viewer"
          icon={<CalendarTodayIcon />}
          component={RouterLink}
          to="/allSchedule"
        />
        <BottomNavigationAction
          label="Settings"
          icon={<SettingsIcon />}
          component={RouterLink}
          to="/settings"
        />
      </BottomNavigation>
    </Paper>

    //
    //   <nav>
    //     <div>{new Date().getFullYear()} &copy; your copyright</div>
    //     <div>
    //       <a href="https://github.com/ofnullable/react-spa-template" rel="noopener noreferrer" target="_blank">
    //         <GithubIcon className="github" />
    //       </a>
    //     </div>
    //   </nav>
    // </footer>
  );
};

export default Footer;
