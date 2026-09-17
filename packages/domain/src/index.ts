export type TenantContext = Readonly<{
  organizationId: string;
  brandId: string;
  environmentId: string;
}>;
export type MessagePurpose = "transactional" | "marketing";
export function eligible(input: {
  purpose: MessagePurpose;
  marketingConsent: boolean;
  marketingOptOut: boolean;
  suppressed: boolean;
  frequencyExceeded: boolean;
}): boolean {
  if (input.suppressed || input.frequencyExceeded) return false;
  return (
    input.purpose === "transactional" ||
    (input.marketingConsent && !input.marketingOptOut)
  );
}
