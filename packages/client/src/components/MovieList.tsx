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
} from "@mui/x-data-grid";
import { Box, Container, Paper, Tooltip } from "@mui/material";
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
export default function MovieList() {
  //  const [rows, setRows] = React.useState(sampleData);
  const [page, setPage] = React.useState(0);
  const [rows, setRows] = React.useState<GridRowsProp>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [searchText, setSearchText] = React.useState("");

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
      setRows((prevRows) =>
        prevRows.map((row) =>
          row.id === id ? { ...row, WantToSee: !row.WantToSee } : row
        )
      );
      console.log(" I want to see " + id);
    },
    []
  );

  const SeenMovie = React.useCallback(
    (id: GridRowId) => () => {
      setRows((prevRows) =>
        prevRows.map((row) =>
          row.id === id ? { ...row, HaveSeen: !row.HaveSeen } : row
        )
      );
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
                color={params.row.WantToSee ? "primary" : "inherit"}
              />
            }
            label="Delete"
            onClick={AddMovieToWatchlist(params.id)}
          />,
          <GridActionsCellItem
            icon={
              <ThumbsUpDownIcon
                color={params.row.HaveSeen ? "primary" : "inherit"}
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
    </Paper>
  );
}
