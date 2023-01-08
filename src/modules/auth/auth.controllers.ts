import { Request, Response } from "express";

import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { User } from "../../models/User";

import config from "../../config/index";

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
      expiresIn: "3s",
    });

    // Generate JWT refresh token
    const refreshToken = jwt.sign({ userId: user._id }, config.jwtSecret, {
      expiresIn: "20s",
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
      message: "login successfull",
    });
  } catch (error) {
    res.status(500).send({ error: "Error logging in" });
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
    expiresIn: "7d",
  });

  // Save the refresh token in the database
  user.refreshToken = refreshToken;
  await user.save();

  res.setHeader("Access-Token", accessToken);
  res.cookie("Refresh-Token", refreshToken, {
    httpOnly: true,
    secure: true,
  });

  // Send the response
  res.send({
    message: "Successfully registered",
  });
};

// function generateJWT(user: any) {
//   const accessToken = jwt.sign({
//     id: user._id,
//     email: user.email
//   }, process.env.JWT_SECRET, {
//     expiresIn: '15m'
//   });

//   const refreshToken = jwt.sign({
//     id: user._id,
//     email: user.email
//   }, process.env.JWT_SECRET, {
//     expiresIn: '7d'
//   });

//   return { accessToken, refreshToken };
// }
