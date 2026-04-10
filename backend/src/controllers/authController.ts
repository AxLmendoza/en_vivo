import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { createError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response) => {
  const { email, username, password, name } = req.body;

  // Check if user already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email },
        { username }
      ]
    }
  });

  if (existingUser) {
    throw createError('User already exists', 409);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      username,
      password: hashedPassword,
      name
    },
    select: {
      id: true,
      email: true,
      username: true,
      name: true,
      createdAt: true
    }
  });

  // Generate tokens
  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  // Save refresh token
  await prisma.session.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    }
  });

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user,
      accessToken,
      refreshToken
    }
  });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Find user
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw createError('Invalid credentials', 401);
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw createError('Invalid credentials', 401);
  }

  // Generate tokens
  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  // Save refresh token
  await prisma.session.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    }
  });

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name
      },
      accessToken,
      refreshToken
    }
  });
};

export const logout = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (token) {
    // Invalidate refresh token
    await prisma.session.deleteMany({
      where: { token }
    });
  }

  res.json({
    success: true,
    message: 'Logout successful'
  });
};

export const getProfile = async (req: Request, res: Response) => {
  const userId = (req as any).userId;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      name: true,
      avatar: true,
      bio: true,
      createdAt: true,
      updatedAt: true
    }
  });

  if (!user) {
    throw createError('User not found', 404);
  }

  res.json({
    success: true,
    data: user
  });
};

export const refresh = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw createError('Refresh token required', 400);
  }

  // Verify refresh token
  const session = await prisma.session.findUnique({
    where: { token: refreshToken },
    include: { user: true }
  });

  if (!session || session.expiresAt < new Date()) {
    throw createError('Invalid refresh token', 401);
  }

  // Generate new access token
  const accessToken = generateAccessToken(session.userId);

  res.json({
    success: true,
    data: { accessToken }
  });
};

function generateAccessToken(userId: string) {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: '15m' }
  );
}

function generateRefreshToken(userId: string) {
  return jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
    { expiresIn: '7d' }
  );
}