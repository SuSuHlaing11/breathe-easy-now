import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

interface SliderProps extends Omit<React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>, 'onPointerDown'> {
  onAddThumb?: (value: number) => void;
  onRemoveThumb?: (index: number) => void;
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, onAddThumb, onRemoveThumb, ...props }, ref) => {
  const values = props.value || props.defaultValue || [0];
  const canAddThumb = values.length < 2;
  
  const handleTrackPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only handle if we can add a thumb and handler exists
    if (!canAddThumb || !onAddThumb) return;
    
    const track = e.currentTarget;
    const rect = track.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const min = props.min ?? 0;
    const max = props.max ?? 100;
    const newValue = Math.round(min + percent * (max - min));
    
    // Don't add if too close to existing values (within 5 years)
    const tooClose = values.some(v => Math.abs(v - newValue) < 5);
    if (tooClose) return;
    
    // Prevent default slider behavior and add new thumb
    e.stopPropagation();
    e.preventDefault();
    onAddThumb(newValue);
  };

  return (
    <div className="relative flex w-full touch-none select-none items-center">
      {/* Invisible click layer for adding thumbs */}
      {canAddThumb && (
        <div 
          className="absolute inset-0 z-10 cursor-pointer"
          onPointerDown={handleTrackPointerDown}
          style={{ height: '20px', top: '50%', transform: 'translateY(-50%)' }}
        />
      )}
      <SliderPrimitive.Root
        ref={ref}
        className={cn("relative flex w-full touch-none select-none items-center", className)}
        {...props}
      >
        <SliderPrimitive.Track className="relative h-[2px] w-full grow overflow-hidden rounded-full bg-muted-foreground/30">
          <SliderPrimitive.Range className="absolute h-full bg-muted-foreground/30" />
        </SliderPrimitive.Track>
        {values.map((_, index) => (
          <SliderPrimitive.Thumb 
            key={index}
            className="relative z-20 block h-4 w-4 rounded-full bg-muted-foreground/60 shadow-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-muted-foreground/80 cursor-grab active:cursor-grabbing"
            onDoubleClick={(e) => {
              e.stopPropagation();
              if (values.length > 1) onRemoveThumb?.(index);
            }}
          />
        ))}
      </SliderPrimitive.Root>
    </div>
  );
});
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
