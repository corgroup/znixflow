export interface Health {
  status: "ok" | "ready" | "unavailable";
  correlationId: string;
}
export async function fetchHealth(baseUrl: string): Promise<Health> {
  const response = await fetch(`${baseUrl}/health/ready`);
  if (!response.ok) throw new Error("API is not ready");
  return response.json() as Promise<Health>;
}
