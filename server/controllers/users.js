import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { generateToken } from '../utils/auth.js';

export const signup = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const user = new User({ email, password, role });
    await user.save();

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      data: { user, token }
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      throw new Error('Invalid credentials');
    }

    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      data: { token, role: user.role }
    });
  } catch (err) {
    res.status(401).json({
      success: false,
      error: err.message
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();

    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: err.message
    });
  }
};