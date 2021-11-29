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
} from "@mui/x-data-grid";
import { Container, Paper } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useGridApiContext, useGridState } from "@mui/x-data-grid";
import Pagination from "@mui/material/Pagination";
import sampleData from "./sampleData";
import WatchLaterIcon from "@mui/icons-material/WatchLater";
import ThumbsUpDownIcon from "@mui/icons-material/ThumbsUpDown";
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
function loadServerRows(page: number): Promise<any> {
  return new Promise<any>((resolve) => {
    axios
      .get("http://localhost:8080/movies", {
        params: {
          page: page,
          pageSize: 25,
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
export default function MovieList() {
  //  const [rows, setRows] = React.useState(sampleData);
  const [page, setPage] = React.useState(0);
  const [rows, setRows] = React.useState<GridRowsProp>([]);
  const [loading, setLoading] = React.useState<boolean>(false);

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
      { field: "english_title", headerName: "English Title", flex: 1 },
      { field: "genre", headerName: "Genres", flex: 1 },
      { field: "imdb_rating", headerName: "IMDB Rating", flex: 1 },
      { field: "see_score", headerName: "Priority Number", flex: 1 },
      { field: "runtime", headerName: "Runtime", flex: 1 },
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
            rowCount={100}
            paginationMode="server"
            onPageChange={(newPage) => setPage(newPage)}
            loading={loading}
            components={{
              Toolbar: GridToolbar,
            }}
          />
        </div>
      </div>
    </Paper>
  );
}
