import { Page, PageContext } from "@pages/_page.ts";

export interface ErrorPageContext extends PageContext {
  status: number;
  error: string;
  message: string;
  partials: {
    message: (context: ErrorPageContext, options?: RuntimeOptions) => string;
  };
}

export class ErrorPage extends Page<ErrorPageContext> {
  protected getName(): string {
    return "error";
  }

  protected init(): void {
  }
}
