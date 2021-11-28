CREATE TABLE "movies" (
  "id" SERIAL PRIMARY KEY,
  "english_title" varchar NOT NULL,
  "imbd_rating" decimal,
  "release_year" date,
  "runtime" decimal,
  "imdb_id" varchar,
  "preview_link" varchar,
  "language" int,
  "see_score" int
);

CREATE TABLE "movie_genres" (
  "movie" int NOT NULL,
  "genre" int NOT NULL,
  PRIMARY KEY ("movie", "genre")
);

CREATE TABLE "people" (
  "id" SERIAL PRIMARY KEY,
  "imdb_id" int,
  "name" varchar NOT NULL
);

CREATE TABLE "genre" (
  "id" SERIAL PRIMARY KEY,
  "genre_name" varchar NOT NULL
);

CREATE TABLE "friends_want_to_see_movies" (
  "user" int NOT NULL,
  "movie" int NOT NULL,
  PRIMARY KEY ("user", "movie")
);

CREATE TABLE "friend_seen_movie" (
  "user" int NOT NULL,
  "movie" int NOT NULL,
  "date_seen" date NOT NULL DEFAULT (now()),
  "see_again" boolean NOT NULL DEFAULT false,
  PRIMARY KEY ("user", "movie")
);

CREATE TABLE "actors_in_movie" (
  "person" int NOT NULL,
  "movie" int NOT NULL,
  "character_name" varchar,
  PRIMARY KEY ("person", "movie")
);

CREATE TABLE "crew_in_movie" (
  "person" int NOT NULL,
  "movie" int NOT NULL,
  "role" varchar,
  PRIMARY KEY ("person", "movie")
);

CREATE TABLE "friend_has_service" (
  "user" int NOT NULL,
  "service" int NOT NULL,
  PRIMARY KEY ("user", "service")
);

CREATE TABLE "movie_available_on" (
  "service" int NOT NULL,
  "movie" int NOT NULL,
  PRIMARY KEY ("service", "movie")
);

CREATE TABLE "services" (
  "id" SERIAL PRIMARY KEY,
  "service" varchar NOT NULL
);

CREATE TABLE "languages" (
  "id" SERIAL PRIMARY KEY,
  "language" varchar NOT NULL
);

CREATE TABLE "users" (
  "id" SERIAL PRIMARY KEY,
  "username" varchar NOT NULL,
  "password_hash" varchar NOT NULL,
  "first_name" varchar NOT NULL,
  "last_name" varchar,
  "email" varchar
);

CREATE TABLE "user_available" (
  "user_id" int,
  "start_time" timestamptz NOT NULL,
  "end_time" timestamptz  NOT NULL
);

ALTER TABLE "movies" ADD FOREIGN KEY ("language") REFERENCES "languages" ("id");

ALTER TABLE "movie_genres" ADD FOREIGN KEY ("movie") REFERENCES "movies" ("id");

ALTER TABLE "movie_genres" ADD FOREIGN KEY ("genre") REFERENCES "genre" ("id");

ALTER TABLE "friends_want_to_see_movies" ADD FOREIGN KEY ("user") REFERENCES "users" ("id");

ALTER TABLE "friends_want_to_see_movies" ADD FOREIGN KEY ("movie") REFERENCES "movies" ("id");

ALTER TABLE "friend_seen_movie" ADD FOREIGN KEY ("user") REFERENCES "users" ("id");

ALTER TABLE "friend_seen_movie" ADD FOREIGN KEY ("movie") REFERENCES "movies" ("id");

ALTER TABLE "actors_in_movie" ADD FOREIGN KEY ("person") REFERENCES "people" ("id");

ALTER TABLE "actors_in_movie" ADD FOREIGN KEY ("movie") REFERENCES "movies" ("id");

ALTER TABLE "crew_in_movie" ADD FOREIGN KEY ("person") REFERENCES "people" ("id");

ALTER TABLE "crew_in_movie" ADD FOREIGN KEY ("movie") REFERENCES "movies" ("id");

ALTER TABLE "friend_has_service" ADD FOREIGN KEY ("user") REFERENCES "users" ("id");

ALTER TABLE "friend_has_service" ADD FOREIGN KEY ("service") REFERENCES "services" ("id");

ALTER TABLE "movie_available_on" ADD FOREIGN KEY ("service") REFERENCES "services" ("id");

ALTER TABLE "movie_available_on" ADD FOREIGN KEY ("movie") REFERENCES "movies" ("id");

ALTER TABLE "user_available" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

CREATE UNIQUE INDEX ON "movies" ("imdb_id");

CREATE UNIQUE INDEX ON "people" ("imdb_id");
