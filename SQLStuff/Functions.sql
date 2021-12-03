

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
            RETURN new;
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