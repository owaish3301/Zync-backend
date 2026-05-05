import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";

async function getUser(req: Request, res: Response) {
  try {
    const username = req.params.username;
    if (!username) {
      return res
        .status(400)
        .json({ error: "USERNAME_REQUIRED", message: "Username required" });
    }
    if (typeof username !== "string") {
      return res
        .status(400)
        .json({ error: "INVALID_DATA", message: "Invalid data for username" });
    }
    const user = await prisma.user.findUnique({
      where: {
        username: username,
        deletedAt: null,
        status: "ACTIVE",
      },
    });
    if(!user){
      return res.status(404).json({error:"USER_NOT_FOUND", message:"User does not exist"})
    }
    return res.status(200).json({
      user: {
        id: user?.id,
        name: user?.name,
        username: user?.username,
      },
    });
  } catch {
    return res
      .status(500)
      .json({ error: "INTERNAL_ERROR", message: "Internal error" });
  }
}

async function activateUser(req: Request, res: Response) {
  try {
    const id = req.params.id;
    if (!id) {
      return res
        .status(400)
        .json({ error: "MISSING_USER_ID", message: "User id not provided" });
    }
    if (typeof id !== "string") {
      return res
        .status(400)
        .json({ error: "INVALID_ID", message: "Provide a valid user id" });
    }
    await prisma.user.update({
      where: {
        id: id,
      },
      data: {
        status: "ACTIVE",
      },
    });
    return res.status(200).json({ message: "user activated" });
  } catch (error: unknown) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return res
          .status(404)
          .json({ error: "MISSING_USER", message: "User not found" });
      }
    }

    return res.status(500).json({
      error: "INTERNAL_SERVER_ERROR",
      message: "Internal server error occured during upgrading user",
    });
  }
}

async function banUser(req: Request, res: Response) {
  try {
    const id = req.params.id;
    if (!id) {
      return res
        .status(400)
        .json({ error: "MISSING_USER_ID", message: "User id not provided" });
    }
    if (typeof id !== "string") {
      return res
        .status(400)
        .json({ error: "INVALID_ID", message: "Provide a valid user id" });
    }
    await prisma.$transaction([
      prisma.user.update({
        where: { id },
        data: { status: "BANNED" },
      }),
      prisma.session.deleteMany({
        where: { userId: id },
      }),
    ]);

    return res.status(200).json({ message: "User banned" });
  } catch (error: unknown) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return res
          .status(404)
          .json({ error: "MISSING_USER", message: "User not found" });
      }
    }
    return res.status(500).json({
      error: "INTERNAL_SERVER_ERROR",
      message: "Error occured while banning the user",
    });
  }
}

async function deleteUser(req: Request, res: Response) {
  try {
    const id = req.params.id;
    if (!id) {
      return res
        .status(400)
        .json({ error: "MISSING_USER_ID", message: "User id not provided" });
    }
    if (typeof id !== "string") {
      return res
        .status(400)
        .json({ error: "INVALID_ID", message: "Provide a valid user id" });
    }
    await prisma.$transaction([
      prisma.user.update({
        where: { id: id },
        data: {
          deletedAt: new Date(),
        },
      }),
      prisma.session.deleteMany({
        where: { userId: id },
      }),
    ]);

    return res.status(204).send();
  } catch (error: unknown) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return res
          .status(404)
          .json({ error: "MISSING_USER", message: "User not found" });
      }
    }

    return res.status(500).json({
      error: "INTERNAL_SERVER_ERROR",
      message: "Internal server error occured during upgrading user",
    });
  }
}

export { getUser, activateUser, banUser, deleteUser };
