export type FeaturePayload<T> = {
  isEnabled: true;
} & T;

export type DisabledFeature = {
  isEnabled: false;
};

export type Feature<T = Record<string, never>> = FeaturePayload<T> | DisabledFeature;

export function getFeaturePayload<T>(feature: Feature<T>): T | null {
  if (feature.isEnabled) {
    const { isEnabled: _, ...rest } = feature as FeaturePayload<T>;
    return rest as T;
  }
  return null;
}
