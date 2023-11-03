import { MakeRequired } from "@utilities/types.ts";

export interface PageContext extends Route.RenderViewOptions {
  subtitle: string;
}

export abstract class Page<Ctx extends PageContext> {
  public context: MakeRequired<Ctx, "helpers" | "partials">;
  readonly name: string;

  constructor(context: Ctx) {
    this.context = { helpers: {}, partials: {}, ...context };

    this.name = this.getName();
    this.init();
  }

  protected abstract init(): void;
  protected abstract getName(): string;
}
