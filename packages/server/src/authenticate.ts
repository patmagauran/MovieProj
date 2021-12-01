import passport from "passport"
import jwt from "jsonwebtoken"
import { UserType } from "./models/users"
import { CookieOptions } from "express"
const dev = process.env.NODE_ENV !== "production"

export const COOKIE_OPTIONS: CookieOptions = {
    httpOnly: true,
    // Since localhost is not having https protocol,
    // secure cookies do not work correctly (in postman)
    secure: !dev,
    signed: true,
    maxAge: eval(process.env.REFRESH_TOKEN_EXPIRY! as string) * 1000,
    sameSite: "none",
}

export const getToken = (user: string | object | Buffer) => {
    return jwt.sign(user, process.env.JWT_SECRET! as string, {
        expiresIn: eval(process.env.SESSION_EXPIRY! as string),
    })
}

export const getRefreshToken = (user: string | object | Buffer) => {
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET! as string, {
        expiresIn: eval(process.env.REFRESH_TOKEN_EXPIRY! as string),
    })
    return refreshToken
}
export const verifyUser = passport.authenticate("jwt", { session: false })