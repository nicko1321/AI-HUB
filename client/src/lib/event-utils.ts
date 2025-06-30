import type { Event } from "@shared/schema";

// Helper to safely extract metadata properties
export function getMetadataProperty(metadata: unknown, key: string): string | null {
  if (metadata && typeof metadata === 'object' && metadata !== null && key in metadata) {
    const value = (metadata as Record<string, unknown>)[key];
    return typeof value === 'string' ? value : String(value);
  }
  return null;
}

// Helper to check if metadata has a specific property value
export function hasMetadataValue(metadata: unknown, key: string, value: string): boolean {
  const metadataValue = getMetadataProperty(metadata, key);
  return metadataValue === value;
}

// Helper to render metadata badges for events
export function renderMetadataBadges(event: Event) {
  const badges = [];
  
  if (hasMetadataValue(event.metadata, 'status', 'stolen')) {
    badges.push({ label: 'STOLEN', variant: 'destructive' as const });
  }
  
  if (getMetadataProperty(event.metadata, 'blacklist_reason')) {
    badges.push({ label: 'BLACKLISTED', variant: 'destructive' as const });
  }
  
  if (hasMetadataValue(event.metadata, 'watchlist_match', 'true')) {
    badges.push({ label: 'WATCHLIST', variant: 'destructive' as const });
  }
  
  const threatLevel = getMetadataProperty(event.metadata, 'threat_level');
  if (threatLevel === 'critical' || threatLevel === 'high') {
    badges.push({ label: threatLevel.toUpperCase(), variant: 'destructive' as const });
  }
  
  return badges;
}

// Helper to get vehicle information from metadata
export function getVehicleInfo(metadata: unknown): { type?: string; color?: string } {
  return {
    type: getMetadataProperty(metadata, 'vehicle_type') || undefined,
    color: getMetadataProperty(metadata, 'color') || undefined
  };
}