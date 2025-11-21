import { cn } from "./utils";
import { cva, type VariantProps } from "class-variance-authority";

const skeletonVariants = cva(
  "bg-accent rounded-md shimmer",
  {
    variants: {
      variant: {
        default: "",
        text: "h-4 w-full",
        avatar: "rounded-full",
        card: "h-32 w-full",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface SkeletonProps
  extends React.ComponentProps<"div">,
  VariantProps<typeof skeletonVariants> { }

function Skeleton({ className, variant, ...props }: SkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      className={cn(skeletonVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Skeleton };
