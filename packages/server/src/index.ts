import express from "express";
import * as db from "./Endpoints/queries";
const app = express();
const port = 8080; // default port to listen

app.use(express.json()); //Used to parse JSON bodies
app.use(express.urlencoded()); //Parse URL-encoded bodies

app.get('/', (request, response) => {
  response.json({ info: 'Node.js, Express, and Postgres API' })
})
app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})
app.get('/users', db.getUsers)
app.get('/import', db.imoprtData)
app.get('/users/:id', db.getUserById)
app.post('/users', db.createUser)
app.put('/users/:id', db.updateUser)
app.delete('/users/:id', db.deleteUser)