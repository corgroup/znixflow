import type { TenantContext } from "../../domain/src/index.js";
export interface Provider {
  send(input: {
    tenant: TenantContext;
    messageId: string;
    templateVersionId: string;
  }): Promise<
    | { outcome: "accepted"; providerMessageId: string }
    | { outcome: "unknown" | "rejected"; code: string; retryable: boolean }
  >;
}
