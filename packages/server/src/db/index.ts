import { Pool, QueryArrayConfig, QueryArrayResult, QueryConfig } from "pg";
const pool = new Pool({
  user: "MovieProjApp",
  host: "localhost",
  database: "MovieProj",
  password: "MovieProj",
  port: 5432,
});
export const sql = (
  strings: TemplateStringsArray,
  ...values: any[]
): QueryConfig => ({
  text: String.raw(strings, ...values.map((_, i) => `$${i + 1}`)),
  values
});
export const getClient = async () => {
  return pool.connect();
};

export const query = async (text: string | QueryConfig | QueryArrayConfig | any, params?: any) => {
  const start = Date.now();

  return pool
    .query(text, params)
    .then((res) => {
      const duration = Date.now() - start;
      if (text.text) {
        text = text.text;
      }
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
    response.status(200).json({
      data: rows
    });
  } catch (err) {
    response.status(503).json({ message: "Internal Server Error" });
  }
};
