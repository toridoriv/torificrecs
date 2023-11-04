import { Page, PageContext } from "@pages/_page.ts";

/**
 * ErrorPageContext interface extends PageContext and adds additional properties specific to error pages:
 * - status: The HTTP status code
 * - error: The error name/type
 * - message: The error message
 * - partials: Template partials available on error pages
 */
export interface ErrorPageContext extends PageContext {
  /**
   * The HTTP status code.
   */
  status: number;
  /**
   * The error name/type.
   */
  error: string;
  /**
   * The error message.
   */
  message: string;
  /**
   * The partials available on error pages.
   */
  partials: {
    /**
     * A function that returns a partial for render `{{message}}`.
     * @param context
     * @param options
     * @returns
     */
    message: (context: ErrorPageContext, options?: RuntimeOptions) => string;
  };
}

/**
 * Represents an error page in the application.
 */
export class ErrorPage extends Page<ErrorPageContext> {
  protected getName(): string {
    return "error";
  }

  protected init(): void {
  }
}
