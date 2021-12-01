import bcrypt from 'bcrypt'
import * as db from '../db'

import { Strategy as LocalStrategy } from 'passport-local'

let accData = []

const setupPassport = (passport: any) => {
    passport.serializeUser(function (user: any, done: (arg0: null, arg1: any) => void) {
        done(null, user);
    });
    passport.deserializeUser(function (user: any, done: (arg0: null, arg1: any) => void) {
        done(null, user);
    });

    passport.use('login', new LocalStrategy({
        passReqToCallback: true
    },
        function (req, username, password, done) {
            loginUser()
            async function loginUser() {
                const client = await db.getClient()
                try {
                    await client.query('BEGIN')
                    var accData = await JSON.stringify(client.query('SELECT id, "username", "password" FROM "users" WHERE "username"=$1', [username], (err: any, result: { rows: { id: number, username: string, password_hash: string }[] }) => {
                        if (err) {
                            return done(err)
                        }

                        if (result.rows[0] == null) {
                            return done(null, false, { message: "Incorrect username or password" })
                        } else {
                            bcrypt.compare(password, result.rows[0].password_hash, (err, valid) => {
                                if (err) {
                                    console.log("Error on password validation")
                                    return done(err)
                                }
                                if (valid) {
                                    console.log('User [' + req.body.username + '] has logged in.')
                                    return done(null, { username: result.rows[0].username })
                                } else {
                                    return done(null, false, { message: "Incorrect username or password" })
                                }
                            })
                        }
                    }))
                }
                catch (e) {
                    throw (e)
                }
            }
        }))

    passport.use('register', new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true
    },
        function (req, username, password, done) {
            registerUser()
            async function registerUser() {
                const client = await db.getClient()
                try {
                    await client.query('BEGIN')
                    let passHash = await bcrypt.hash(req.body.password, 8)
                    await JSON.stringify(client.query('SELECT id FROM users WHERE username=($1)', [req.body.username], (err: any, result: { rows: any[] }) => {
                        if (err) {
                            return done(err)
                        }

                        if (!testUser(req.body.username)) {
                            return done(null, false, { message: 'Please provide a valid username' })
                        }
                        else if (!testPass(req.body.password)) {
                            return done(null, false, { message: 'Please provide a valid password' })
                        } else {
                            if (result.rows[0]) {
                                return done(null, false, { message: 'Sorry, this username is already taken.' })
                            } else {
                                client.query('INSERT INTO users (username, password, full_name, last_name, email) VALUES ($1, $2, $3, $5, $5)', [req.body.username, passHash, req.body.full_name, req.body.last_name, req.body.email], (err: any, result: any) => {
                                    if (err) {
                                        console.log(err)
                                    }
                                    else {
                                        client.query('COMMIT')
                                        console.log('User [' + req.body.username + '] has registered.')
                                        //console.log(result)
                                        return done(null, { username: req.body.username })
                                    }
                                });
                            }
                        }
                    }))
                }
                catch (e) {
                    throw (e)
                }
            }
        }))

    passport.use('updatePassword', new LocalStrategy({
        usernameField: 'password',
        passwordField: 'newpass',
        passReqToCallback: true
    },
        function (req, password, newpass, done) {
            let username = (req.user.username).toLowerCase()
            updatePassword()
            async function updatePassword() {
                const client = await db.getClient()
                try {
                    await client.query('BEGIN')
                    let newPassHash = await bcrypt.hash(req.body.newpass, 8)
                    var accData = await JSON.stringify(client.query('SELECT id, "username", "password" FROM "users" WHERE "username"=$1', [req.user.username.toLowerCase()], (err: any, result: { rows: { password: string }[] }) => {
                        if (err) {
                            return done(err)
                        }

                        if (!testPass(req.body.password)) {
                            return done(null, false, { message: 'Please provide a valid password' })
                        } else if (!testPass(req.body.newpass)) {
                            return done(null, false, { message: 'Please provide a valid password' })
                        } else {
                            if (result.rows[0] == null) {
                                return done(null, false, { message: 'Error on changing password. Please try again' })
                            } else {
                                bcrypt.compare(req.body.password, result.rows[0].password, (err, valid) => {
                                    if (err) {
                                        console.log("Error on current password validation")
                                        return done(err)
                                    }
                                    if (valid) {
                                        client.query('UPDATE users SET password=($1) WHERE username=($2)', [newPassHash, req.user.username], (err: any, result: any) => {
                                            if (err) {
                                                console.log(err)
                                            }
                                            else {
                                                client.query('COMMIT')
                                                console.log('User [' + req.user.username + '] has updated their password.')
                                                //console.log(result)
                                                return done(null, { username: req.user.username }, { message: 'Your password has been updated.' })
                                            }
                                        });
                                    } else {

                                        return done(null, false, { message: "Incorrect current password entered" })
                                    }
                                })
                            }
                        }
                    }))
                }
                catch (e) {
                    throw (e)
                }
            }
        }))
}

function testUser(input: string) {
    let format = /^[a-zA-Z0-9_-]{4,16}$/
    return format.test(input)
}
function testPass(input: string) {
    let format = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,128}$/
    return format.test(input)
}