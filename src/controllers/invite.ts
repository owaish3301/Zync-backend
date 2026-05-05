import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";

async function createInvite(req: Request, res: Response) {
  try {
    const session = req.session;
    if(!session){
      return res.status(403).json({error:"MISSING_SESSION", message:"Unauthenticated"})
    }
    let maxUses = 1;

    if (session.user.role === "SuperAdmin" && req.body.maxUses !== undefined) {
      const maxUsesInput = Number(req.body.maxUses);

      if (
        !Number.isFinite(maxUsesInput) ||
        !Number.isInteger(maxUsesInput) ||
        maxUsesInput < 1 ||
        maxUsesInput > 100
      ) {
        return res.status(400).json({
          error: "INVALID_MAX_USES",
          message: "maxUses must be an integer between 1 and 100",
        });
      }

      maxUses = maxUsesInput;
    }

    const invite = await prisma.invite.create({
      data: {
        createdBy: {
          connect: { id: session.user.id },
        },
        maxUses: maxUses,
      },
    });
    return res.status(201).json({
      message: "Invite created",
      data: { inviteCode: invite.code, expiresAt: invite.expiresAt },
    });
  } catch {
    return res.status(500).json({
      error: "INTERNAL_ERROR",
      message: "Error occured while creating invite.",
    });
  }
}

export default createInvite;
