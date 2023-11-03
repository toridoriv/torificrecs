import { Page, PageContext } from "@pages/_page.ts";

export class Homepage extends Page<PageContext> {
  protected getName(): string {
    return "home";
  }

  protected init(): void {
  }
}
