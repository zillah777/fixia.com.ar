import { useCallback, useMemo, useRef } from 'react';

// Advanced useCallback with dependency comparison
export function useOptimizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  return useCallback(callback, deps);
}

// Memoized object creation for props
export function useStableProps<T extends Record<string, any>>(props: T): T {
  return useMemo(() => props, Object.values(props));
}

// Stable reference for objects
export function useStableObject<T>(obj: T): T {
  const stableRef = useRef<T>(obj);
  
  // Deep comparison for objects
  const hasChanged = useMemo(() => {
    return JSON.stringify(stableRef.current) !== JSON.stringify(obj);
  }, [obj]);
  
  if (hasChanged) {
    stableRef.current = obj;
  }
  
  return stableRef.current;
}

// Debounced callback for expensive operations
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    }) as T,
    [...deps, delay]
  );
}

// Throttled callback for high-frequency events
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList
): T {
  const lastRun = useRef(Date.now());
  
  return useCallback(
    ((...args: Parameters<T>) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = Date.now();
      }
    }) as T,
    [...deps, delay]
  );
}

// Memoized event handler generator
export function useEventHandlers<T extends Record<string, (...args: any[]) => any>>(
  handlers: T,
  deps: React.DependencyList
): T {
  return useMemo(() => {
    const memoizedHandlers = {} as T;
    
    for (const [key, handler] of Object.entries(handlers)) {
      memoizedHandlers[key as keyof T] = useCallback(handler, deps) as T[keyof T];
    }
    
    return memoizedHandlers;
  }, deps);
}

// Performance-optimized list item renderer
export function useOptimizedListRenderer<T>(
  items: T[],
  renderItem: (item: T, index: number) => React.ReactNode,
  keyExtractor: (item: T, index: number) => string | number
) {
  return useMemo(() => {
    return items.map((item, index) => {
      const key = keyExtractor(item, index);
      return {
        key,
        element: renderItem(item, index)
      };
    });
  }, [items, renderItem, keyExtractor]);
}

// Memoized filter and sort operations
export function useOptimizedFilter<T>(
  items: T[],
  filterFn: (item: T) => boolean,
  sortFn?: (a: T, b: T) => number
) {
  return useMemo(() => {
    let filtered = items.filter(filterFn);
    
    if (sortFn) {
      filtered = filtered.sort(sortFn);
    }
    
    return filtered;
  }, [items, filterFn, sortFn]);
}