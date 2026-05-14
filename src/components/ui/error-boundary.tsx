'use client'

import { Component, ReactNode } from 'react'

interface ErrorBoundaryProps {
    children: ReactNode
    fallback?: ReactNode
}

interface ErrorBoundaryState {
    hasError: boolean
    error: Error | null
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback

            return (
                <div style={{
                    minHeight: '200px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '40px 24px',
                    textAlign: 'center',
                }}>
                    <div style={{
                        background: 'rgba(239,68,68,0.08)',
                        border: '1px solid rgba(239,68,68,0.2)',
                        borderRadius: 12,
                        padding: '24px 32px',
                        maxWidth: 480,
                    }}>
                        <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '1.1rem', color: '#EF4444', marginBottom: 8 }}>
                            Something went wrong
                        </h3>
                        <p style={{ fontSize: '0.875rem', color: '#6B7A99', marginBottom: 16 }}>
                            {this.state.error?.message || 'An unexpected error occurred.'}
                        </p>
                        <button
                            onClick={() => this.setState({ hasError: false, error: null })}
                            style={{
                                padding: '8px 20px',
                                borderRadius: 8,
                                background: 'rgba(0,240,255,0.1)',
                                border: '1px solid rgba(0,240,255,0.3)',
                                color: '#00F0FF',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                            }}
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}
