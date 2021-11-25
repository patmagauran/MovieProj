import React from "react";
import {
  DataGrid,
  GridRowsProp,
  GridColDef,
  GridToolbar,
} from "@mui/x-data-grid";
import { Container, Paper } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useGridApiContext, useGridState } from "@mui/x-data-grid";
import Pagination from "@mui/material/Pagination";
import sampleData from "./sampleData";
const rows: GridRowsProp = sampleData;

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
