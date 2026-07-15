import { getEnv } from '../../../config/env'

/**
 * Browser calls to some AI APIs are blocked by CORS.
 * - Dev: Vite proxies `/api/{name}` → provider origin
 * - Prod: optional `VITE_*_PROXY_URL` relay
 */
export function resolveProviderBase(
  directOrigin: string,
  proxyEnvKey: string,
  devProxyPath: string
): string {
  const relay = getEnv(proxyEnvKey)?.replace(/\/$/, '')
  if (relay) return relay
  if (import.meta.env.DEV) return devProxyPath
  return directOrigin
}
