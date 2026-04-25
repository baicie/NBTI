/**
 * UUID generation utilities
 * RFC 4122 compliant implementation
 */

/**
 * Generate a RFC 4122 compliant UUID v4
 */
export function uuidV4(): string {
  const bytes = new Uint8Array(16)

  if (
    typeof crypto !== 'undefined'
    && typeof crypto.getRandomValues === 'function'
  ) {
    crypto.getRandomValues(bytes)
  }
  else {
    for (let i = 0; i < 16; i++) {
      bytes[i] = Math.floor(Math.random() * 256)
    }
  }

  // Set version to 0100 (version 4)
  bytes[6] = (bytes[6] & 0x0F) | 0x40
  // Set variant to 10xx
  bytes[8] = (bytes[8] & 0x3F) | 0x80

  const hex = Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(
    12,
    16,
  )}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

/**
 * Validate if a string is a valid UUID
 */
export function isUUID(value: string): boolean {
  if (typeof value !== 'string')
    return false
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  )
}

/**
 * Parse UUID string into its components
 */
export function parseUUID(uuid: string): {
  timeLow: string
  timeMid: string
  timeHiAndVersion: string
  clockSeqHiAndReserved: string
  clockSeqLo: string
  node: string
} | null {
  if (!isUUID(uuid))
    return null

  return {
    timeLow: uuid.slice(0, 8),
    timeMid: uuid.slice(9, 13),
    timeHiAndVersion: uuid.slice(14, 18),
    clockSeqHiAndReserved: uuid.slice(19, 21),
    clockSeqLo: uuid.slice(21, 23),
    node: uuid.slice(24),
  }
}

/**
 * Extract version from UUID
 */
export function uuidVersion(uuid: string): number | null {
  const parsed = parseUUID(uuid)
  if (!parsed)
    return null
  return Number.parseInt(parsed.timeHiAndVersion[0], 16)
}
