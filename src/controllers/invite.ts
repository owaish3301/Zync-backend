import type { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";

async function createInvite(req: Request, res: Response, next: NextFunction) {
  try {
    const session = req.session;
    const maxUses = session!.user.role === "SuperAdmin" ? req.body.maxUses : 1;

    const invite = await prisma.invite.create({
      data: {
        createdBy: {
          connect: { id: session!.user.id },
        },
        maxUses: maxUses,
      },
    });
    return res.status(201).json({
      message: "Invite created",
      data: { inviteCode: invite.code, expiresAt: invite.expiresAt },
    });
  } catch (error) {
    return res.status(500).json({
      error: "INTERNAL_ERROR",
      message: "Error occured while creating invite.",
    });
  }
}

export default createInvite;
