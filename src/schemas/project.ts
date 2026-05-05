import { z } from "zod";

const projectSchema = z.object({
  title: z
    .string({ error: "Title must be a string" })
    .min(1, "Title is required")
    .max(100),
  shortDescription: z
    .string({ error: "Short description must be a string" })
    .min(1, "Short description is required")
    .max(300),
  fullDescription: z
    .string({ error: "Full description must be a string" })
    .min(1),
  techStack: z
    .array(z.string({ error: "Each tech stack item must be a string" }), {
      error: "Tech stack must be an array",
    })
});
export default projectSchema;
export type CreateProjectInput = z.infer<typeof projectSchema>;