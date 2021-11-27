import Router from "express-promise-router";
import * as db from "../db";
import { from as copyFrom } from "pg-copy-streams";
import fs from "fs";
const router = Router();

router.get("/import", async (request: any, response: any) => {
  //console.log("hello");
  //response.status(200).json({});
  var client = await db.getClient();
  var stream = client.query(copyFrom('COPY "MovieBasics" FROM STDIN'));
  var fileStream = fs.createReadStream("/home/pat/MovieProj/data/data.tsv");
  fileStream.on("error", (error) => {
    console.log("File Error");
    console.error(error);
    client.release();
    response.status(503).json({ stauts: "File Error" });
  });
  stream.on("error", (error: any) => {
    console.log("Stream Error");
    console.error(error);
    client.release();
    response.status(503).json({ stauts: "Stream Error" });
  });
  stream.on("finish", (error: any) => {
    console.log("Finished");
    client.release();
    response.status(200).json({ stauts: "Successful" });
  });
  fileStream.pipe(stream);
});
export default router;
