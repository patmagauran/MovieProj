export interface Session {
    refresh_token: string
}

export interface UserType {
    username?: String,
    password_hash: string,
    id?: number,
    first_name?: string,
    last_name?: string,
    email?: string,
    refresh_token?: Array<Session>
}

export const testUser: UserType = {
    username: "test123",
    password_hash: "test123",
    id: 1,
    first_name: "Joe",
    last_name: "Mama",
    email: "bob.3@email.com",
    refresh_token: []
}