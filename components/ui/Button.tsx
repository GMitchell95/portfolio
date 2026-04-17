'use client'

import { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  icon?: boolean
  loading?: boolean
  children?: ReactNode
  className?: string
}

// ── Variant classes ──────────────────────────────────
const VARIANT: Record<Variant, string> = {
  primary:
    'bg-[#4443B4] text-white hover:bg-[#3332A0]',
  secondary:
    'bg-zinc-100 text-zinc-800 hover:bg-zinc-200',
  outline:
    'bg-white border border-zinc-200 shadow-sm text-zinc-800 hover:bg-zinc-50 hover:border-zinc-300',
  ghost:
    'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900',
}

// ── Size classes (text buttons) ───────────────────────
const SIZE: Record<Size, string> = {
  sm: 'h-8  px-3 text-sm',
  md: 'h-9  px-4 text-sm',
  lg: 'h-10 px-6 text-sm',
}

// ── Size classes (icon buttons — square, no h-padding) ─
const ICON_SIZE: Record<Size, string> = {
  sm: 'h-8  w-8',
  md: 'h-9  w-9',
  lg: 'h-10 w-10',
}

// ── Shared base ──────────────────────────────────────
const BASE = [
  'inline-flex items-center justify-center gap-2',
  'font-medium rounded-lg whitespace-nowrap',
  'transition-all duration-150 ease-out',
  'active:scale-[0.97]',
  'focus-visible:outline-none',
  'focus-visible:ring-[3px] focus-visible:ring-[rgba(68,67,180,0.2)]',
  'disabled:opacity-50 disabled:pointer-events-none',
].join(' ')

export default function Button({
  variant = 'primary',
  size = 'md',
  icon = false,
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const sizeClass = icon ? ICON_SIZE[size] : SIZE[size]

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`${BASE} ${VARIANT[variant]} ${sizeClass} ${className}`.trim()}
    >
      {loading && (
        <span
          aria-hidden
          className="shrink-0 w-[13px] h-[13px] rounded-full border-2 border-current border-t-transparent animate-spin"
        />
      )}
      {children}
    </button>
  )
}
