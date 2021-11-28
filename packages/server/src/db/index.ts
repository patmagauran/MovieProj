import { Pool, QueryArrayResult } from "pg";
const pool = new Pool({
  user: "MovieProjApp",
  host: "localhost",
  database: "MovieProj",
  password: "MovieProj",
  port: 5432,
});
export const sql = (strings: TemplateStringsArray) => (String.raw(strings));

export const getClient = async () => {
  return pool.connect();
};

export const query = async (text: any, params?: any) => {
  const start = Date.now();

  return pool
    .query(text, params)
    .then((res) => {
      const duration = Date.now() - start;
      console.log("executed query", { text, duration, rows: res.rowCount });
      return res;
    })
    .catch((err) => {
      console.error(err);
      throw err;
    });
};

export const restQuery = async (response: any, text: any, params?: any) => {
  try {
    const { rows } = await query(text, params);
    response.status(200).json(rows);
  } catch (err) {
    response.status(503).json({ message: "Internal Server Error" });
  }
};
