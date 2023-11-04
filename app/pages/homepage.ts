import { Page, PageContext } from "@pages/_page.ts";

/**
 * Represents the homepage of the application.
 */
export class Homepage extends Page<PageContext> {
  protected getName(): string {
    return "home";
  }

  protected init(): void {
  }
}
