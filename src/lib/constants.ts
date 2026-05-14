/**
 * Shared constants used across the ReferKaro application.
 */

export const APPLICATION_STATUS_MAP: Record<string, { label: string; color: string; bg: string; border: string }> = {
    pending:         { label: 'Pending',      color: '#FB923C', bg: 'rgba(251,146,60,0.08)',   border: 'rgba(251,146,60,0.2)' },
    selected:        { label: 'Selected',     color: '#F59E0B', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.22)' },
    payment_pending: { label: 'Pay Required', color: '#00F0FF', bg: 'rgba(0,240,255,0.06)',   border: 'rgba(0,240,255,0.18)' },
    accepted:        { label: 'Accepted',     color: '#22C55E', bg: 'rgba(34,197,94,0.07)',   border: 'rgba(34,197,94,0.2)' },
    rejected:        { label: 'Rejected',     color: '#EF4444', bg: 'rgba(239,68,68,0.07)',   border: 'rgba(239,68,68,0.2)' },
    expired:         { label: 'Expired',      color: '#6B7A99', bg: 'rgba(107,122,153,0.06)', border: 'rgba(107,122,153,0.15)' },
    referred:        { label: 'Referred',     color: '#10B981', bg: 'rgba(16,185,129,0.07)',  border: 'rgba(16,185,129,0.2)' },
}
