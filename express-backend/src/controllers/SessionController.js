import bcrypt from 'bcrypt';
import { db } from '../utils/db.js';
import { generateAccessToken, generateTokens } from '../utils/jwt.js';
import { findUserByEmail, findUserById } from '../services/UserServices.js';
import exclude from '../services/Misc.js';
import jwt from 'jsonwebtoken';

const SessionController = {
  loginWithEmailAndPassword: async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({
          message: 'You must provide an email and a password.',
          data: null,
        });
      }

      const existingUser = await findUserByEmail(email);

      if (!existingUser) {
        return res.status(403).json({
          message: 'Invalid login credentials.',
          data: null,
        });
      }



      const validPassword = await bcrypt.compare(
        password,
        existingUser.password
      );

      if (!validPassword) {
        return res.status(403).json({
          message: 'Invalid login credentials.',
          data: null,
        });
      }

      const { accessToken, refreshToken } = generateTokens(existingUser);

      const existingUserWithoutPassword = exclude(existingUser, ['password']);

      return res.status(200).json({
        message: 'Authenticated.',
        data: {
          user: existingUserWithoutPassword,
          accessToken,
          refreshToken,
        },
      });
    } catch (err) {
      return res.status(500).json({
        message: 'Internal server error.',
        data: null,
      });
    }
  },



  show: (req, res) => {
    res.status(200).json({
      message: 'Authenticated',
      errors: null,
    });
  },

  generateAccessToken: async (req, res) => {
    try {
      const refreshToken = req.body.refreshToken;

      if (!refreshToken) {
        return res.status(403).json({
          message: 'Invalid refresh token.',
          data: null,
        });
      }

      let decoded;
      try {
        decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      } catch (err) {
        return res.status(403).json({
          message: 'Invalid refresh token.',
          data: null,
        });
      }

      const userId = decoded.userId;

      if (!userId) {
        return res.status(403).json({
          message: 'Invalid refresh token.',
          data: null,
        });
      }

      const user = await findUserById(userId);

      if (!user) {
        return res.status(403).json({
          message: 'Invalid refresh token.',
          data: null,
        });
      }

      const accessToken = generateAccessToken(user);

      return res.status(200).json({
        message: 'Access token generated.',
        data: {
          accessToken,
        },
      });
    } catch (err) {
      return res.status(500).json({
        message: 'Internal server error.',
        data: null,
      });
    }
  },
};

export default SessionController;
