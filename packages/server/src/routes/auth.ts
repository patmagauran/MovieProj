import Router from "express-promise-router";
import * as db from "../db";
import { sql } from "../db";
import bcrypt from 'bcrypt';

import { getToken, COOKIE_OPTIONS, getRefreshToken, verifyUser } from "../authenticate";

import jwt, { JwtPayload } from "jsonwebtoken";
import passport from "passport";
import { UserType, testUser } from "../models/users"
import { QueryResult } from "pg";
import { getErrorMessage } from "../utilities";
import e from "express";
export const addAuthRoutes = (router: e.Router) => {

    router.post("/updatePassword", verifyUser, async (req: any, res: any) => {
        const user = req.user;
        if (!user) {
            res.statusCode = 401;
            res.send({ status: "error" })
        }
        const client = await db.getClient();
        try {
            await db.queryWithClient(client, sql`BEGIN`);
            let passHash = await bcrypt.hash(req.body.password, 8)

            const result = await db.queryWithClient(client, 'UPDATE users SET password_hash = $1 WHERE id = $2', [passHash, user.id]);

            //console.log(result)
            let id = user.id;
            const token = getToken({ id: id })
            const refreshToken = getRefreshToken({ id: id })
            await db.queryWithClient(client, sql`DELETE FROM sessions WHERE user_id = ${id})`)

            await db.queryWithClient(client, sql`INSERT INTO sessions (user_id, refresh_token) VALUES (${id}, ${refreshToken})`)
            res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
            res.send({ success: true, token })
            await db.queryWithClient(client, sql`COMMIT`);


        }
        catch (e) {
            res.statusCode = 500
            res.send({ status: "error", error: getErrorMessage(e) })
        } finally {
            client.release();
        }
    });

    router.post("/signup", async (req, res, next) => {
        // Verify that first name is not empty
        if (!req.body.first_name) {
            res.statusCode = 500
            res.send({
                name: "FirstNameError",
                message: "The first name is required",
            })
        } else {
            const client = await db.getClient();
            try {
                await db.queryWithClient(client, sql`BEGIN`);
                let passHash = await bcrypt.hash(req.body.password, 8)
                let result = await db.queryWithClient(client, 'SELECT id FROM users WHERE username=($1)', [req.body.username])


                if (result.rows[0]) {
                    throw new Error('Sorry, this username is already taken.')
                } else {
                    result = await db.queryWithClient(client, 'INSERT INTO users (username, password_hash, first_name, last_name, email) VALUES ($1, $2, $3, $4, $5) RETURNING id', [req.body.username, passHash, req.body.first_name, req.body.last_name, req.body.email]);

                    console.log('User [' + req.body.username + '] has registered.')
                    //console.log(result)
                    let id = result.rows[0].id ?? -1;
                    console.log("User had ID: ", id);

                    const token = getToken({ id: id })
                    const refreshToken = getRefreshToken({ id: id })
                    await db.queryWithClient(client, sql`INSERT INTO sessions (user_id, refresh_token) VALUES (${id}, ${refreshToken})`)
                    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
                    res.send({ success: true, token })
                    await db.queryWithClient(client, sql`COMMIT`);

                }

            }
            catch (e) {
                res.statusCode = 500
                res.send({ status: "error", error: getErrorMessage(e) })
            } finally {
                client.release();
            }
        }

    })


    router.post("/login", passport.authenticate("local"), async (req, res, next) => {
        const token = getToken({ id: req.user.id })
        const refreshToken = getRefreshToken({ id: req.user.id })
        res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
        db.query(sql`SELECT id, username, first_name, last_name, email FROM users WHERE id = ${req.user.id}`).then(
            result => {
                if (result.rowCount > 0) {
                    db.query(sql`INSERT INTO sessions (user_id, refresh_token) VALUES (${req.user.id}, ${refreshToken})`).then(r => {
                        res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
                        res.send({ success: true, token })
                    }
                    ).catch(err => {
                        res.statusCode = 500
                        res.send({ status: "error", error: getErrorMessage(err) })
                    })
                } else {
                    next(Error("USER NOT FOUND"))
                }
            }
        )
    })


    router.post("/refreshToken", async (req, res, next) => {
        const { signedCookies = {} } = req
        const { refreshToken } = signedCookies

        if (refreshToken) {
            try {
                const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET! as string) as JwtPayload
                const userId = payload.id
                db.query(sql`SELECT id, username, first_name, last_name, email FROM users WHERE id = ${userId}`).then(
                    result => {
                        if (result.rowCount > 0) {
                            db.query(sql`SELECT user, refresh_token FROM sessions WHERE refresh_token = ${refreshToken}`).then(r => {
                                if (r.rowCount > 0) {
                                    const token = getToken({ id: userId })
                                    // If the refresh token exists, then create new one and replace it.
                                    const newRefreshToken = getRefreshToken({ id: userId })
                                    db.query(sql`UPDATE sessions SET refresh_token = ${newRefreshToken} WHERE refresh_token = ${refreshToken}`).then(resu => {
                                        res.cookie("refreshToken", newRefreshToken, COOKIE_OPTIONS)
                                        res.send({ success: true, token })
                                    }).catch(err => {
                                        res.statusCode = 500
                                        res.send({ status: "error", error: getErrorMessage(err) })
                                    })


                                } else {
                                    res.statusCode = 401
                                    res.send("Unauthorized")
                                }

                            }
                            ).catch(err => {
                                res.statusCode = 500
                                res.send({ status: "error", error: getErrorMessage(err) })
                            })
                        } else {
                            res.statusCode = 401
                            res.send("Unauthorized")
                        }
                    }
                ).catch(err => {
                    next(err)
                })
            } catch (err) {
                res.statusCode = 401
                res.send("Unauthorized")
            }
        } else {
            res.statusCode = 401
            res.send("Unauthorized")
        }
    })




    router.get("/logout", verifyUser, (req, res, next) => {
        const { signedCookies = {} } = req
        const { refreshToken } = signedCookies
        db.query(sql`SELECT id, username, first_name, last_name, email FROM users WHERE id = ${req.user.id}`).then(
            result => {
                if (result.rowCount > 0) {
                    db.query(sql`DELETE FROM sessions WHERE refresh_token = ${refreshToken}`).then(r => {

                        res.clearCookie("refreshToken", COOKIE_OPTIONS)
                        res.send({ success: true })
                    }).catch(err => {
                        res.statusCode = 500
                        res.send({ status: "error", error: getErrorMessage(err) })
                    })
                } else {
                    res.statusCode = 401
                    res.send("Unauthorized")
                }
            }
        ).catch(err => {
            next(err)
        })


    })



}


