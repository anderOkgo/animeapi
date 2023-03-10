import { Request, Response } from 'express';
import connection from '../db/connection';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const addUser = async (req: Request, res: Response) => {
  const { nombre, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  connection.query(
    'INSERT INTO users set ?',
    {
      first_name: nombre,
      last_name: '',
      email: '',
      role: 1,
      password: hashedPassword,
      active: 1,
      created: '2018-01-18',
      modified: '2018-01-18',
    },
    (err, data) => {
      if (err) {
        console.log(err);
      } else {
        res.json({
          msg: data,
        });
      }
    }
  );
};

export const loginUser = (req: Request, res: Response) => {
  const { nombre, password } = req.body;

  connection.query(
    'SELECT * FROM users WHERE first_name = ' + connection.escape(nombre),
    (err, data) => {
      if (err) {
        console.log(err);
      } else {
        if (data.length == 0) {
          // user doesn't exist
          res.json({
            msg: 'User Does not exist in DB',
          });
        } else {
          // Exist
          const userPassword = data[0].password;
          // Comparing password
          bcrypt.compare(password, userPassword).then((result) => {
            if (result) {
              // Login success -- creating token
              const token = jwt.sign(
                {
                  nombre: nombre,
                },
                process.env.SECRET_KEY || 'enterkey'
              );

              res.json({
                token,
              });
            } else {
              // wrong Password
              res.json({
                msg: 'Wrong Password',
              });
            }
          });
        }
      }
    }
  );
};
