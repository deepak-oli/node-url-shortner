import argon2 from "argon2";
import jwt from "jsonwebtoken";

import prisma from "@/db/client";
import { ENV } from "@/config/env.config";

export const registerUser = async (
  email: string,
  password: string,
  name?: string
) => {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  // Hash password
  const hashedPassword = await argon2.hash(password);

  // Create user
  const newUser = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
    },
  });

  return newUser;
};

export const loginUser = async (email: string, password: string) => {
  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !(await argon2.verify(user.password, password))) {
    throw new Error("Invalid email or password");
  }

  // Generate JWT token
  const token = jwt.sign({ sub: user.id }, ENV.JWT_SECRET!, {
    expiresIn: "24h",
  });

  return { user, token };
};

export const getUserProfile = async (userId: string) => {
  // Find user by ID
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

export const updateUserProfile = async (userId: string, updateData: any) => {
  // Update user
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      email: true,
      name: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};

export const deleteUser = async (userId: string) => {
  // Delete user account
  await prisma.user.delete({
    where: { id: userId },
  });
};

export const getAllUsers = async () => {
  // Get all users
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return users;
};
