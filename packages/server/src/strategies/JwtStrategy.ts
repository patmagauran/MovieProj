import passport from "passport"
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt"
//import User from "../models/user"
import * as db from "../db";
import { sql } from "../db";
import { testUser, UserType } from "../models/users";
import { QueryResult } from "pg";
const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET! as string
}


// Used by the authenticated requests to deserialize the user,
// i.e., to fetch user details from the JWT.
passport.use(
    new JwtStrategy(opts, function (jwt_payload, done) {
        // Check against the DB only if necessary.
        // This can be avoided if you don't want to fetch user details in each request.
        // done(null, testUser);
        db.query('SELECT  id, username, first_name, last_name, email FROM users WHERE id = $1', [parseInt(jwt_payload.id, 10)]).then((results: QueryResult<UserType>) => {
            if (results.rows[0]) {

                done(null, results.rows[0])
            } else {
                return done(null, false)
                // or you could create a new account
            }

        }).catch(err => {
            if (err) {
                return done(err, false)
            }
        })
    })
)
