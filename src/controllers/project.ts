import type { Request, Response } from "express";
import slugify from "../lib/slugify";
import { prisma } from "../lib/prisma";
import projectSchema from "../schemas/project";

async function createProject(req: Request, res: Response) {
  try {
    const { title, shortDescription, fullDescription, techStack } = req.body;

    const session = req.session;
    if (!session) {
      return res
        .status(400)
        .json({ error: "MISSING_SESSION", message: "Unauthenticated" });
    }
    const user = session.user;

    const zodValidation = projectSchema.safeParse({
      title,
      shortDescription,
      fullDescription,
      techStack,
    });
    if (!zodValidation.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: zodValidation.error.issues[0]?.message,
        },
      });
    }
    const slug = slugify(zodValidation.data.title);
    const existing = await prisma.project.findFirst({
      where: { maintainerId: user.id, slug, deletedAt: null },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        error: {
          code: "CONFLICT",
          message: "A project with similar name already exists",
        },
      });
    }
    const project = await prisma.project.create({
      data: {
        fullDescription: zodValidation.data.fullDescription,
        shortDescription: zodValidation.data.shortDescription,
        slug: slug,
        title: zodValidation.data.title,
        techStack: zodValidation.data.techStack,
        maintainer: { connect: { id: user.id } },
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { deletedAt, ...safeProject } = project;
    return res
      .status(201)
      .json({
        message: "Project created successfully",
        data: { ...safeProject },
      });
  } catch {
    return res
      .status(500)
      .json({
        code: "INTERNAL_SERVER_ERROR",
        message: "Internal server error",
      });
  }
}

export { createProject };
