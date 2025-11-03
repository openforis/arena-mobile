export class JobCancelError extends Error {
  constructor(message?: string) {
    super(message || "Job was canceled");
    this.name = "JobCancelError";
  }
}
