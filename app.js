const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;
app.use(express.json());

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server is running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB error:${error.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

//Path: /movies/
//Method: GET

const convertDbObjectToResponse = (dbMovies) => {
  return {
    movieName: dbMovies.movie_name,
  };
};

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT
        movie_name
    FROM
        movie;
    `;
  const movies = await db.all(getMoviesQuery);
  response.send(movies.map((movie) => convertDbObjectToResponse(movie)));
});

//Path: /movies/
//Method: POST

app.post("/movies/", async (request, response) => {
  const requestBody = request.body;
  const { directorId, movieName, leadActor } = requestBody;
  const postMovieQuery = `
        INSERT INTO 
            movie(director_id,movie_name,lead_actor)
        VALUES
            ( ${directorId},'${movieName}','${leadActor}');
    `;
  const postMovie = await db.run(postMovieQuery);
  response.send("Movie Successfully Added");
});

//Path: /movies/:movieId/
//Method: GET

const convertDbMoviesObjectToResponseObject = (movie) => {
  return {
    movieId: movie.movie_id,
    directorId: movie.director_id,
    movieName: movie.movie_name,
    leadActor: movie.lead_actor,
  };
};

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieWithIdQuery = `
    SELECT
        *
    FROM
        movie
    WHERE
        movie_id=${movieId};
    `;
  const movie = await db.get(getMovieWithIdQuery);
  response.send(convertDbMoviesObjectToResponseObject(movie));
});

//Path: /movies/:movieId/
//Method: PUT

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const putRequestBody = request.body;
  const { directorId, movieName, leadActor } = putRequestBody;
  const updateMovieDetailsQuery = `
    UPDATE movie
    SET
        director_id = ${directorId},
        movie_name='${movieName}',
        lead_actor='${leadActor}'
    WHERE
        movie_id = ${movieId};
    `;
  await db.run(updateMovieDetailsQuery);
  response.send("Movie Details Updated");
});

//Path: /movies/:movieId/
//Method: DELETE

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM
    movie 
    WHERE
    movie_id = ${movieId};
    `;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//Path: /directors/
//Method: GET

const convertDbDirectorsObjectToResponseObject = (dbDirector) => {
  return {
    directorId: dbDirector.director_id,
    directorName: dbDirector.director_name,
  };
};

app.get("/directors/", async (request, response) => {
  const getDirectorsDetailsQuery = `
    SELECT
    *
    FROM
    director
    `;
  const directors = await db.all(getDirectorsDetailsQuery);
  response.send(
    directors.map((eachDirector) =>
      convertDbDirectorsObjectToResponseObject(eachDirector)
    )
  );
});

//Path: /directors/:directorId/movies/
//Method: GET

const convertDbDirectorMoviesToResponseObject = (dbMovie) => {
  return {
    movieName: dbMovie.movie_name,
  };
};

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMoviesOfDirectorsQuery = `
    SELECT
        movie_name
    FROM 
        movie
    WHERE
        director_id=${directorId};
    `;
  const moviesDirected = await db.all(getMoviesOfDirectorsQuery);
  response.send(
    moviesDirected.map((eachMovie) =>
      convertDbDirectorMoviesToResponseObject(eachMovie)
    )
  );
});
module.exports = app;
