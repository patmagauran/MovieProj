import { Pool, PoolClient, QueryArrayConfig, QueryArrayResult, QueryConfig, QueryResult } from "pg";
const pool = new Pool({
  user: "MovieProjApp",
  host: "localhost",
  database: "MovieProj",
  password: "MovieProj",
  port: 5432,
});
import { UNSAFE_PRINT_PARAMS } from "..";
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

export const queryWithClient = async (client: PoolClient, text: string | QueryConfig | QueryArrayConfig | any, params?: any): Promise<QueryResult<any>> => {
  const start = Date.now();
  //const client = await this.pool.connect()
  try {
    //await pool.query(`SET SESSION postgres.username = '${cUser.username}'`, [])
    const result: QueryResult<any> = await client.query(text, params)
    const duration = Date.now() - start;
    if (!UNSAFE_PRINT_PARAMS && text.text) {
      text = text.text;
    }
    console.log("executed query", { text, duration, rows: result.rowCount });
    return result
  } catch (e) {
    if (!UNSAFE_PRINT_PARAMS && text.text) {
      text = text.text;
    }
    console.log("Error query", { text });

    console.error(e);
    throw e
  }
};

export const query = async (text: string | QueryConfig | QueryArrayConfig | any, params?: any): Promise<QueryResult<any>> => {
  const start = Date.now();
  //const client = await this.pool.connect()
  try {
    //await pool.query(`SET SESSION postgres.username = '${cUser.username}'`, [])
    const result: QueryResult<any> = await pool.query(text, params)
    const duration = Date.now() - start;
    if (!UNSAFE_PRINT_PARAMS && text.text) {
      text = text.text;
    }
    console.log("executed query", { text, duration, rows: result.rowCount });
    return result
  } catch (e) {
    if (!UNSAFE_PRINT_PARAMS && text.text) {
      text = text.text;
    }
    console.log("Failed query", { text });
    console.error(e);
    throw e
  }
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