import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { cn } from "@/lib/utils"

interface DualHandleSliderProps {
  value: number[];
  onValueChange: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

export const DualHandleSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  DualHandleSliderProps
>(({ value, onValueChange, min = 0, max = 100, step = 1, className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className
    )}
    value={value}
    onValueChange={onValueChange}
    min={min}
    max={max}
    step={step}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-muted">
      <SliderPrimitive.Range className="absolute h-full bg-brand-primary" />
    </SliderPrimitive.Track>
    
    {/* First thumb */}
    <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border-2 border-brand-primary bg-white shadow-md ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:border-brand-accent hover:shadow-lg" />
    
    {/* Second thumb */}
    <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border-2 border-brand-primary bg-white shadow-md ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:border-brand-accent hover:shadow-lg" />
  </SliderPrimitive.Root>
))
