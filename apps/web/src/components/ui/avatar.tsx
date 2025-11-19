import * as React from "react";

import { cn } from "./utils";

interface AvatarContextValue {
  imageLoadStatus: "idle" | "loading" | "loaded" | "error";
  setImageLoadStatus: React.Dispatch<React.SetStateAction<"idle" | "loading" | "loaded" | "error">>;
}

const AvatarContext = React.createContext<AvatarContextValue | undefined>(undefined);

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> { }

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, ...props }, ref) => {
    const [imageLoadStatus, setImageLoadStatus] = React.useState<"idle" | "loading" | "loaded" | "error">("idle");

    return (
      <AvatarContext.Provider value={{ imageLoadStatus, setImageLoadStatus }}>
        <div
          ref={ref}
          data-slot="avatar"
          className={cn(
            "relative flex size-10 shrink-0 overflow-hidden rounded-full",
            className,
          )}
          {...props}
        />
      </AvatarContext.Provider>
    );
  }
);
Avatar.displayName = "Avatar";

export interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> { }

const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, src, alt = "", onError, onLoad, ...props }, ref) => {
    const context = React.useContext(AvatarContext);

    React.useEffect(() => {
      if (src) {
        context?.setImageLoadStatus("loading");
      }
    }, [src, context]);

    const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      context?.setImageLoadStatus("loaded");
      onLoad?.(e);
    };

    const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      context?.setImageLoadStatus("error");
      onError?.(e);
    };

    if (!src || context?.imageLoadStatus === "error") {
      return null;
    }

    return (
      <img
        ref={ref}
        data-slot="avatar-image"
        src={src}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={cn("aspect-square size-full object-cover", className)}
        {...props}
      />
    );
  }
);
AvatarImage.displayName = "AvatarImage";

export interface AvatarFallbackProps extends React.HTMLAttributes<HTMLDivElement> { }

const AvatarFallback = React.forwardRef<HTMLDivElement, AvatarFallbackProps>(
  ({ className, ...props }, ref) => {
    const context = React.useContext(AvatarContext);

    // Only show fallback if image hasn't loaded or errored
    if (context?.imageLoadStatus === "loaded") {
      return null;
    }

    return (
      <div
        ref={ref}
        data-slot="avatar-fallback"
        className={cn(
          "bg-muted flex size-full items-center justify-center rounded-full",
          className,
        )}
        {...props}
      />
    );
  }
);
AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarImage, AvatarFallback };
