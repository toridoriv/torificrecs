import { toUppercase } from "@utilities/string.ts";
import { z } from "zod";

export const EmailSchema = z.string().email();

export const PathSchema = z.string().refine((v) => v.startsWith("/"));

export const UrlSchema = z.union([z.string().url(), PathSchema]);

export const NonEmptyStringSchema = z.string().min(1);

export const EnvironmentNameSchema = z.preprocess(
  toUppercase,
  z.enum(["TEST", "DEVELOPMENT", "PRODUCTION"]),
);

export const PortSchema = z.coerce.number().int().min(1024).max(9999);

export const ScriptSchema = z.object({
  async: z.boolean().optional(),
  src: UrlSchema,
  integrity: NonEmptyStringSchema.optional(),
  type: NonEmptyStringSchema.optional(),
  crossorigin: NonEmptyStringSchema.optional(),
});
