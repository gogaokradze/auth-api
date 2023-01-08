import { Request, Response } from "express";
import { User } from "../../models/User";

interface RequestWithUserId extends Request {
  userId: string;
}

export const getUserInfo = async (req: Request, res: Response) => {
  const userId = (req as RequestWithUserId).userId;

  const user = await User.findOne({ _id: userId });

  res.send("ehehehe u trickster");
};
