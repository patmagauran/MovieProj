-- View: public.people_movies_mv

-- DROP MATERIALIZED VIEW IF EXISTS public.people_movies_mv;

CREATE MATERIALIZED VIEW IF NOT EXISTS public.people_movies_mv
TABLESPACE pg_default
AS
 SELECT people.id,
    people.imdb_id,
    people.name,
    popular_movies.movie_titles,
    popular_movies.sum_votes,
    popular_movies.categories
   FROM people
     JOIN LATERAL ( SELECT string_agg(all_movies.english_title::text, ', '::text) AS movie_titles,
            sum(all_movies.num_votes) AS sum_votes,
            string_agg(all_movies.category::text, ', '::text) AS categories
           FROM ( SELECT movies.english_title,
                    movies.num_votes,
                    movie_people.category
                   FROM ( SELECT actors_in_movie.person,
                            actors_in_movie.movie,
                            actors_in_movie.category
                           FROM actors_in_movie
                          WHERE actors_in_movie.person = people.id
                        UNION ALL
                         SELECT crew_in_movie.person,
                            crew_in_movie.movie,
                            crew_in_movie.category
                           FROM crew_in_movie
                          WHERE crew_in_movie.person = people.id) movie_people
                     JOIN movies ON movies.id = movie_people.movie
                  ORDER BY movies.num_votes DESC NULLS LAST, movies.english_title
                 LIMIT 3) all_movies) popular_movies ON true
WITH DATA;

ALTER TABLE IF EXISTS public.people_movies_mv
    OWNER TO postgres;


    -- View: public.movies_list

-- DROP VIEW public.movies_list;

CREATE OR REPLACE VIEW public.movies_list
 AS
 SELECT movies.english_title,
    movies.imdb_rating,
    movies.id
   FROM movies
  ORDER BY movies.num_votes DESC NULLS LAST, movies.english_title;

ALTER TABLE public.movies_list
    OWNER TO postgres;

-- View: public.people_movies

-- DROP VIEW public.people_movies;

CREATE OR REPLACE VIEW public.people_movies
 AS
 SELECT people_movies_mv.id,
    people_movies_mv.imdb_id,
    people_movies_mv.name,
    people_movies_mv.movie_titles,
    people_movies_mv.sum_votes,
    people_movies_mv.categories
   FROM people_movies_mv
  ORDER BY people_movies_mv.sum_votes DESC NULLS LAST, people_movies_mv.name;

ALTER TABLE public.people_movies
    OWNER TO postgres;

CREATE VIEW movies_to_see AS
SELECT movies_list_mv.id, movies_list_mv.english_title, movies_list_mv.see_score, friend_movies.want_to_see_count, friend_movies.can_see_count
FROM movies_list_mv
JOIN LATERAL (
	SELECT count(DISTINCT friends_want_to_see_movies.user) as want_to_see_count, count( DISTINCT friend_has_service.user) as can_see_count
	 FROM friends_want_to_see_movies
	 LEFT JOIN movie_available_on ON movie_available_on.movie = movies_list_mv.id
	 LEFT JOIN friend_has_service ON 
	movie_available_on.service = friend_has_service.service 
	AND friends_want_to_see_movies.user = friend_has_service.user
	 WHERE friends_want_to_see_movies.movie = movies_list_mv.id
) friend_movies ON true
ORDER BY movies_list_mv.see_score DESC NULLS LAST

CREATE MATERIALIZED VIEW IF NOT EXISTS public.movies_list_mv
TABLESPACE pg_default
AS
 SELECT movies.id,
    movies.english_title,
    movies.imdb_rating,
    movies.release_year,
    movies.runtime,
    movies.imdb_id,
    movies.preview_link,
    movies.language,
    movies.see_score,
    movies.title_type,
    movies.num_votes
   FROM movies
  ORDER BY movies.num_votes DESC NULLS LAST, movies.english_title
WITH DATA;

CREATE MATERIALIZED VIEW IF NOT EXISTS public.people_movies_mv
TABLESPACE pg_default
AS
 SELECT people.id,
    people.imdb_id,
    people.name,
    popular_movies.movie_titles,
    popular_movies.sum_votes,
    popular_movies.categories
   FROM people
     JOIN LATERAL ( SELECT string_agg(all_movies.english_title::text, ', '::text) AS movie_titles,
            sum(all_movies.num_votes) AS sum_votes,
            string_agg(all_movies.category::text, ', '::text) AS categories
           FROM ( SELECT movies.english_title,
                    movies.num_votes,
                    movie_people.category
                   FROM ( SELECT actors_in_movie.person,
                            actors_in_movie.movie,
                            actors_in_movie.category
                           FROM actors_in_movie
                          WHERE actors_in_movie.person = people.id
                        UNION ALL
                         SELECT crew_in_movie.person,
                            crew_in_movie.movie,
                            crew_in_movie.category
                           FROM crew_in_movie
                          WHERE crew_in_movie.person = people.id) movie_people
                     JOIN movies ON movies.id = movie_people.movie
                  ORDER BY movies.num_votes DESC NULLS LAST, movies.english_title
                 LIMIT 3) all_movies) popular_movies ON true
WITH DATA;