import * as React from "react";

export interface AspectRatioProps extends React.HTMLAttributes<HTMLDivElement> {
  ratio?: number;
}

const AspectRatio = React.forwardRef<HTMLDivElement, AspectRatioProps>(
  ({ ratio = 1, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="aspect-ratio"
        style={{
          aspectRatio: ratio.toString(),
          ...style,
        }}
        {...props}
      />
    );
  }
);
AspectRatio.displayName = "AspectRatio";

export { AspectRatio };
