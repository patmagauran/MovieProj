import {Pool} from "pg";
import {from as copyFrom } from "pg-copy-streams";
import fs from "fs";
const pool = new Pool({
  user: 'MovieProjApp',
  host: 'localhost',
  database: 'apiTest',
  password: 'MovieProj',
  port: 5432,
})

export const imoprtData = (request: any, response: any) => {
pool.connect(function (err, client, done) {
  var stream = client.query(copyFrom('COPY "MovieBasics" FROM STDIN'))
  var fileStream = fs.createReadStream('/home/pat/MovieProj/data/data.tsv')
  fileStream.on('error', (error) => {
  console.log('File Error');
  console.error(error);
  done(error);
});
  stream.on('error', (error: any) => {
  console.log('Stream Error');
  console.error(error);
  done(error);
});
  stream.on('finish', (error: any) => {
  console.log('Finished');
  done(error);
});
  fileStream.pipe(stream)
})
    response.status(200).json({stauts: "Successful"})

}

export const getUsers = (request: any, response: any) => {
  pool.query('SELECT * FROM users ORDER BY id ASC', (error, results) => {
    if (error) {
      console.log(error)
    }
    response.status(200).json(results.rows)
  })
}

export const getUserById = (request: any, response: any) => {
  const id = parseInt(request.params.id)

  pool.query('SELECT * FROM users WHERE id = $1', [id], (error, results) => {
    if (error) {
      console.log(error)
    }
    response.status(200).json(results.rows)
  })
}

export const createUser = (request: any, response: any) => {
  const { name, email } = request.body

  pool.query('INSERT INTO users (name, email) VALUES ($1, $2)', [name, email], (error, results) => {
    if (error) {
      console.log(error)
    }
    response.status(201).send(`User added with ID:`)
  })
}

export const updateUser = (request: any, response: any) => {
  const id = parseInt(request.params.id)
  const { name, email } = request.body

  pool.query(
    'UPDATE users SET name = $1, email = $2 WHERE id = $3',
    [name, email, id],
    (error, results) => {
      if (error) {
        console.log(error)
      }
      response.status(200).send(`User modified with ID: ${id}`)
    }
  )
}

export const deleteUser = (request: any, response: any) => {
  const id = parseInt(request.params.id)

  pool.query('DELETE FROM users WHERE id = $1', [id], (error, results) => {
    if (error) {
      console.log(error)
    }
    response.status(200).send(`User deleted with ID: ${id}`)
  })
}
