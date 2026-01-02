'use client'

import { useState } from 'react'

interface CopyButtonProps {
    text: string
    className?: string
    size?: 'sm' | 'md'
}

export function CopyButton({ text, className = '', size = 'md' }: CopyButtonProps) {
    const [status, setStatus] = useState<'idle' | 'copied' | 'error'>('idle')

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text)
            setStatus('copied')
            setTimeout(() => setStatus('idle'), 2000)
        } catch (error) {
            console.error('Failed to copy to clipboard:', error)
            setStatus('error')
            setTimeout(() => setStatus('idle'), 2000)
        }
    }

    const sizeClasses = size === 'sm'
        ? 'px-2 py-1 text-xs'
        : 'px-3 py-1.5 text-sm'

    const statusColors = {
        idle: 'bg-white/10 hover:bg-white/20 text-white border-white/20',
        copied: 'bg-green-500/20 text-green-400 border-green-500/30',
        error: 'bg-red-500/20 text-red-400 border-red-500/30'
    }

    const statusText = {
        idle: 'Copy',
        copied: 'Copied!',
        error: 'Failed'
    }

    return (
        <button
            onClick={handleCopy}
            disabled={status !== 'idle'}
            className={`${sizeClasses} ${statusColors[status]} rounded border transition-all duration-200 font-medium ${className}`}
            aria-label={status === 'idle' ? 'Copy to clipboard' : statusText[status]}
        >
            {statusText[status]}
        </button>
    )
}
