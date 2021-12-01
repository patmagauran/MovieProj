import React from "react";
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
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useGridApiContext, useGridState } from "@mui/x-data-grid";
import Pagination from "@mui/material/Pagination";
import sampleData from "./sampleData";
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
const initialRows: GridRowsProp = sampleData;

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
function loadServerRows(page: number, searchText?: string): Promise<any> {
  return new Promise<any>((resolve) => {
    axios
      .get("http://localhost:8080/movies", {
        params: {
          page: page,
          pageSize: 25,
          searchText: searchText,
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

interface movieType {
  [key: string]: any;
}

export default function MovieList() {
  //  const [rows, setRows] = React.useState(sampleData);
  const [page, setPage] = React.useState(0);
  const [rows, setRows] = React.useState<GridRowsProp>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [searchText, setSearchText] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [currentMovie, setCurrentMovie] = React.useState<movieType>({});
  const [movieLoading, setMovieLoading] = React.useState<boolean>(false);
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
    (id: GridRowId) => () => {
      const alreadyWants = rows.find((row) => row.id == id)!.wants_to_see;
      fetch("http://localhost:8080/" + "movies/seenMovie/" + id, {
        method: alreadyWants ? "DELETE" : "PUT",
        credentials: "include",
      })
        .then(async (response) => {
          if (!response.ok) {
          } else {
            setRows((prevRows) =>
              prevRows.map((row) =>
                row.id === id ? { ...row, WantToSee: !row.WantToSee } : row
              )
            );
          }
        })
        .catch((error) => {});
    },
    []
  );

  const SeenMovie = React.useCallback(
    (id: GridRowId) => () => {
      const alreadySeen = rows.find((row) => row.id == id)!.has_seen;
      fetch("http://localhost:8080/" + "movies/wantSeeMovie/" + id, {
        method: alreadySeen ? "DELETE" : "PUT",
        credentials: "include",
      })
        .then(async (response) => {
          if (!response.ok) {
          } else {
            setRows((prevRows) =>
              prevRows.map((row) =>
                row.id === id ? { ...row, HaveSeen: !row.HaveSeen } : row
              )
            );
          }
        })
        .catch((error) => {});

      console.log(" I Have seen " + id);
    },
    []
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
      {
        field: "actions",
        type: "actions",
        width: 80,
        getActions: (params: GridRowParams) => [
          <GridActionsCellItem
            icon={
              <WatchLaterIcon
                color={params.row.wants_to_see ? "primary" : "inherit"}
              />
            }
            label="Delete"
            onClick={AddMovieToWatchlist(params.id)}
          />,
          <GridActionsCellItem
            icon={
              <ThumbsUpDownIcon
                color={params.row.has_seen ? "primary" : "inherit"}
              />
            }
            label="Toggle Admin"
            onClick={SeenMovie(params.id)}
          />,
        ],
      },
    ],
    [AddMovieToWatchlist, SeenMovie]
  );
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
      <Dialog open={open} onClose={handleClose}>
        {movieLoading ? (
          <LinearProgress />
        ) : (
          <div>
            <DialogTitle>{currentMovie.english_title}</DialogTitle>
            <DialogContent>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  flexWrap: "wrap",
                }}
              >
                <Box
                  sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <img src={currentMovie.poster_link} />
                  <TextField value={currentMovie.poster_link} />
                </Box>
              </Box>
              <TextField
                autoFocus
                margin="dense"
                id="name"
                label="Email Address"
                type="email"
                fullWidth
                variant="standard"
                value={currentMovie.description}
              />
              <TextField
                autoFocus
                margin="dense"
                id="name"
                label="Email Address"
                type="email"
                fullWidth
                variant="standard"
                value={currentMovie.preview_link}
              />
              <TextField
                autoFocus
                margin="dense"
                id="name"
                label="Email Address"
                type="email"
                fullWidth
                variant="standard"
                value={currentMovie.language}
              />
              <Typography>{currentMovie.imdb_rating}</Typography>
              <Typography>{currentMovie.num_votes}</Typography>
              <Typography>{currentMovie.release_year}</Typography>
              <Typography>
                <a href={currentMovie.preview_link} />
                Preview
              </Typography>
              <Typography>
                <a href={"https://imdb.com/title/" + currentMovie.imdb_id} />
                IMDB
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
              <Button onClick={handleClose}>Subscribe</Button>
            </DialogActions>
          </div>
        )}
      </Dialog>
    </Paper>
  );
}
