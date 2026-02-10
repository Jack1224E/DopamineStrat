"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const progressVariants = cva(
  "relative w-full overflow-hidden rounded-full",
  {
    variants: {
      variant: {
        default: "bg-primary/20",
        destructive: "bg-destructive/20",
        success: "bg-emerald-500/20",
        warning: "bg-amber-500/20",
        game: "bg-slate-800 border border-slate-700",
      },
      size: {
        default: "h-2",
        sm: "h-1.5",
        lg: "h-3",
        xl: "h-4",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const indicatorVariants = cva(
  "h-full w-full flex-1 transition-all duration-500 ease-out",
  {
    variants: {
      variant: {
        default: "bg-primary",
        destructive: "bg-gradient-to-r from-rose-600 to-red-500",
        success: "bg-gradient-to-r from-emerald-500 to-emerald-400",
        warning: "bg-gradient-to-r from-amber-500 to-amber-400",
        game: "bg-gradient-to-r from-amber-500 to-orange-400",
      },
      animated: {
        true: "animate-pulse",
        false: "",
      },
      glow: {
        true: "shadow-lg",
        false: "",
      }
    },
    defaultVariants: {
      variant: "default",
      animated: false,
      glow: false,
    },
  }
)

interface ProgressProps extends
  React.ComponentProps<typeof ProgressPrimitive.Root>,
  VariantProps<typeof progressVariants>,
  VariantProps<typeof indicatorVariants> {
  glowColor?: string;
  showValue?: boolean;
  valueLabel?: string;
}

function Progress({
  className,
  value,
  variant = "default",
  size = "default",
  animated = false,
  glow = false,
  glowColor,
  showValue = false,
  valueLabel,
  ...props
}: ProgressProps) {
  const safeValue = Math.max(0, Math.min(100, value || 0))

  return (
    <div className="space-y-1.5">
      <ProgressPrimitive.Root
        data-slot="progress"
        className={cn(progressVariants({ variant, size }), className)}
        {...props}
      >
        <ProgressPrimitive.Indicator
          data-slot="progress-indicator"
          className={cn(
            indicatorVariants({ variant, animated, glow }),
            glowColor && `shadow-[${glowColor}]`,
          )}
          style={{
            transform: `translateX(-${100 - safeValue}%)`,
            background: variant === "game" && safeValue > 90
              ? "linear-gradient(to right, #fbbf24, #f59e0b, #ea580c)"
              : undefined,
          }}
        />
        {/* Gradient overlay for high values */}
        {safeValue > 90 && variant === "game" && (
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent"
            style={{
              animation: "shimmer 2s infinite",
            }}
          />
        )}
      </ProgressPrimitive.Root>

      {showValue && (
        <div className="flex justify-between items-center text-xs text-muted-foreground px-1">
          <span>{valueLabel ?? "Progress"}</span>
          <span className="font-medium">{Math.round(safeValue)}%</span>
        </div>
      )}
    </div>
  )
}

export { Progress, progressVariants, indicatorVariants }
