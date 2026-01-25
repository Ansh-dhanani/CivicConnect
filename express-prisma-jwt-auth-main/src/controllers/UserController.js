import { db } from '../utils/db.js';
import bcrypt from 'bcrypt';
import { generateTokens } from '../utils/jwt.js';
import exclude from '../services/Misc.js';

const UserController = {
  create: async (req, res) => {
    try {
      const { email, password, full_name, phone } = req.body;

      if (!email || !password || !full_name) {
        return res.status(400).json({
          message: 'Missing required fields: email, password, full_name',
          data: null,
        });
      }

      const existingUser = await db.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(400).json({
          message: 'Email already in use.',
          data: null,
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await db.user.create({
        data: {
          email,
          password: hashedPassword,
          full_name,
          phone,
        },
      });

      const userWithoutPassword = exclude(user, ['password']);

      // Generate tokens
      // We need to ensure the jwt utility handles the new user structure if it relies on specific fields, 
      // but usually it just takes the object.
      // NOTE: The previous code passed userWithoutPassword to generateTokens.
      const { accessToken, refreshToken } = generateTokens(userWithoutPassword);

      return res.status(201).json({
        success: true,
        message: 'Registration successful. Please verify your email.',
        data: {
          user_id: user.id,
          email: user.email,
          verification_sent: true,
          accessToken, // Added for convenience
          refreshToken // Added for convenience
        },
      });
    } catch (err) {
      console.error('User creation error:', err);
      return res.status(500).json({
        message: 'Internal server error.',
        data: null,
      });
    }
  },

  getProfile: async (req, res) => {
    try {
      const { userId } = req.payload;

      const user = await db.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return res.status(404).json({
          message: 'User not found.',
          data: null,
        });
      }

      const userWithoutPassword = exclude(user, ['password']);

      return res.status(200).json({
        success: true,
        data: userWithoutPassword,
      });
    } catch (err) {
      console.error('Get profile error:', err);
      return res.status(500).json({
        message: 'Internal server error.',
        data: null,
      });
    }
  },

  updateProfile: async (req, res) => {
    try {
        const { userId } = req.payload;
        const { full_name, phone, address, city, state } = req.body;
        
        const user = await db.user.update({
            where: { id: userId },
            data: { full_name, phone, address, city, state }
        });
        
        const userWithoutPassword = exclude(user, ['password']);

        return res.json({ success: true, message: 'Profile updated successfully', data: userWithoutPassword });
    } catch (error) {
        console.error('Update profile error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
  }
};

export default UserController;
