declare global {
    namespace NodeJS {
        interface ProcessEnv {
            JWT_SECRET: string,
            REFRESH_TOKEN_SECRET: string,
            SESSION_EXPIRY: string,
            REFRESH_TOKEN_EXPIRY: string,
            MONGO_DB_CONNECTION_STRING: string,
            COOKIE_SECRET: string,
            WHITELISTED_DOMAINS: string,
            NODE_ENV: 'development' | 'production';
            PORT?: string;
            PWD: string;
        }
    }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export { }