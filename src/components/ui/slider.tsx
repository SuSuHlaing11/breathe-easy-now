import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

interface SliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, ...props }, ref) => {
  const values = props.value || props.defaultValue || [0];
  const trackRef = React.useRef<HTMLSpanElement>(null);

  return (
    <div className="relative flex w-full touch-none select-none items-center py-2">
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
            title={`Year ${value}`}
          />
        ))}
      </SliderPrimitive.Root>
    </div>
  );
});
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
