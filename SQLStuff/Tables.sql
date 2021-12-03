--
-- Name: languages
-- Purpose: Would Store a list of languages that a movie could be primarily in. 
-- Not currently implemented fully as IMDB does not export this data as I thought they did.
--

CREATE TABLE languages (
    id SERIAL NOT NULL PRIMARY KEY,
    language character varying NOT NULL UNIQUE
);

--
-- Name: movies
-- Purpose: The main information table about the movies. Stores the basic details specific to each movie.
--

CREATE TABLE movies (
    id SERIAL NOT NULL PRIMARY KEY,
    english_title character varying NOT NULL,
    imdb_rating numeric,
    release_year date,
    runtime numeric,
    imdb_id character varying UNIQUE,
    preview_link character varying,
    language integer REFERENCES languages(id),
    see_score integer, --DEPRECATED
    title_type character varying, --The type of the title: short, movie, tvseries, video
    num_votes integer, -- how many imdb votes doe sit have
    tmdb_updated boolean DEFAULT false NOT NULL, --Marks if the fields were externaly updated. Would be used to prevent needlees automatic refetching
    description text,
    poster_link character varying
);

--
-- Name: users
-- Purpose: The table of the users. 
--

CREATE TABLE users (
    id SERIAL NOT NULL PRIMARY KEY,
    username character varying NOT NULL UNIQUE,
    password_hash character varying NOT NULL,
    first_name character varying NOT NULL,
    last_name character varying,
    email character varying
);

--
-- Name: people
-- Purpose: Table of people that can be in or work on movies. Data from IMDB
--

CREATE TABLE people (
    id SERIAL NOT NULL PRIMARY KEY,
    imdb_id character varying UNIQUE,
    name character varying NOT NULL
);

--
-- Name: services
-- Purpose: A table storing the various services to get a movie from. Currently manual input.
--

CREATE TABLE services (
    id SERIAL NOT NULL PRIMARY KEY,
    service character varying NOT NULL UNIQUE
);


--
-- Name: genre
-- Purpose: The various genres a movie can be. Parsed from IMDB
--

CREATE TABLE genre (
    id SERIAL NOT NULL PRIMARY KEY,
    genre_name character varying NOT NULL UNIQUE
);


--
-- Name: keywords
-- Purpose: All the keywords that can be associate with a movie.
-- This was made to support using data from TMDB to catalog movies and make recommendation.
-- However, that is outside the scope of this project, and thus I have opted to leave the use of this to the future.
--

CREATE TABLE keywords (
    id SERIAL NOT NULL PRIMARY KEY,
    keyword_name character varying UNIQUE
);


--
-- Name: actors_in_movie
-- Purpose: Table storing the relation between actors and movies. Category refers to Actor, Actress, or self
--

CREATE TABLE actors_in_movie (
    person integer NOT NULL REFERENCES people(id),
    movie integer NOT NULL REFERENCES movies(id),
    character_name character varying,
    category character varying,
    PRIMARY KEY (person, movie)
);


--
-- Name: user_available
-- Purpose: This stores all the time ranges each user is available.
--

CREATE TABLE user_available (
    user_id integer REFERENCES users(id),
    time_range tstzrange NOT NULL
);



--
-- Name: crew_in_movie
-- Purpose: Table stores the relation between crew and movies. 
-- Category could refer to Director, Writer, etc. Role refers to their specific role such as Executive Producer.
--

CREATE TABLE crew_in_movie (
    person integer NOT NULL REFERENCES people(id),
    movie integer NOT NULL REFERENCES movies(id),
    role character varying,
    category character varying,
    PRIMARY KEY (person, movie)
);


--
-- Name: friend_has_service
-- Purpose: A table to describe which services each friend has.
--

CREATE TABLE friend_has_service (
    "user" integer NOT NULL REFERENCES users(id),
    service integer NOT NULL REFERENCES services(id),
    PRIMARY KEY ("user", service)
);


--
-- Name: friend_seen_movie
-- Purpose: A table describing what movies each of the users have seen.
-- The see_again field is akin to a like/dislike field as currently implemented
-- date_seen is not currently implemented with any use, other than logging when the user liked/disliked the movie
--

CREATE TABLE friend_seen_movie (
    "user" integer NOT NULL REFERENCES users(id),
    movie integer NOT NULL REFERENCES movies(id),
    date_seen date DEFAULT now() NOT NULL,
    see_again boolean DEFAULT false NOT NULL,
    PRIMARY KEY ("user", movie)
);


--
-- Name: friends_want_to_see_movies
-- Purpose: This table describes each movie that each user wants to see(i.e their watchlist)
--

CREATE TABLE friends_want_to_see_movies (
    "user" integer NOT NULL REFERENCES users(id),
    movie integer NOT NULL REFERENCES movies(id),
    PRIMARY KEY ("user", movie)
);

--
-- Name: movie_available_on
-- Purpose: This is a connection to the services table to determine what services a movie is available on.
--

CREATE TABLE movie_available_on (
    service integer NOT NULL REFERENCES services(id),
    movie integer NOT NULL REFERENCES movies(id),
    PRIMARY KEY (service, movie)
);


--
-- Name: movie_genres
-- Purpose: This lists the genres for each movie in a MTM relationship
--

CREATE TABLE movie_genres (
    movie integer NOT NULL REFERENCES movies(id),
    genre integer NOT NULL REFERENCES genre(id),
    PRIMARY KEY (movie, genre)
);


--
-- Name: movie_keywords
-- Purpose: This would list the various keywords associated with a movie. 
--

CREATE TABLE movie_keywords (
    movie integer NOT NULL REFERENCES movies(id),
    keyword integer NOT NULL REFERENCES keywords(id),
    PRIMARY KEY (movie, keyword)
);

--
-- Name: sessions
-- Purpose: This stores active user sessions for authentication purposes.
--

CREATE TABLE sessions (
    user_id integer NOT NULL REFERENCES users(id),
    refresh_token character varying NOT NULL,
    PRIMARY KEY (user_id, refresh_token)
);