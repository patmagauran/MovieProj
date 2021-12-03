--
-- Name: people_movies_mv
-- Purpose: This holds data linking each person with their three most popular movies and their roles.
-- 
--

CREATE MATERIALIZED VIEW people_movies_mv AS
 SELECT people.id,
    people.imdb_id,
    people.name,
    popular_movies.movie_titles,
    popular_movies.sum_votes,
    popular_movies.categories
   FROM people
   JOIN LATERAL ( --This creates the list of the person's three most popular movies, their votes, and their job categories
      SELECT string_agg((all_movies.english_title)::text, ', '::text) AS movie_titles,
            sum(all_movies.num_votes) AS sum_votes,
            string_agg(DISTINCT (all_movies.category)::text, ', '::text) AS categories
      FROM (
         SELECT movies.english_title,
               movies.num_votes,
               movie_people.category
         FROM 
         ( -- This makes the combination between their movies and themselves
            ( --This combines both their roles as actors and as crew
               SELECT actors_in_movie.person,
                     actors_in_movie.movie,
                     actors_in_movie.category
               FROM actors_in_movie
               WHERE (actors_in_movie.person = people.id)
            UNION ALL
               SELECT crew_in_movie.person,
                     crew_in_movie.movie,
                     crew_in_movie.category
               FROM crew_in_movie
               WHERE (crew_in_movie.person = people.id)
            ) movie_people
            JOIN movies ON ((movies.id = movie_people.movie))
         )
         ORDER BY movies.num_votes DESC NULLS LAST, movies.english_title --Sort for most popular
         LIMIT 3 --3 most popular
      ) all_movies
   ) popular_movies ON (true) --We want every record
   
  WITH DATA;


--
-- Name: movies_list_mv
-- Purpose: This stores a sorted copy of the movies table.
--

CREATE MATERIALIZED VIEW movies_list_mv AS
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
    movies.num_votes,
    movies.description,
    movies.poster_link,
    movies.tmdb_updated
   FROM movies
  ORDER BY movies.num_votes DESC NULLS LAST, movies.english_title --Sort by votes(popularity) and title
  WITH DATA;

--
-- Name: movies_list_mv_idx
-- Purpose: Allows for quicker re-ordering of the data if needed.
-- This could be added to the base table instead, but this allows for slightly better performance
--

CREATE INDEX movies_list_mv_idx ON movies_list_mv USING btree (num_votes DESC NULLS LAST, english_title);

--
-- Name: user_available_multiranges
-- Purpose: Returns a multirange for each user of when that user is available.
--

CREATE VIEW user_available_multiranges AS
 SELECT range_agg(user_available.time_range) AS available_times,
    user_available.user_id
   FROM user_available
  GROUP BY user_available.user_id;

--
-- Name: actual_overlaps
-- Purpose: Creates a view that shows every individual time slot people are available and who is available in it
-- This differs from the combination_overlaps such that it may show data such as:
-- Time Range  | Users
-- [1pm - 2pm] : [1]
-- [2pm - 3pm] : [1,2]
-- [3pm - 4pm] : [1,2,3]
-- [4pm - 5pm] : [2,3]
-- This means we cannot easily discern the longest time slots for any combination.
-- This was adapted from an alogrithm From: https://stackoverflow.com/a/63156622
--

CREATE VIEW actual_overlaps AS
   WITH 
      filtered_availability AS --Gets the availability table in the form of three columns: start, end, and user
      (
         SELECT upper(unnest(user_available_multiranges_1.available_times)) AS end_time, 
            lower(unnest(user_available_multiranges_1.available_times)) AS start_time,
            user_available_multiranges_1.user_id
            FROM user_available_multiranges user_available_multiranges_1
         ), 
      time_set AS --Gets a list of all the unique times listed in availability
      (
         SELECT filtered_availability.start_time
            FROM filtered_availability
         UNION
         SELECT filtered_availability.end_time
            FROM filtered_availability
         ORDER BY 1
      ), 
      time_pairs AS -- Creates a pairing from each time by duplicating and offsetting the columns
      (
         SELECT tstzrange(start_times.start_time, end_times.start_time) AS time_range -- Turns the start/end back into a range
         FROM 
         (
            (
               SELECT time_set.start_time,
                     row_number() OVER () AS rnum --Window function. Allows access to row number and other utils
               FROM time_set
            ) start_times
            JOIN 
            (
               SELECT time_set.start_time,
                     row_number() OVER () AS rnum
               FROM time_set
            ) end_times ON (((start_times.rnum + 1) = end_times.rnum)))
      )
   SELECT -- Main body of view
      array_agg(user_available_multiranges.user_id) AS user_ids, -- Get list of users
      unnest((user_available_multiranges.available_times * multirange(time_pairs.time_range))) AS overlap_times -- Get list of unique overlaps
   FROM 
   (
      time_pairs
      JOIN user_available_multiranges ON ((user_available_multiranges.available_times && time_pairs.time_range))
   )
   GROUP BY (user_available_multiranges.available_times * multirange(time_pairs.time_range)) -- Avoid duplicate times
   ORDER BY (unnest((user_available_multiranges.available_times * multirange(time_pairs.time_range)))); -- Sort from start to end


--
-- Name: get_combinations(anyarray)
-- Purpose: Gets the powerset of the array inputted
-- Used to get all combinations of users
-- Taken from: https://stackoverflow.com/a/26560615
--

CREATE FUNCTION public.get_combinations(source anyarray) RETURNS SETOF anyarray
    LANGUAGE sql
    AS $$
 with recursive combinations(combination, indices) as (
   select source[i:i], array[i] from generate_subscripts(source, 1) i
   union all
   select c.combination || source[j], c.indices || j
   from   combinations c, generate_subscripts(source, 1) j
   where  j > all(c.indices) )
 select combination from combinations
$$;

--
-- Name: get_compatible_times(integer[])
-- Purpose: Gets the times and duration a set of users are available together in
--

CREATE FUNCTION public.get_compatible_times(filter_ids integer[]) 
    RETURNS TABLE(time_range tstzrange, duration interval)
    LANGUAGE sql
    AS 
    $$
        SELECT range_time, (upper(range_time) - lower(range_time)) as duration 
        FROM 
        (--Get the users individal availabilities
            SELECT unnest(range_agg(overlap_times)) as range_time 
            FROM actual_overlaps 
            WHERE user_ids @> filter_ids
        ) s
    $$;


--
-- Name: combination_overlaps
-- Purpose: This returns every timeslot people can watch a movie in.
-- That way you can search for the overlaps for users 1, 4, 6 and get just that.
-- NOTE: This is dependent on the actual_overlaps view below. 
-- It can be made with no data and then refreshed later with REFRESH MATERIALIZED VIEW combination_overlaps
--

CREATE MATERIALIZED VIEW combination_overlaps AS
 SELECT times.time_range,
    times.duration,
    combos.cmb
   FROM 
   ( -- Get the overlaps for each combination
      ( -- Get all combinations of users(power set)
         SELECT get_combinations(array_agg(users.id)) AS cmb
         FROM users
      ) combos
      JOIN LATERAL get_compatible_times(combos.cmb) times(time_range, duration) ON (true)
   )
  WITH NO DATA;





--
-- Name: movies_list
-- Purpose: Takes the data from the movie_list_mv and appends the genres and applies default sorting
--

CREATE VIEW movies_list AS
 SELECT movies_list_mv.id,
    movies_list_mv.english_title,
    movies_list_mv.imdb_rating,
    movies_list_mv.release_year,
    movies_list_mv.runtime,
    movies_list_mv.imdb_id,
    movies_list_mv.preview_link,
    movies_list_mv.language,
    movies_list_mv.see_score,
    movies_list_mv.title_type,
    movies_list_mv.num_votes,
    movies_list_mv.description,
    movies_list_mv.poster_link,
    movies_list_mv.tmdb_updated,
    (SELECT string_agg((genre.genre_name)::text, ', '::text) AS string_agg
           FROM (movie_genres
             LEFT JOIN genre ON ((movie_genres.genre = genre.id)))
          WHERE (movies_list_mv.id = movie_genres.movie)) AS genres
   FROM movies_list_mv
  ORDER BY movies_list_mv.num_votes DESC NULLS LAST, movies_list_mv.english_title;


--
-- Name: movies_to_see
-- Purpose: Creates a list of movies that at least someone wants to see
--

CREATE VIEW movies_to_see AS
 SELECT movies_list_mv.id,
    movies_list_mv.english_title,
    movies_list_mv.imdb_rating,
    movies_list_mv.release_year,
    movies_list_mv.runtime,
    movies_list_mv.imdb_id,
    friend_movies.want_to_see_count, -- The number who want to see
    friend_movies.can_see_count, -- The number who have a service with the movie
    friend_movies.users_want_to_see, -- The names of those who want to see
    friend_movies.users_have_services, -- The names of those with services
    friend_movies.services_available, --The services it is available on
    friend_movies.user_ids_want_to_see, -- The ids of those who want to see
    ( -- Get the maximum number of friends who want to see it who have enough overlap to see it
      SELECT COALESCE(
         max(array_length(combination_overlaps.cmb, 1)
         ), 0) AS max_can_see
      FROM combination_overlaps
      WHERE (
         ( --Is there enough overlap
            combination_overlaps.duration >= make_interval(mins => (movies_list_mv.runtime)::integer)
         ) 
         AND 
         ( --Limit the combinations to those who want to see it
            combination_overlaps.cmb <@ friend_movies.user_ids_want_to_see
         )
      )
   ) AS max_can_see
   FROM 
   ( 
      movies_list_mv
      JOIN LATERAL 
      ( -- Gets the various aggregate data selected in the main statement
         SELECT 
            count(DISTINCT friends_want_to_see_movies."user") AS want_to_see_count,
            count(DISTINCT friend_has_service."user") AS can_see_count,
            string_agg(DISTINCT (((users.first_name)::text || ' '::text) || (users.last_name)::text), ', '::text) AS users_want_to_see,
            array_agg(DISTINCT users.id) AS user_ids_want_to_see,
            string_agg(DISTINCT (((users.first_name)::text || ' '::text) || (users.last_name)::text), ', '::text) AS users_have_services,
            string_agg(DISTINCT (services.service)::text, ', '::text) AS services_available
         FROM 
         ( -- A series of nested joins to get all the data we need.
            (
               (
                  (
                     friends_want_to_see_movies
                     LEFT JOIN movie_available_on ON ((movie_available_on.movie = movies_list_mv.id))
                  )
                  LEFT JOIN friend_has_service ON (((movie_available_on.service = friend_has_service.service) AND (friends_want_to_see_movies."user" = friend_has_service."user")))
               )
               LEFT JOIN users ON ((users.id = friends_want_to_see_movies."user"))
            )
            LEFT JOIN services ON ((services.id = movie_available_on.service))
         )
         WHERE (friends_want_to_see_movies.movie = movies_list_mv.id)
      ) friend_movies ON (true)
   );

--
-- Name: people_movies
-- Purpose: A view for the people_movies material view with default sorting applied
--

CREATE VIEW people_movies AS
 SELECT people_movies_mv.id,
    people_movies_mv.imdb_id,
    people_movies_mv.name,
    people_movies_mv.movie_titles,
    people_movies_mv.sum_votes,
    people_movies_mv.categories
   FROM people_movies_mv
  ORDER BY people_movies_mv.sum_votes DESC NULLS LAST, people_movies_mv.name;




