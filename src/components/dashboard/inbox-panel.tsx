'use client'

import { useCallback, useEffect, useState } from 'react'
import { Bell, BellOff, CheckCheck, CircleCheck, ExternalLink, Mail, ShieldCheck, TriangleAlert } from 'lucide-react'

interface Notification {
    id: string
    type: string
    title: string
    body: string | null
    job_link: string | null
    is_read: boolean
    created_at: string
}

const typeIcon: Record<string, React.ReactNode> = {
    accepted: <CircleCheck size={17} />,
    pooling_accepted: <CircleCheck size={17} />,
    selected: <TriangleAlert size={17} />,
    rejected: <BellOff size={17} />,
    system: <Bell size={17} />,
    job_approved: <ShieldCheck size={17} />,
    job_rejected: <ShieldCheck size={17} />,
}

function timeAgo(dateStr: string) {
    const diff = Math.max(0, Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000))
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
        const response = await fetch('/api/notifications')
        if (response.ok) {
            const data = await response.json()
            const nextNotifications = data.notifications || []
            setNotifications(nextNotifications)
            setUnreadCount(nextNotifications.filter((notification: Notification) => !notification.is_read).length)
        }
        setLoading(false)
    }, [])

    useEffect(() => { fetchNotifications() }, [fetchNotifications])

    const markRead = async (id: string) => {
        await fetch('/api/notifications/read', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notificationId: id }),
        })
        setNotifications((current) => current.map((notification) => notification.id === id ? { ...notification, is_read: true } : notification))
        setUnreadCount((current) => Math.max(0, current - 1))
    }

    const markAllRead = async () => {
        await fetch('/api/notifications/read', { method: 'PUT' })
        setNotifications((current) => current.map((notification) => ({ ...notification, is_read: true })))
        setUnreadCount(0)
    }

    return (
        <div className="rk-inbox">
            <div className="rk-panel-heading">
                <div><span className="rk-kicker">Updates</span><h2>Inbox {unreadCount > 0 && <small>{unreadCount}</small>}</h2></div>
                {unreadCount > 0 && <button type="button" onClick={markAllRead}><CheckCheck size={14} /> Mark all read</button>}
            </div>
            {loading ? (
                <div className="rk-inbox-loading"><span /> Loading updates</div>
            ) : notifications.length === 0 ? (
                <div className="rk-empty-state rk-empty-state-compact"><Mail size={26} /><h3>Your inbox is clear</h3><p>Application and listing updates will appear here.</p></div>
            ) : (
                <div className="rk-notification-list">
                    {notifications.map((notification) => (
                        <article
                            key={notification.id}
                            className="rk-notification"
                            data-read={notification.is_read}
                            onClick={() => !notification.is_read && markRead(notification.id)}
                        >
                            <span className="rk-notification-icon">{typeIcon[notification.type] || typeIcon.system}</span>
                            <div>
                                <strong>{notification.title}</strong>
                                {notification.body && <p>{notification.body}</p>}
                                {notification.job_link && (
                                    <a href={notification.job_link} target="_blank" rel="noopener noreferrer" onClick={(event) => event.stopPropagation()}>
                                        Open job posting <ExternalLink size={12} />
                                    </a>
                                )}
                                <time>{timeAgo(notification.created_at)}</time>
                            </div>
                            {!notification.is_read && <span className="rk-unread-dot" aria-label="Unread" />}
                        </article>
                    ))}
                </div>
            )}
        </div>
    )
}
