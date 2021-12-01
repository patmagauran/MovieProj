import { NextFunction, Request, Response } from "express"

type ErrorWithMessage = {
    message: string
}

function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
    return (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as Record<string, unknown>).message === 'string'
    )
}

function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
    if (isErrorWithMessage(maybeError)) return maybeError

    try {
        return new Error(JSON.stringify(maybeError))
    } catch {
        // fallback in case there's an error stringifying the maybeError
        // like with circular references for example.
        return new Error(String(maybeError))
    }
}

export function getErrorMessage(error: unknown) {
    return toErrorWithMessage(error).message
}
interface ResponseError extends Error {
    status?: number;
}
export function handleError(err: ResponseError, req: Request, res: Response, next: NextFunction) {
    var output = {
        error: {
            name: err.name,
            message: err.message,
            text: err.toString()
        }
    };
    var statusCode = err.status || 500;
    res.status(statusCode).json(output);
}