export const queues = [
  "event-processing",
  "eligibility",
  "message-dispatch",
  "webhook-processing",
  "template-sync",
  "scheduled-work",
  "reconciliation",
  "dead-letter-recovery",
] as const;
export type QueueReference = {
  organizationId: string;
  brandId: string;
  environmentId: string;
  recordId: string;
};
// Consumers are intentionally not registered until durable processing and tenant authorization exist.
