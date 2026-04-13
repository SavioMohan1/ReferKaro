'use client'

import { useEffect, useState, useCallback } from 'react'
import { Bell, BellOff, ExternalLink, CheckCheck, Mail, ShieldCheck, AlertCircle, CheckCircle } from 'lucide-react'

interface Notification {
    id: string
    type: string
    title: string
    body: string | null
    job_link: string | null
    is_read: boolean
    created_at: string
}

const typeIcon: Record<string, { icon: React.ReactNode; accent: string }> = {
    accepted:           { icon: <CheckCircle size={16} />, accent: '#00F064' },
    pooling_accepted:   { icon: <CheckCircle size={16} />, accent: '#00F0FF' },
    selected:           { icon: <AlertCircle size={16} />, accent: '#FFD700' },
    rejected:           { icon: <BellOff size={16} />,     accent: '#FF6B6B' },
    system:             { icon: <Bell size={16} />,        accent: '#A78BFA' },
    job_approved:       { icon: <ShieldCheck size={16} />, accent: '#00F064' },
    job_rejected:       { icon: <ShieldCheck size={16} />, accent: '#FF6B6B' },
}

function timeAgo(dateStr: string) {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
    if (diff < 60) return `${diff}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
}

export default function InboxPanel() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)
    const [unreadCount, setUnreadCount] = useState(0)

    const fetchNotifications = useCallback(async () => {
        const res = await fetch('/api/notifications')
        if (res.ok) {
            const data = await res.json()
            setNotifications(data.notifications || [])
            setUnreadCount((data.notifications || []).filter((n: Notification) => !n.is_read).length)
        }
        setLoading(false)
    }, [])

    useEffect(() => { fetchNotifications() }, [fetchNotifications])

    const markRead = async (id: string) => {
        await fetch('/api/notifications/read', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notificationId: id })
        })
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
        setUnreadCount(prev => Math.max(0, prev - 1))
    }

    const markAllRead = async () => {
        await fetch('/api/notifications/read', { method: 'PUT' })
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
        setUnreadCount(0)
    }

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#6B7A99' }}>
                Loading inbox…
            </div>
        )
    }

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ position: 'relative' }}>
                        <Mail size={20} color="#00F0FF" />
                        {unreadCount > 0 && (
                            <span style={{
                                position: 'absolute', top: -6, right: -8,
                                background: '#FF4444', color: '#fff', fontSize: '0.6rem',
                                fontWeight: 700, borderRadius: 99, padding: '1px 5px', minWidth: 16, textAlign: 'center'
                            }}>{unreadCount}</span>
                        )}
                    </div>
                    <h3 style={{ color: '#E8EDF5', fontSize: '1rem', fontWeight: 700 }}>
                        Inbox {unreadCount > 0 && <span style={{ color: '#6B7A99', fontWeight: 400, fontSize: '0.85rem' }}>({unreadCount} unread)</span>}
                    </h3>
                </div>
                {unreadCount > 0 && (
                    <button onClick={markAllRead} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'transparent', border: 'none', color: '#00F0FF', fontSize: '0.78rem', cursor: 'pointer' }}>
                        <CheckCheck size={13} /> Mark all read
                    </button>
                )}
            </div>

            {/* Notifications list */}
            {notifications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 0', color: '#6B7A99' }}>
                    <Mail size={36} strokeWidth={1.2} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.4 }} />
                    <p style={{ fontSize: '0.88rem' }}>Your inbox is empty</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {notifications.map(n => {
                        const { icon, accent } = typeIcon[n.type] || typeIcon.system
                        return (
                            <div
                                key={n.id}
                                onClick={() => !n.is_read && markRead(n.id)}
                                style={{
                                    background: n.is_read ? 'rgba(255,255,255,0.02)' : 'rgba(0,240,255,0.05)',
                                    border: `1px solid ${n.is_read ? 'rgba(255,255,255,0.06)' : 'rgba(0,240,255,0.18)'}`,
                                    borderRadius: 12,
                                    padding: '14px 16px',
                                    cursor: n.is_read ? 'default' : 'pointer',
                                    transition: 'border-color 0.2s',
                                    position: 'relative'
                                }}
                            >
                                {/* Unread dot */}
                                {!n.is_read && (
                                    <span style={{ position: 'absolute', top: 14, right: 14, width: 7, height: 7, borderRadius: '50%', background: accent }} />
                                )}

                                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                    {/* Icon */}
                                    <div style={{ color: accent, marginTop: 2, flexShrink: 0 }}>{icon}</div>

                                    {/* Content */}
                                    <div style={{ flex: 1 }}>
                                        <div style={{ color: '#E8EDF5', fontSize: '0.88rem', fontWeight: 600, marginBottom: 4 }}>
                                            {n.title}
                                        </div>
                                        {n.body && (
                                            <div style={{ color: '#8896B3', fontSize: '0.8rem', lineHeight: 1.5, marginBottom: 8 }}>
                                                {n.body}
                                            </div>
                                        )}
                                        {n.job_link && (
                                            <a
                                                href={n.job_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={e => e.stopPropagation()}
                                                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#00F0FF', fontSize: '0.78rem', textDecoration: 'none', border: '1px solid rgba(0,240,255,0.25)', padding: '4px 10px', borderRadius: 6, marginBottom: 6 }}
                                            >
                                                <ExternalLink size={11} /> Apply to Job Posting
                                            </a>
                                        )}
                                        <div style={{ color: '#4A5568', fontSize: '0.72rem' }}>{timeAgo(n.created_at)}</div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
