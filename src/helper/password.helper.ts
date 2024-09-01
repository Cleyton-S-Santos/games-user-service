import {compare, hashSync} from "bcrypt"

export const hashPassword = (password: string) => {
    return hashSync(password, 10)
}

export const verifyPassword = (dbPass: string, requestPassword: string) => {
    return compare(requestPassword, dbPass);
}