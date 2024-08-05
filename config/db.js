import sql from 'mssql'

export const poolPromise = sql.connect({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    // not sure if needed
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
})

export { sql }
