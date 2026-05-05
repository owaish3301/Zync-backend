import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";

async function createInvite(req: Request, res: Response) {
  try {
    const session = req.session;
    if(!session){
      return res.status(403).json({error:"MISSING_SESSION", message:"Unauthenticated"})
    }
    const maxUsesBody = Number(req.body.maxUses);
    const maxUses = session.user.role === "SuperAdmin" ? isNaN(maxUsesBody)?1:maxUsesBody>0?maxUsesBody:1 : 1;
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
  } catch {
    return res.status(500).json({
      error: "INTERNAL_ERROR",
      message: "Error occured while creating invite.",
    });
  }
}

export default createInvite;
