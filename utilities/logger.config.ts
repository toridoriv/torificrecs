import { SafeAny } from "@utilities/types.ts";
import ansicolors from "ansi-colors";
import { z } from "zod";

export namespace LoggerConfig {
  export const SeverityName = {
    Silent: "SILENT",
    Debug: "DEBUG",
    Informational: "INFORMATIONAL",
    Warning: "WARNING",
    Error: "ERROR",
  } as const;

  export const SeverityNameSchema = z.nativeEnum(SeverityName);

  export type SeverityName = z.output<typeof SeverityNameSchema>;

  export const SeverityLevel = {
    [SeverityName.Silent]: 0,
    [SeverityName.Debug]: 1,
    [SeverityName.Informational]: 2,
    [SeverityName.Warning]: 3,
    [SeverityName.Error]: 4,
  } as const;

  export const SeverityLevelSchema = z.nativeEnum(SeverityLevel);

  export type SeverityLevel = z.output<typeof SeverityLevelSchema>;

  export const SeverityNameByLevel = {
    [SeverityLevel[SeverityName.Silent]]: SeverityName.Silent,
    [SeverityLevel[SeverityName.Debug]]: SeverityName.Debug,
    [SeverityLevel[SeverityName.Informational]]: SeverityName.Informational,
    [SeverityLevel[SeverityName.Warning]]: SeverityName.Warning,
    [SeverityLevel[SeverityName.Error]]: SeverityName.Error,
  } as const;

  export const LevelName = {
    Error: "ERROR",
    Warn: "WARN",
    Info: "INFO",
    Http: "HTTP",
    Debug: "DEBUG",
  } as const;

  export const LevelNameSchema = z.nativeEnum(LevelName);

  export type LevelName = z.output<typeof LevelNameSchema>;

  export const Mode = {
    Pretty: "PRETTY",
    Json: "JSON",
  } as const;

  export const ModeSchema = z.nativeEnum(Mode);

  export type Mode = z.output<typeof ModeSchema>;

  export const TransportSchema = z
    .function()
    .returns(z.void());

  export const TransportsSchema = z.object({
    [SeverityName.Silent]: TransportSchema,
    [SeverityName.Debug]: TransportSchema,
    [SeverityName.Informational]: TransportSchema,
    [SeverityName.Warning]: TransportSchema,
    [SeverityName.Error]: TransportSchema,
  });

  export const TransportDefaults = {
    [SeverityName.Silent]: doNothing,
    [SeverityName.Debug]: console.debug,
    [SeverityName.Informational]: console.info,
    [SeverityName.Warning]: console.warn,
    [SeverityName.Error]: console.error,
  };

  function doNothing(..._: SafeAny[]) {
    return;
  }

  const sharedTemplate = `${
    ansicolors.bold.dim(
      "{@timestamp}",
    )
  } {log.level} [${ansicolors.bold.white("{log.logger}")}]`;

  const prettyTemplate = `${sharedTemplate} ${
    ansicolors.dim(
      "{log.origin.file.path}:{log.origin.file.line}:{log.origin.file.column}",
    )
  } ${ansicolors.yellow("{message}")} {data}`;

  const prettyHttpTemplate = `${sharedTemplate} "${
    ansicolors.bold.greenBright(
      "{http.request.method} {http.request.url.original}",
    )
  } ${
    ansicolors.bold.green.dim(
      "HTTP/{http.version}",
    )
  }" {http.response.status_code} ${ansicolors.bold.dim("{event.duration}ms")}`;

  const prettyErrorTemplate = `${sharedTemplate} ${
    ansicolors.dim(
      "{log.origin.file.path}:{log.origin.file.line}:{log.origin.file.column}",
    )
  } ${ansicolors.yellow("{message}")}\n${ansicolors.bold.bgRed("{error.id}")}: ${
    ansicolors.bold("{error.message}")
  } {error.stack_trace}`;

  export const Theme = {
    [LevelName.Error]: ansicolors.bold.red,
    [LevelName.Warn]: ansicolors.bold.yellow,
    [LevelName.Info]: ansicolors.bold.green,
    [LevelName.Http]: ansicolors.bold.cyan,
    [LevelName.Debug]: ansicolors.bold.blue,
  } as const;

  export const HttpStatusTheme = {
    Informational: ansicolors.bold.cyan,
    Successful: ansicolors.bold.cyan,
    Redirection: ansicolors.bold.yellow,
    Error: ansicolors.bold.red,
    Default: ansicolors.bold,
  } as const;

  export const SettingsSchema = z.object({
    severity: SeverityNameSchema,
    application: z.string(),
    environment: z.string(),
    module: z.string().optional(),
    id: z.string().optional(),
    version: z.string().optional(),
    padding: z
      .number()
      .int()
      .default(LevelName.Debug.length + 1),
    mode: ModeSchema,
    transports: TransportsSchema.default(TransportDefaults),
    prettyTemplate: z.string().default(prettyTemplate),
    prettyErrorTemplate: z.string().default(prettyErrorTemplate),
    prettyHttpTemplate: z.string().default(prettyHttpTemplate),
    inspectOptions: z.custom<Deno.InspectOptions>().default({
      colors: true,
    }),
  });

  export type SettingsInput = z.input<typeof SettingsSchema>;

  export type Settings = z.output<typeof SettingsSchema>;
}
