import { cn } from "./utils";
import { cva, type VariantProps } from "class-variance-authority";

const skeletonVariants = cva(
  "bg-muted animate-pulse rounded-xl",
  {
    variants: {
      variant: {
        default: "",
        text: "h-4 w-full",
        title: "h-6 w-3/4",
        avatar: "rounded-full",
        button: "h-11 w-24",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface SkeletonProps extends React.ComponentProps<"div">, VariantProps<typeof skeletonVariants> {}

function Skeleton({ className, variant, ...props }: SkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      className={cn(skeletonVariants({ variant }), className)}
      role="status"
      aria-label="Loading..."
      {...props}
    />
  );
}

export { Skeleton };
