import { MakeRequired } from "@utilities/types.ts";

/**
 * Common context passed to all page component classes.
 */
export interface PageContext extends Route.RenderViewOptions {
  /**
   * The subtitle to display on the page.
   */
  subtitle: string;
}

/**
 * Abstract base class for page components.
 *
 * Contains common properties and methods for page components.
 * Subclasses should implement `init()` and `getName()`.
 */
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
