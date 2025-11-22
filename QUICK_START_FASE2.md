# QUICK START - FASE 2 (5 MINUTES)
## Get started with custom hooks in 5 minutes

---

## ⚡ SUPER QUICK (2 min)

### Option 1: Simplest (useListPage)

```typescript
import { useListPage } from '@/hooks';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';
import { EmptyState } from '@/components/ui/empty-state';

export default function MyListPage() {
  const { items, state, nextPage, prevPage, page, totalPages } = useListPage(
    () => api.getItems(),  // Your fetch function
    [],                     // Dependencies
    12                      // Items per page
  );

  return (
    <>
      {state === 'loading' && <SkeletonLoader variant="grid" count={6} />}
      {state === 'empty' && <EmptyState title="No items" />}
      {state === 'ready' && (
        <>
          <div className="grid gap-4">
            {items.map(item => (
              <div key={item.id}>
                {/* Your item component */}
              </div>
            ))}
          </div>
          {/* Pagination if needed */}
        </>
      )}
    </>
  );
}
```

**That's it! Deploy and you're done.** 🎉

---

## 🎯 QUICK (5 min)

### Option 2: More Control (useDataWithState)

```typescript
import { useDataWithState } from '@/hooks';

export default function MyPage() {
  const { data, state, error, refetch } = useDataWithState(
    () => api.getItems(),
    []
  );

  return (
    <>
      {state === 'loading' && <Skeleton />}
      {state === 'empty' && <EmptyState />}
      {state === 'error' && <Error error={error} onRetry={refetch} />}
      {state === 'ready' && <Content items={data} />}
    </>
  );
}
```

---

## 📋 COPY-PASTE TEMPLATES

### Template 1: Service List Page
```typescript
import { ListPageTemplate } from '@/components/patterns/ListPageTemplate';
import { ServiceCard } from '@/components/cards/ServiceCard';

export default function ServicesPage() {
  return (
    <ListPageTemplate
      title="Services"
      description="Find expert services"
      fetchFn={() => api.getServices()}
      renderItem={(service) => <ServiceCard service={service} />}
      layout="grid"
      gridCols={3}
    />
  );
}
```

### Template 2: Search Results
```typescript
import { useDataWithState } from '@/hooks';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';

export default function SearchPage({ query }: { query: string }) {
  const { data, state } = useDataWithState(
    () => api.search(query),
    [query]
  );

  return (
    <>
      {state === 'loading' && <SkeletonLoader variant="list" />}
      {state === 'empty' && (
        <EmptyState title={`No results for "${query}"`} />
      )}
      {state === 'ready' && (
        <div className="space-y-4">
          {data.map(item => <ResultCard key={item.id} item={item} />)}
        </div>
      )}
    </>
  );
}
```

### Template 3: Form with Loading
```typescript
import { useLoadingState } from '@/hooks';
import { Button } from '@/components/ui/button';

export default function CreateForm() {
  const { isLoading, startLoading, stopLoading } = useLoadingState();

  const handleSubmit = async (formData) => {
    startLoading();
    try {
      await api.create(formData);
      stopLoading();
      // Show success
    } catch (err) {
      stopLoading();
      // Show error
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSubmit(new FormData(e.currentTarget));
    }}>
      <input type="text" placeholder="Name" />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create'}
      </Button>
    </form>
  );
}
```

---

## 🎨 VISUAL IMPROVEMENTS (Already Built-In)

No code needed! These are automatic:

```typescript
// Button automatically has glow + press feedback
<Button variant="default">Click Me</Button>

// Skeleton loaders automatically have staggered animations
<SkeletonLoader variant="grid" count={6} />

// Empty states automatically have floating icon
<EmptyState icon={Search} title="No results" />
```

---

## 📊 WHICH HOOK DO I NEED?

| Use Case | Hook |
|----------|------|
| Simple list page | `useListPage` |
| Custom layout | `useDataWithState` |
| Form submission | `useLoadingState` |
| Paginate data | `usePaginatedData` |
| Advanced fetching | `useDataFetch` |

**Not sure?** → Use `useDataWithState`, it's the most powerful

---

## 🔄 STATE VALUES Explained

All hooks return a `state` value:

- `'loading'` → Show skeleton loader
- `'empty'` → Show empty state
- `'error'` → Show error message with retry button
- `'ready'` → Show your content

```typescript
{state === 'loading' && <SkeletonLoader />}
{state === 'empty' && <EmptyState />}
{state === 'error' && <ErrorBanner />}
{state === 'ready' && <YourContent />}
```

---

## ⚙️ COMMON PATTERNS

### Pattern 1: List with Filters
```typescript
const [filters, setFilters] = useState({});

const { data, state, refetch } = useDataWithState(
  () => api.getItems(filters),
  [filters]  // Refetch when filters change
);
```

### Pattern 2: List with Pagination
```typescript
const { data, state } = useDataWithState(
  () => api.getItems(),
  []
);

const { page, nextPage, prevPage, pageSize } = usePaginatedData(
  data?.length || 0,
  { initialPageSize: 20 }
);

const paginatedItems = data?.slice(
  (page - 1) * pageSize,
  page * pageSize
);
```

### Pattern 3: Search with Results
```typescript
const [query, setQuery] = useState('');

const { data: results, state } = useDataWithState(
  () => api.search(query),
  [query]
);
```

---

## 🎯 5-MINUTE IMPLEMENTATION

1. **Pick your hook** (1 min)
   - useListPage or useDataWithState?

2. **Copy template** (1 min)
   - Paste example from above

3. **Update fetch function** (1 min)
   - Change `api.getItems()` to your API call

4. **Update rendering** (1 min)
   - Change component names to your components

5. **Test** (1 min)
   - Click around, verify loading/empty/ready states work

**Done!** Deploy with confidence. 🚀

---

## 🐛 TROUBLESHOOTING

### Issue: Nothing showing
**Solution**: Check `state === 'ready'` before rendering

### Issue: Loading never ends
**Solution**: Make sure your `fetchFn()` is async and returns data

### Issue: State not updating
**Solution**: Check `dependencies` array - add filters, userId, etc.

### Issue: TypeScript error
**Solution**: Make sure your fetch function returns `Promise<T[]>`

---

## 📚 NEED MORE HELP?

- Full guide: [README_FASE2.md](./README_FASE2.md)
- Code examples: [PRACTICAL_EXAMPLES_FASE2.md](./PRACTICAL_EXAMPLES_FASE2.md)
- Hook selection: [HOOK_STRATEGY_GUIDE.md](./HOOK_STRATEGY_GUIDE.md)
- Integration details: [INTEGRATION_GUIDE_FASE2.md](./INTEGRATION_GUIDE_FASE2.md)

---

## ✅ YOU'RE READY

You now know:
- ✅ How to use custom hooks
- ✅ Which hook to pick
- ✅ Common patterns
- ✅ How to handle states

**Start with your first page. You've got this!** 💪

---

## 🎊 BONUS: State Variations

### Just Loading?
```typescript
const { isLoading, startLoading, stopLoading } = useLoadingState();
```

### Just Pagination?
```typescript
const { page, nextPage, prevPage, totalPages } = usePaginatedData(100);
```

### All Features?
```typescript
const {
  items,              // Current page items
  state,              // 'loading' | 'empty' | 'error' | 'ready'
  page,               // Current page
  totalPages,         // Total pages
  nextPage,           // Go to next page
  prevPage,           // Go to previous page
  refetch,            // Re-fetch data
  error               // Error object if state is 'error'
} = useListPage(fetchFn, deps, pageSize);
```

---

**Go build something amazing!** 🚀
