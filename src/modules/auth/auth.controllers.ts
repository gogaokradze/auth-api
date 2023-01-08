import { Request, Response } from "express";

import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { User } from "../../models/User";

import config from "../../config/index";

interface RequestWithUserId extends Request {
  userId: string;
}

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    // Find the user with the specified email
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    // Compare the password hash stored in the database with the password provided in the request
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).send({ error: "Invalid password" });
    }

    // Generate JWT access token
    const accessToken = jwt.sign({ userId: user._id }, config.jwtSecret, {
      expiresIn: "15m",
    });

    // Generate JWT refresh token
    const refreshToken = jwt.sign({ userId: user._id }, config.jwtSecret, {
      expiresIn: "30d",
    });

    res.cookie("Access-Token", accessToken, {
      sameSite: "none",
      httpOnly: true,
      secure: true,
    });
    res.cookie("Refresh-Token", refreshToken, {
      sameSite: "none",
      httpOnly: true,
      secure: true,
    });

    // Send the response
    res.send({
      username: user.username,
      email: user.email,
    });
  } catch (error) {
    res.status(500).send({ error: "Error logging in" });
  }
};

export const logout = async (req: Request, res: Response) => {
  const user = await User.findOne({ _id: (req as RequestWithUserId).userId });
  if (user) {
    // Clear the access and refresh tokens from the cookies
    // res.clearCookie("Access-Token");
    // res.clearCookie("Refresh-Token");

    res.cookie("Access-Token", "", {
      sameSite: "none",
      httpOnly: true,
      secure: true,
    });
    res.cookie("Refresh-Token", "", {
      sameSite: "none",
      httpOnly: true,
      secure: true,
    });
    res.status(200).send("logged out");
  }
};

export const register = async (req: Request, res: Response): Promise<any> => {
  const { email, password, username } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).send({
      message: "A user with this email already exists",
    });
  }

  const user = new User({ email, password, username, refreshToken: "" });
  await user.save();

  // Generate JWT access token
  const accessToken = jwt.sign({ userId: user._id }, config.jwtSecret, {
    expiresIn: "15m",
  });

  // Generate JWT refresh token
  const refreshToken = jwt.sign({ userId: user._id }, config.jwtSecret, {
    expiresIn: "30d",
  });

  // Save the refresh token in the database
  user.refreshToken = refreshToken;
  await user.save();

  res.cookie("Access-Token", accessToken, {
    sameSite: "none",
    httpOnly: true,
    secure: true,
  });
  res.cookie("Refresh-Token", refreshToken, {
    sameSite: "none",
    httpOnly: true,
    secure: true,
  });

  res.send({
    message: "Successfully registered",
  });
};

export const getUserInfo = async (req: Request, res: Response): Promise<any> => {
  const userId = (req as RequestWithUserId).userId;

  if (userId) {
    const user = await User.findOne({ _id: userId });
    const userData = { username: user?.username, email: user?.email };

    return res.status(200).send(userData);
  }

  res.status(404).send("no user found");
};
