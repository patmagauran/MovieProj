import e from "express";
import bcrypt from 'bcrypt';
import passport from "passport"
import { Strategy as LocalStrategy } from "passport-local"
import * as db from "../db";
import { sql } from "../db";
import { testUser, UserType } from "../models/users";
import { QueryResult } from "pg";

//Called during login/sign up.
passport.use(new LocalStrategy((username, password, done) => {

    // if (username == testUser.username && password == testUser.password) {
    //     cb(null, testUser);
    // } else {
    //     cb(null, false);
    // }
    db.query('SELECT id, username, password_hash, first_name, last_name, email FROM users WHERE username=$1', [username]).then((result: QueryResult<UserType>) => {
        if (result.rows.length > 0) {
            const first = result.rows[0]
            bcrypt.compare(password, first.password_hash).then((res: boolean) => {
                if (res) {
                    done(null, first)
                } else {
                    done(null, false)
                }
            })
        } else {
            done(null, false)
        }
    }).catch(err => {
        if (err) {
            console.error('Error when selecting user on login', err)
            return done(err)
        }
    })
}))

//called while after logging in / signing up to set user details in req.user
passport.serializeUser((user: UserType, done) => {
    done(null, user.id)
})

passport.deserializeUser((id: string, done) => {
    // cb(null, testUser);
    db.query('SELECT  id, username, first_name, last_name, email FROM users WHERE id = $1', [parseInt(id, 10)]).then((results: QueryResult<UserType>) => {


        done(null, results.rows[0])
    }).catch(err => {
        if (err) {
            console.error('Error when selecting user on session deserialize', err)
            return done(err)
        }
    })
})