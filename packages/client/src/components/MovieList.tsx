import React, { Suspense } from "react";
import axios from "axios";
import {
  DataGrid,
  GridRowsProp,
  GridColDef,
  GridToolbar,
  GridActionsCellItem,
  GridRowId,
  GridValueOptionsParams,
  GridRowParams,
  GridValueFormatterParams,
  MuiEvent,
} from "@mui/x-data-grid";
import {
  Box,
  Container,
  LinearProgress,
  Link,
  Paper,
  Tooltip,
  Alert,
  Typography,
  Snackbar,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useGridApiContext, useGridState } from "@mui/x-data-grid";
import Pagination from "@mui/material/Pagination";
import WatchLaterIcon from "@mui/icons-material/WatchLater";
import ThumbsUpDownIcon from "@mui/icons-material/ThumbsUpDown";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { UserContext } from "../contexts/UserContext";
import { useImage } from "react-image";
import ReactPlayer from "react-player";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import CloseIcon from "@mui/icons-material/Close";

const useStyles = makeStyles({
  root: {
    display: "flex",
  },
});

function CustomPagination() {
  const apiRef = useGridApiContext();
  const [state] = useGridState(apiRef);
  const classes = useStyles();

  return (
    <Pagination
      className={classes.root}
      color="primary"
      count={state.pagination.pageCount}
      page={state.pagination.page + 1}
      onChange={(event, value) => apiRef.current.setPage(value - 1)}
    />
  );
}

interface QuickSearchToolbarProps {
  clearSearch: () => void;
  onChange: () => void;
  value: string;
}

function QuickSearchToolbar(props: QuickSearchToolbarProps) {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <TextField
        variant="standard"
        value={props.value}
        onChange={props.onChange}
        placeholder="Search…"
        InputProps={{
          startAdornment: <SearchIcon fontSize="small" />,
          endAdornment: (
            <IconButton
              title="Clear"
              aria-label="Clear"
              size="small"
              style={{ visibility: props.value ? "visible" : "hidden" }}
              onClick={props.clearSearch}
            >
              <ClearIcon fontSize="small" />
            </IconButton>
          ),
        }}
      />
    </div>
  );
}

function PosterImageLoader(posterLink: any) {
  const { src } = useImage({
    srcList: [
      posterLink.posterLink as string,
      "https://1080motion.com/wp-content/uploads/2018/06/NoImageFound.jpg.png",
    ],
  });

  return (
    <img
      width="300px"
      height="450px"
      style={{ objectFit: "contain" }}
      src={src}
    />
  );
}

interface movieType {
  [key: string]: any;
}

export default function MovieList({
  loadServerRows,
  additonalColumns = [],
}: {
  [key: string]: any;
  loadServerRows: (page: number, searchText?: string) => Promise<any>;
  additonalColumns?: Array<any>;
}) {
  //  const [rows, setRows] = React.useState(sampleData);
  const [page, setPage] = React.useState(0);
  const [rows, setRows] = React.useState<GridRowsProp>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [searchText, setSearchText] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [currentMovie, setCurrentMovie] = React.useState<movieType>({});
  const [movieLoading, setMovieLoading] = React.useState<boolean>(false);
  const { userContext, setUserContext } = React.useContext(UserContext);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");
  const [snackbarMessage, setSnackbarMessage] = React.useState("");

  const [snackbarOpen, setSnackbarOpen] = React.useState(false);

  const handleSnackbarOpen = () => {
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = (
    event: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setSnackbarOpen(false);
    setSnackbarMessage("");
  };

  const handleClickOpen = (id: number) => {
    setMovieLoading(true);
    axios
      .get("http://localhost:8080/movies/" + id)
      .then((response) => {
        setCurrentMovie(response.data.data[0]);
        setMovieLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setMovieLoading(false);
      });

    setOpen(true);
  };

  const handleClose = () => {
    setCurrentMovie({});
    setOpen(false);
  };
  const requestSearch = (searchValue: string) => {
    setSearchText(searchValue);
    // //  const searchRegex = new RegExp(escapeRegExp(searchValue), "i");
    //   const filteredRows = data.rows.filter((row: any) => {
    //     return Object.keys(row).some((field: any) => {
    //       return searchRegex.test(row[field].toString());
    //     });
    //   });
    //   setRows(filteredRows);
  };
  React.useEffect(() => {
    let active = true;

    (async () => {
      setLoading(true);
      const newRows = await loadServerRows(page, searchText);

      if (!active) {
        return;
      }

      setRows(newRows);
      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [searchText]);
  React.useEffect(() => {
    let active = true;

    (async () => {
      setLoading(true);
      const newRows = await loadServerRows(page);

      if (!active) {
        return;
      }

      setRows(newRows);
      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [page]);
  const AddMovieToWatchlist = React.useCallback(
    (old_row: any) => () => {
      const alreadyWants = old_row.wants_to_see;
      fetch("http://localhost:8080/" + "movies/wantSeeMovie/" + old_row.id, {
        method: alreadyWants ? "DELETE" : "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userContext.token}`,
        },
      })
        .then(async (response) => {
          if (!response.ok) {
            console.log("error");
          } else {
            setRows((prevRows) => {
              return prevRows.map((row) => {
                return row.id === old_row.id
                  ? { ...row, wants_to_see: !row.wants_to_see }
                  : row;
              });
            });
          }
        })
        .catch((error) => {});
    },
    []
  );

  const SeenMovie = React.useCallback(
    (old_row: any, dislike = false) =>
      () => {
        const alreadySeen = old_row.has_seen_liked || old_row.has_seen_disliked;
        const alreadyChecked =
          (old_row.has_seen_liked && dislike) ||
          (old_row.has_seen_disliked && !dislike);
        if (alreadyChecked) {
          setSnackbarOpen(true);
          setSnackbarMessage("You can't both Like & Dislike a movie!");
        } else {
          fetch("http://localhost:8080/" + "movies/seenMovie/" + old_row.id, {
            method: alreadySeen ? "DELETE" : "PUT",
            credentials: "include",
            body: JSON.stringify({ dislike: dislike }),
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${userContext.token}`,
            },
          })
            .then(async (response) => {
              if (!response.ok) {
              } else {
                setRows((prevRows) =>
                  prevRows.map((row) =>
                    row.id === old_row.id
                      ? {
                          ...row,
                          has_seen_liked: !row.has_seen_liked && !dislike,
                          has_seen_disliked: !row.has_seen_disliked && dislike,
                        }
                      : row
                  )
                );
              }
            })
            .catch((error) => {});
        }
      },
    []
  );
  const action = (
    <React.Fragment>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleSnackbarClose}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </React.Fragment>
  );

  const columns = React.useMemo(
    () => [
      {
        field: "english_title",
        headerName: "English Title",
        flex: 1,
        renderCell: (params: any) => (
          <Tooltip title={params.row.english_title}>
            <Box
              sx={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {params.row.english_title}
            </Box>
          </Tooltip>
        ),
      },
      {
        field: "genres",
        headerName: "Genres",
        flex: 1,

        renderCell: (params: any) => (
          <Tooltip title={params.row.genres}>
            <Box
              sx={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {params.row.genres}
            </Box>
          </Tooltip>
        ),
      },
      { field: "imdb_rating", headerName: "IMDB Rating", flex: 1 },

      {
        field: "release_year",
        headerName: "Release Year",
        flex: 1,
        valueFormatter: (params: GridValueFormatterParams) => {
          const asDate = new Date(params.value as string);
          const valueFormatted = asDate.getFullYear();
          return `${valueFormatted}`;
        },
      },
      {
        field: "runtime",
        headerName: "Runtime",
        flex: 1,
        valueFormatter: (params: GridValueFormatterParams) => {
          const vminutes = params.value as number;
          var hours = Math.floor(vminutes / 60);
          var minutes = vminutes % 60;

          //const asDate = new Date(params.value as number);
          // const valueFormatted = asDate.getFullYear();
          return `${hours}h ${minutes}m`;
        },
      },
      ...additonalColumns,
      {
        field: "actions",
        type: "actions",
        width: 100,
        getActions: (params: GridRowParams) => [
          <GridActionsCellItem
            icon={
              <WatchLaterIcon
                color={params.row.wants_to_see ? "primary" : "inherit"}
              />
            }
            label="Watch Later"
            onClick={AddMovieToWatchlist(params.row)}
          />,
          <GridActionsCellItem
            icon={
              <ThumbUpIcon
                color={params.row.has_seen_liked ? "primary" : "inherit"}
              />
            }
            label="Seen & Liked"
            onClick={SeenMovie(params.row, false)}
          />,
          <GridActionsCellItem
            icon={
              <ThumbDownIcon
                color={params.row.has_seen_disliked ? "primary" : "inherit"}
              />
            }
            label="Seen & Disliked"
            onClick={SeenMovie(params.row, true)}
          />,
        ],
      },
    ],
    [AddMovieToWatchlist, SeenMovie]
  );
  const formSubmitHandler = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    setIsSubmitting(true);
    setError("");

    const genericErrorMessage = "Something went wrong! Please try again later.";

    fetch("http://localhost:8080/" + "movies/" + data.get("id"), {
      method: "put",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userContext.token}`,
      },
      body: JSON.stringify({
        preview_link: data.get("preview_link"),
        poster_link: data.get("poster_link"),
        description: data.get("description"),
        language: data.get("language"),
      }),
    })
      .then(async (response) => {
        if (!response.ok) {
          if (response.status === 400) {
            setError("Please fill all the fields correctly!");
          } else if (response.status === 401) {
            setError("Invalid email and password combination.");
          } else if (response.status === 500) {
            console.log(response);
            const data = await response.json();
            if (data.message) setError(data.message || genericErrorMessage);
          } else {
            setError(genericErrorMessage);
          }
          setIsSubmitting(false);
        } else {
          setIsSubmitting(false);
        }
      })
      .catch((error) => {
        setIsSubmitting(false);
        setError(genericErrorMessage);
      });
  };

  return (
    <Paper sx={{ height: "100%" }} elevation={4}>
      <div style={{ display: "flex", height: "100%" }}>
        <div style={{ flexGrow: 1 }}>
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={25}
            rowsPerPageOptions={[25]}
            rowCount={1000}
            paginationMode="server"
            onPageChange={(newPage) => setPage(newPage)}
            loading={loading}
            components={{
              Toolbar: QuickSearchToolbar,
            }}
            onRowDoubleClick={(params, event) => {
              event.defaultMuiPrevented = true;
              console.log(params.id + "Was clicked");
              handleClickOpen(params.row.id);
            }}
            componentsProps={{
              toolbar: {
                value: searchText,
                onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
                  requestSearch(event.target.value),
                clearSearch: () => requestSearch(""),
              },
            }}
          />
        </div>
      </div>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        action={action}
      />
      <Dialog open={open} onClose={handleClose} fullWidth={true} maxWidth="lg">
        {movieLoading ? (
          <LinearProgress />
        ) : (
          <div>
            <DialogTitle>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "baseline",
                  flexDirection: "row",
                }}
              >
                <Typography variant="h3" component="div">
                  {currentMovie.english_title}
                </Typography>

                <Box
                  sx={{
                    flexDirection: "row",
                    display: "flex",
                    alignItems: "baseline",
                  }}
                >
                  <Box
                    sx={{
                      height: "1.5rem",
                      margin: "0 4px",
                      alignSelf: "center",
                    }}
                  >
                    <img
                      height="100%"
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/IMDB_Logo_2016.svg/2560px-IMDB_Logo_2016.svg.png"
                    />
                  </Box>

                  <Typography
                    variant="h5"
                    sx={{
                      margin: "0 4px",
                    }}
                  >
                    {currentMovie.imdb_rating} / 10
                  </Typography>

                  <Typography
                    variant="caption"
                    sx={{
                      margin: "0 4px",
                    }}
                  >
                    {"(" + currentMovie.num_votes + " votes)"}
                  </Typography>
                </Box>
                <Typography variant="h5">
                  {new Date(currentMovie.release_year).getFullYear()}{" "}
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent>
              {error && <Alert severity="warning">{error}</Alert>}
              <Box
                component="form"
                id="MovieForm"
                noValidate
                onSubmit={formSubmitHandler}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: "wrap",
                    marginTop: "8px",
                  }}
                >
                  <input
                    type="hidden"
                    name="id"
                    defaultValue={currentMovie.id}
                  />
                  <Box
                    sx={{
                      flex: 0,
                      display: "flex",
                      flexDirection: "column",
                      marginRight: "8px",
                    }}
                  >
                    <Suspense fallback={null}>
                      <PosterImageLoader
                        posterLink={currentMovie.poster_link}
                      />
                    </Suspense>

                    <TextField
                      label="Link to Poster Image"
                      name="poster_link"
                      id="poster_link"
                      margin="normal"
                      defaultValue={currentMovie.poster_link ?? ""}
                    />
                  </Box>
                  <TextField
                    autoFocus
                    margin="normal"
                    sx={{
                      flex: 1,
                      marginTop: 0,
                      height: "100%",
                    }}
                    id="description"
                    name="description"
                    label="Description"
                    fullWidth
                    rows={20}
                    variant="outlined"
                    multiline
                    defaultValue={currentMovie.description ?? ""}
                  />
                </Box>

                <TextField
                  sx={{
                    flex: 2,
                  }}
                  margin="normal"
                  id="preview_link"
                  name="preview_link"
                  label="Link to Preview"
                  fullWidth
                  variant="outlined"
                  defaultValue={currentMovie.preview_link ?? ""}
                />
                <TextField
                  margin="normal"
                  id="language"
                  name="language"
                  label="Language"
                  fullWidth
                  variant="outlined"
                  defaultValue={currentMovie.language ?? ""}
                />
                <Typography>
                  <Link href={"https://imdb.com/title/" + currentMovie.imdb_id}>
                    IMDB Page
                  </Link>
                </Typography>
                {!isBlank(currentMovie.preview_link) ? (
                  <ReactPlayer url={currentMovie.preview_link} />
                ) : (
                  <div />
                )}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
              <Button form="MovieForm" type="submit">
                {`${isSubmitting ? "Saving" : "Save"}`}
              </Button>
            </DialogActions>
          </div>
        )}
      </Dialog>
    </Paper>
  );
}
function isBlank(str: any) {
  return !str || /^\s*$/.test(str);
}
