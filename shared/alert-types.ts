/**
 * Alert categorization system for Video Shield
 * Defines which events should trigger alerts vs normal notifications
 */

// Events that should trigger critical alerts (audible/visual alarms)
export const ALERT_EVENT_TYPES = [
  'weapon_detection',
  'object_analysis', // when weapons are detected
  'stolen_plate',
  'blacklisted_vehicle',
  'unauthorized_person',
  'unauthorized_access',
  'behavior_analysis', // when suspicious/dangerous behavior detected
  'security_breach'
] as const;

// Events that should be normal notifications only
export const NOTIFICATION_EVENT_TYPES = [
  'person_analysis', // normal person activity
  'license_plate', // standard plate detection
  'motion', // general motion detection
  'system', // system status updates
  'connection', // connectivity issues
  'vehicle_analysis', // general vehicle detection
  'zone_entry', // normal zone entry/exit
  'maintenance' // routine maintenance alerts
] as const;

// Severity levels that automatically trigger alerts regardless of type
export const ALERT_SEVERITY_LEVELS = ['critical', 'high'] as const;

// Severity levels for normal notifications
export const NOTIFICATION_SEVERITY_LEVELS = ['low', 'medium'] as const;

export type AlertEventType = typeof ALERT_EVENT_TYPES[number];
export type NotificationEventType = typeof NOTIFICATION_EVENT_TYPES[number];
export type AlertSeverity = typeof ALERT_SEVERITY_LEVELS[number];
export type NotificationSeverity = typeof NOTIFICATION_SEVERITY_LEVELS[number];

/**
 * Determines if an event should trigger an alert or just a notification
 */
export function shouldTriggerAlert(eventType: string, severity: string, metadata?: any): boolean {
  // Critical and high severity always trigger alerts
  if (ALERT_SEVERITY_LEVELS.includes(severity as AlertSeverity)) {
    return true;
  }
  
  // Specific event types that always trigger alerts
  if (ALERT_EVENT_TYPES.includes(eventType as AlertEventType)) {
    return true;
  }
  
  // Special cases based on metadata
  if (metadata) {
    // Weapon detection in object analysis
    if (eventType === 'object_analysis' && metadata.object_detected?.includes('weapon')) {
      return true;
    }
    
    // Blacklisted or stolen plates
    if (eventType === 'license_plate' && (
      metadata.blacklist_reason || 
      metadata.status === 'stolen' ||
      metadata.watchlist_match
    )) {
      return true;
    }
    
    // Unauthorized access attempts
    if (eventType === 'behavior_analysis' && (
      metadata.activity?.includes('unauthorized') ||
      metadata.threat_level === 'high'
    )) {
      return true;
    }
  }
  
  return false;
}

/**
 * Gets the alert priority level for UI styling and handling
 */
export function getAlertPriority(eventType: string, severity: string, metadata?: any): 'critical' | 'high' | 'medium' | 'low' {
  if (severity === 'critical') return 'critical';
  if (severity === 'high') return 'high';
  
  // Weapon detection is always critical
  if (eventType === 'weapon_detection' || 
      (eventType === 'object_analysis' && metadata?.object_detected?.includes('weapon'))) {
    return 'critical';
  }
  
  // Security breaches and unauthorized access
  if (eventType === 'security_breach' || eventType === 'unauthorized_access') {
    return 'high';
  }
  
  // Stolen/blacklisted vehicles
  if (eventType === 'stolen_plate' || 
      (eventType === 'license_plate' && metadata?.blacklist_reason)) {
    return 'high';
  }
  
  return severity as 'medium' | 'low';
}

/**
 * Gets the appropriate alert message for different event types
 */
export function getAlertMessage(eventType: string, title: string, description: string): string {
  const alertPrefixes = {
    weapon_detection: '🚨 WEAPON ALERT: ',
    object_analysis: '⚠️ SECURITY ALERT: ',
    stolen_plate: '🚗 VEHICLE ALERT: ',
    blacklisted_vehicle: '🚗 VEHICLE ALERT: ',
    unauthorized_person: '👤 ACCESS ALERT: ',
    unauthorized_access: '🔒 ACCESS ALERT: ',
    behavior_analysis: '⚠️ BEHAVIOR ALERT: ',
    security_breach: '🚨 SECURITY BREACH: '
  };
  
  const prefix = alertPrefixes[eventType as keyof typeof alertPrefixes] || '📢 ';
  return `${prefix}${title}`;
}