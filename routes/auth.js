import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import sql from 'mssql'
import { poolPromise } from '../config/db.js'
import authenticateToken from '../middleware/auth.js'
const router = express.Router()

sql.Request.prototype.add = function(parameter) {
    const p = '@' + Object.keys({ parameter })[0]
    this.input(p, parameter)

    return p
}

sql.Request.prototype.inputQuery = function(query) {
    return this.query(query(this))
}

sql.Request.prototype.insert = function(table, ...values) {
    return this.inputQuery(r => `INSERT INTO ${table} (${Object.keys(values).join()}) VALUES (${values.map(this.add).join()})`)
}

router.post('/register', async (req, res) => {
    const { email, password, role } = req.body

    // also maybe could take the name of variable so no need to repeat there
    // also maybe could take a object of request and add input like in tema where sqlb.addparam that returns like '@password'
    // await (await poolPromise).request()
    //     .input('email', email)
    //     .input('password', await bcrypt.hash(password, 10))
    //     .input('role', role)
    //     .query("INSERT INTO users (email, password, role) VALUES (@email, @password, @role)")

    // await (await poolPromise).request().inputQuery(r => `INSERT INTO users (email, password, role) VALUES (${r.add(email)}, ${r.add(password)}, ${r.add(role)})`)
    await (await poolPromise).request().insert('users', email, await bcrypt.hash(password, 10), role)

    // i dont think theres need to send anything here because logging in is better
    res.status(201).send()
})

// Log in and generate a token including user role
// router.post('/login', async (req, res) => {
//     const { username, password } = req.body;
//     try {
//       const pool = await poolPromise;
//       const result = await pool.request()
//         .input('username', sql.NVarChar, username)
//         .query('SELECT * FROM Users WHERE username = @username');
  
//       const user = result.recordset[0];
//       if (!user) return res.status(400).send('Cannot find user');
  
//       if (await bcrypt.compare(password, user.password)) {
//         const accessToken = jwt.sign(
//           { username: user.username, role: user.role },
//           process.env.JWT_SECRET,
//           { expiresIn: process.env.JWT_EXPIRES_IN }
//         );
//         res.json({ accessToken });
//       } else {
//         res.status(401).send('Not Allowed');
//       }
//     } catch (error) {
//       console.error(error);
//       res.status(500).send('Error logging in');
//     }
//   });
  
//   // Example of a protected route that requires a specific role
//   router.get('/admin', authenticateToken, (req, res) => {
//     if (req.user.role !== 'admin') {
//       return res.status(403).send('Access forbidden: Requires admin role');
//     }
//     res.send('This is an admin route');
//   });
  
//   router.get('/protected', authenticateToken, (req, res) => {
//     res.send('This is a protected route');
//   });

export default router




