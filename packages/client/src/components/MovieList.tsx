import React from "react";
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

const columns: GridColDef[] = [
  { field: "title", headerName: "English Title", flex: 1 },
  { field: "genre", headerName: "Genres", flex: 1 },
  { field: "rating", headerName: "IMDB Rating", flex: 1 },
  { field: "priority", headerName: "Priority Number", flex: 1 },
  { field: "runtime", headerName: "Runtime", flex: 1 },
];
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
export default function MovieList() {
  const [rows, setRows] = React.useState(sampleData);

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
      { field: "title", headerName: "English Title", flex: 1 },
      { field: "genre", headerName: "Genres", flex: 1 },
      { field: "rating", headerName: "IMDB Rating", flex: 1 },
      { field: "priority", headerName: "Priority Number", flex: 1 },
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
            pagination
            autoPageSize
            rows={rows}
            columns={columns}
            components={{
              Toolbar: GridToolbar,
              Pagination: CustomPagination,
            }}
          />
        </div>
      </div>
    </Paper>
  );
}
