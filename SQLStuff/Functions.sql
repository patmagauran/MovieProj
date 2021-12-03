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
-- Name: update_combos_view_trigger()
-- Purpose: Will update the combinations view
--

CREATE FUNCTION public.update_combos_view_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS 
    $$
        BEGIN
            REFRESH MATERIALIZED VIEW combination_overlaps;
        END;
    $$;

--
-- Name: update_tmdb_tr_fu()
-- Purpose: Will update the tmdb_updated field
--

CREATE FUNCTION public.update_tmdb_tr_fu() RETURNS trigger
    LANGUAGE plpgsql
    AS 
    $$
        BEGIN
            new.tmdb_updated := true;
            RETURN new;
        END;
    $$;


--
-- Name: update_tmdb_tr_fu_keyw()
-- Purpose: Will update the tmdb_updated field in a movie when a different table is updated
--

CREATE FUNCTION public.update_tmdb_tr_fu_keyw() RETURNS trigger
    LANGUAGE plpgsql
    AS 
    $$
        BEGIN
            UPDATE movies
            SET tmdb_updated = true
            WHERE movies.id = new.movie;
            RETURN NEW;
        END;
    $$;


--
-- Name: movies trig_upd
-- Purpose: Fires to update the movies table with tmdb_updated whenever one of the non imdb data fields are updated
--

CREATE TRIGGER trig_upd BEFORE UPDATE OF preview_link, language, description, poster_link ON public.movies FOR EACH ROW EXECUTE FUNCTION public.update_tmdb_tr_fu();


--
-- Name: movie_keywords trig_upd_key
-- Purpose: Fires to update the movies table with tmdb_updated whenever a keyword is added
--

CREATE TRIGGER trig_upd_key AFTER INSERT ON public.movie_keywords FOR EACH ROW EXECUTE FUNCTION public.update_tmdb_tr_fu_keyw();


--
-- Name: user_available update_combos_view_trigger_schedule_change
-- Purpose: Whenever a user changes their availability this fires to update the combination view
--

CREATE TRIGGER update_combos_view_trigger_schedule_change AFTER INSERT OR DELETE OR UPDATE OR TRUNCATE ON public.user_available FOR EACH STATEMENT EXECUTE FUNCTION public.update_combos_view_trigger();


--
-- Name: users update_combos_view_trigger_user_change
-- Purpose: Whenever a user is added or removed this fires to update the combination view
--

CREATE TRIGGER update_combos_view_trigger_user_change AFTER INSERT OR DELETE OR TRUNCATE ON public.users FOR EACH STATEMENT EXECUTE FUNCTION public.update_combos_view_trigger();