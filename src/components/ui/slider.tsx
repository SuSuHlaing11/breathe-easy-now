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
  
  const handleTrackClick = (e: React.MouseEvent<HTMLSpanElement>) => {
    if (!canAddThumb || !onAddThumb) return;
    
    const track = e.currentTarget;
    const rect = track.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const min = props.min ?? 0;
    const max = props.max ?? 100;
    const newValue = Math.round(min + percent * (max - min));
    
    onAddThumb(newValue);
  };

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn("relative flex w-full touch-none select-none items-center", className)}
      {...props}
    >
      <SliderPrimitive.Track 
        className="relative h-[2px] w-full grow overflow-hidden rounded-full bg-muted-foreground/30 cursor-pointer"
        onClick={handleTrackClick}
      >
        <SliderPrimitive.Range className="absolute h-full bg-muted-foreground/30" />
      </SliderPrimitive.Track>
      {values.map((_, index) => (
        <SliderPrimitive.Thumb 
          key={index}
          className="group relative block h-4 w-4 rounded-full bg-muted-foreground/60 shadow-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-muted-foreground/80 cursor-grab active:cursor-grabbing"
          onDoubleClick={() => values.length > 1 && onRemoveThumb?.(index)}
        >
          {values.length > 1 && (
            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              double-click to remove
            </span>
          )}
        </SliderPrimitive.Thumb>
      ))}
    </SliderPrimitive.Root>
  );
});
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
