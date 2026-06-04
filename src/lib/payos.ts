import { PayOS } from "@payos/node";

import { env, hasPayOSConfig } from "@/lib/env";

export function getPayOSClient() {
  if (!hasPayOSConfig()) {
    return null;
  }

  return new PayOS({
    clientId: env.PAYOS_CLIENT_ID!,
    apiKey: env.PAYOS_API_KEY!,
    checksumKey: env.PAYOS_CHECKSUM_KEY!,
  });
}
