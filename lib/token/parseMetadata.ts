interface TokenMetadata {
  name?: string;
  description?: string;
  image?: string;
  animation_url?: string;
  external_url?: string;
  attributes?: Array<{ trait_type?: string; value: string | number }>;
}

export default function parseMetadata(metadata: unknown): TokenMetadata | null {
  if (!metadata) return null;
  if (typeof metadata === 'string') {
    try {
      return JSON.parse(metadata) as TokenMetadata;
    } catch {
      return null;
    }
  }
  return metadata as TokenMetadata;
}
