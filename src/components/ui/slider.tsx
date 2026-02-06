import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

interface SliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  onAddThumb?: (value: number) => void;
  onRemoveThumb?: (index: number) => void;
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, onAddThumb, onRemoveThumb, ...props }, ref) => {
  const values = props.value || props.defaultValue || [0];
  const canAddThumb = values.length < 2;
  const trackRef = React.useRef<HTMLSpanElement>(null);

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only add thumb if we can and handler exists
    if (!canAddThumb || !onAddThumb) return;
    
    const target = e.target as HTMLElement;
    // Don't add thumb if clicking on an existing thumb
    if (target.closest('[role="slider"]')) return;
    
    const track = trackRef.current;
    if (!track) return;
    
    const rect = track.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const min = props.min ?? 0;
    const max = props.max ?? 100;
    const step = props.step ?? 1;
    const newValue = Math.round((min + percent * (max - min)) / step) * step;
    
    // Don't add if too close to existing values (within 3 steps)
    const minDistance = step * 3;
    const tooClose = values.some(v => Math.abs(v - newValue) < minDistance);
    if (tooClose) return;
    
    onAddThumb(newValue);
  };

  const handleThumbDoubleClick = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    e.preventDefault();
    if (values.length > 1 && onRemoveThumb) {
      onRemoveThumb(index);
    }
  };

  return (
    <div 
      className="relative flex w-full touch-none select-none items-center py-2 cursor-pointer"
      onClick={handleContainerClick}
    >
      <SliderPrimitive.Root
        ref={ref}
        className={cn("relative flex w-full touch-none select-none items-center", className)}
        {...props}
      >
        <SliderPrimitive.Track 
          ref={trackRef}
          className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-muted-foreground/20"
        >
          <SliderPrimitive.Range className="absolute h-full bg-primary/60" />
        </SliderPrimitive.Track>
        {values.map((value, index) => (
          <SliderPrimitive.Thumb 
            key={index}
            className="relative z-20 block h-5 w-5 rounded-full border-2 border-primary bg-background shadow-lg ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-110 hover:border-primary/80 cursor-grab active:cursor-grabbing active:scale-95"
            onDoubleClick={(e) => handleThumbDoubleClick(e, index)}
            title={values.length > 1 ? `Year ${value} - Double-click to remove` : `Year ${value}`}
          />
        ))}
      </SliderPrimitive.Root>
    </div>
  );
});
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
