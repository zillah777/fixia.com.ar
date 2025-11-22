# INTEGRATION GUIDE - FASE 2 CUSTOM HOOKS & VISUAL IMPROVEMENTS
## Practical examples for implementing new hooks and visual effects in Fixia pages

---

## QUICK START

### 1. Import Custom Hooks
```typescript
import { useDataWithState, usePaginatedData, useLoadingState } from '@/hooks';
```

### 2. Use in Component
```typescript
const MyListPage = () => {
  const { data, state, refetch } = useDataWithState(
    () => api.getItems(),
    [userId]
  );

  return (
    <>
      {state === 'loading' && <SkeletonLoader variant="list" />}
      {state === 'empty' && <EmptyState title="No items found" />}
      {state === 'error' && <ErrorBanner error={error} onRetry={refetch} />}
      {state === 'ready' && <ItemList items={data} />}
    </>
  );
};
```

---

## INTEGRATION EXAMPLES BY PAGE

### OpportunitiesPage.tsx

#### Current Challenge
- Large component (1109 lines)
- Multiple state management concerns
- Could benefit from semantic data state
- Loading states could be more engaging

#### Integration Pattern

```typescript
// Add these imports
import { useDataWithState, usePaginatedData } from '@/hooks';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';
import { EmptyState } from '@/components/ui/empty-state';

export default function OpportunitiesPage() {
  // Replace complex state with semantic hook
  const {
    data: opportunities,
    state: dataState,
    error,
    refetch
  } = useDataWithState(
    () => api.getOpportunities(),
    [userId, filters]
  );

  const {
    page,
    pageSize,
    goToPage,
    nextPage,
    prevPage,
    canGoNext,
    canGoPrev
  } = usePaginatedData(opportunities?.length || 0, {
    initialPageSize: 12
  });

  // Clean JSX with semantic state
  return (
    <div className="space-y-6">
      {/* Header */}
      <Header />

      {/* Filters */}
      <Filters onApply={refetch} />

      {/* Content State */}
      {dataState === 'loading' && (
        <SkeletonLoader variant="grid" count={6} />
      )}

      {dataState === 'empty' && (
        <EmptyState
          icon={Briefcase}
          title="No opportunities found"
          description="Try adjusting your filters or check back later"
          action={{
            label: 'Clear Filters',
            onClick: refetch
          }}
        />
      )}

      {dataState === 'error' && (
        <div className="p-4 bg-destructive/20 border border-destructive rounded-lg">
          <p className="text-destructive">Error loading opportunities</p>
          <Button onClick={refetch} variant="outline" size="sm">
            Try Again
          </Button>
        </div>
      )}

      {dataState === 'ready' && (
        <>
          {/* Grid of opportunities */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1 } }
            }}
          >
            {opportunities.slice(
              (page - 1) * pageSize,
              page * pageSize
            ).map((opportunity) => (
              <motion.div
                key={opportunity.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
              >
                <OpportunityCard opportunity={opportunity} />
              </motion.div>
            ))}
          </motion.div>

          {/* Pagination */}
          {Math.ceil(opportunities.length / pageSize) > 1 && (
            <Pagination
              page={page}
              totalPages={Math.ceil(opportunities.length / pageSize)}
              onPrevious={prevPage}
              onNext={nextPage}
              canGoPrev={canGoPrev}
              canGoNext={canGoNext}
            />
          )}
        </>
      )}
    </div>
  );
}
```

#### Benefits
✅ Semantic state management (loading/empty/error/ready)
✅ Cleaner JSX with explicit conditions
✅ Pagination automatically handled
✅ Loading states show SkeletonLoader
✅ Empty states show EmptyState component
✅ Staggered animations on grid items

---

### ServicesPage.tsx

#### Integration Pattern

```typescript
import { useDataWithState } from '@/hooks';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';
import { EmptyState } from '@/components/ui/empty-state';

export default function ServicesPage() {
  const {
    data: services,
    state: dataState,
    refetch
  } = useDataWithState(
    () => api.getServices(),
    [selectedCategory, searchQuery]
  );

  return (
    <div className="space-y-6">
      <SearchAndFilter onApply={refetch} />

      {/* Loading State with Skeleton */}
      {dataState === 'loading' && (
        <SkeletonLoader variant="grid" count={8} />
      )}

      {/* Empty State with Action */}
      {dataState === 'empty' && (
        <EmptyState
          icon={Search}
          title="No services found"
          description={`No services match "${searchQuery}" in ${selectedCategory}`}
          action={[
            {
              label: 'Clear Filters',
              onClick: () => {
                // Clear filters
              }
            },
            {
              label: 'Browse All',
              onClick: () => {
                // Show all services
              }
            }
          ]}
        />
      )}

      {/* Ready State */}
      {dataState === 'ready' && (
        <ServiceGrid services={services} />
      )}
    </div>
  );
}
```

---

### ProfilePage.tsx

#### Integration Pattern

```typescript
import { useDataWithState, useLoadingState } from '@/hooks';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';

export default function ProfilePage({ userId }) {
  // Profile data loading
  const {
    data: profile,
    state: profileState
  } = useDataWithState(
    () => api.getUserProfile(userId),
    [userId]
  );

  // Edit state
  const { isLoading: isSaving, startLoading, stopLoading } = useLoadingState();

  const handleSaveProfile = async (updates) => {
    startLoading();
    try {
      await api.updateProfile(userId, updates);
      stopLoading();
      toast.success('Profile updated!');
    } catch (err) {
      stopLoading();
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-8">
      {/* Loading State */}
      {profileState === 'loading' && (
        <SkeletonLoader variant="profile" />
      )}

      {/* Ready State */}
      {profileState === 'ready' && (
        <>
          <ProfileHeader profile={profile} />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <ProfileForm
              profile={profile}
              isLoading={isSaving}
              onSave={handleSaveProfile}
            />
          </motion.div>
        </>
      )}
    </div>
  );
}
```

---

## VISUAL ENHANCEMENT QUICK WINS

### 1. Apply Text Gradient to Headers

#### Before
```tsx
<h1 className="text-4xl font-bold">Find Services</h1>
```

#### After
```tsx
<h1 className="text-4xl text-gradient-header">
  Find Services
</h1>
```

**Result**: Animated gradient text that draws attention

---

### 2. Add Glow to Call-to-Action Buttons

The Button component already has glow built in! Just use `variant="default"`:

```tsx
// Already has glow + press feedback
<Button variant="default" size="lg">
  Post an Opportunity
</Button>
```

**No code changes needed** - it's automatic!

---

### 3. Enhanced Loading State Pattern

```typescript
// Old way
{isLoading && <div>Loading...</div>}

// New way - much better
{state === 'loading' && <SkeletonLoader variant="grid" count={6} />}
```

---

### 4. Empty State with Animation

```typescript
// Already animated with floating icon
{state === 'empty' && (
  <EmptyState
    icon={Briefcase}
    title="No opportunities"
    description="Post one to get started"
    action={{
      label: 'Create Opportunity',
      onClick: () => navigate('/opportunities/new')
    }}
  />
)}
```

---

### 5. Staggered Grid Animation

```typescript
<motion.div
  className="grid grid-cols-1 md:grid-cols-3 gap-6"
  initial="hidden"
  animate="visible"
  variants={{
    visible: {
      transition: {
        staggerChildren: 0.1,  // 100ms between items
      }
    }
  }}
>
  {items.map((item) => (
    <motion.div
      key={item.id}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
      }}
    >
      <Card>{/* Item content */}</Card>
    </motion.div>
  ))}
</motion.div>
```

**Result**: Smooth, sequential appearance instead of all at once

---

## HOOK COMBINATIONS

### Pattern 1: List with Pagination + Loading State

```typescript
const { data, state, refetch } = useDataWithState(
  () => api.getItems(),
  [filters]
);

const { page, pageSize, nextPage, prevPage, canGoNext, canGoPrev } =
  usePaginatedData(data?.length || 0, { initialPageSize: 10 });

// Render with pagination controls
```

### Pattern 2: Edit Form with Loading

```typescript
const { isLoading, startLoading, stopLoading } = useLoadingState();

const handleSubmit = async (formData) => {
  startLoading();
  try {
    await api.update(formData);
    stopLoading();
  } catch (err) {
    stopLoading();
  }
};

// Button shows loading state
<Button disabled={isLoading}>
  {isLoading ? 'Saving...' : 'Save Changes'}
</Button>
```

### Pattern 3: Search Results with States

```typescript
const { data: results, state, refetch } = useDataWithState(
  () => api.search(query),
  [query]
);

return (
  <>
    <SearchInput onChange={(q) => setQuery(q)} />

    {state === 'loading' && <SkeletonLoader variant="list" />}
    {state === 'empty' && <EmptyState title="No results" />}
    {state === 'ready' && <ResultsList results={results} />}
  </>
);
```

---

## STYLING PATTERNS

### Using New CSS Classes

#### Text Gradient Headers
```tsx
<h1 className="text-gradient-header">Spectacular Title</h1>
```

#### Button Glow (Automatic)
```tsx
<Button variant="default">Glowing Button</Button>
```

#### Enhanced Shimmer (Automatic in Skeletons)
```tsx
<SkeletonLoader variant="card" count={3} />
```

#### Floating Animation (Automatic in EmptyState)
```tsx
<EmptyState icon={Search} title="No results" />
```

---

## MIGRATION CHECKLIST

For each page that needs updates:

- [ ] Remove complex useState for data management
- [ ] Replace with `useDataWithState` hook
- [ ] Replace loading logic with `{state === 'loading'}`
- [ ] Replace empty state logic with `{state === 'empty'}`
- [ ] Add `<SkeletonLoader />` for loading state
- [ ] Add `<EmptyState />` for empty state
- [ ] Add staggered grid animation if applicable
- [ ] Test on mobile for animations smoothness
- [ ] Test loading and empty states
- [ ] Add appropriate error handling

---

## PERFORMANCE TIPS

1. **Memoize callbacks** that are passed to hooks
```typescript
const handleRefresh = useCallback(() => {
  refetch();
}, [refetch]);
```

2. **Use `dependencies` array** properly in useDataWithState
```typescript
// Good: includes all dependencies
const { data, state } = useDataWithState(
  () => api.getItems(filters, page),
  [filters, page]  // Include these
);
```

3. **Avoid unnecessary re-renders** in lists
```typescript
// Use key prop and React.memo for list items
const ListItem = React.memo(({ item }) => (
  <Card>{item.name}</Card>
));
```

---

## COMMON PATTERNS

### "No Results" After Search
```typescript
{state === 'empty' && (
  <EmptyState
    icon={Search}
    title="No results found"
    description={`Try different keywords or filters`}
    action={{
      label: 'Clear Search',
      onClick: () => setSearchQuery('')
    }}
  />
)}
```

### "No Posts Yet"
```typescript
{state === 'empty' && (
  <EmptyState
    icon={FileText}
    title="You haven't posted anything yet"
    description="Create your first opportunity to get started"
    action={{
      label: 'Create Opportunity',
      onClick: () => navigate('/create')
    }}
  />
)}
```

### "Error Loading Data"
```typescript
{state === 'error' && (
  <div className="p-6 border border-destructive rounded-lg bg-destructive/10">
    <p className="text-destructive font-semibold mb-4">
      Failed to load data
    </p>
    <Button onClick={refetch} variant="outline">
      Try Again
    </Button>
  </div>
)}
```

---

## ACCESSIBILITY NOTES

All improvements respect accessibility:
- ✅ Animations respect `prefers-reduced-motion`
- ✅ Semantic state helps screen readers understand context
- ✅ ARIA labels automatically included in components
- ✅ Keyboard navigation fully functional
- ✅ Color contrast maintained (WCAG AA)

---

## FAQ

### Q: Do I need to update all pages at once?
**A**: No! Update pages one at a time. The old way still works, new hooks are optional.

### Q: Will animations work on mobile?
**A**: Yes! All animations are optimized for mobile. Test to verify smoothness.

### Q: Can I disable animations?
**A**: Yes! Components have `animated={false}` prop. Also respects `prefers-reduced-motion`.

### Q: How do I handle errors?
**A**: `useDataWithState` provides error state. Handle with specific UI or retry logic.

### Q: Can I use multiple hooks together?
**A**: Absolutely! They're designed to compose: `useDataWithState` + `usePaginatedData` + `useLoadingState`.

---

## NEXT STEPS

1. **Pick one page** to refactor first (suggest OpportunitiesPage)
2. **Copy the integration pattern** from this guide
3. **Test loading/empty/ready states**
4. **Verify animations** on desktop and mobile
5. **Move to next page**
6. **Celebrate** the improved UX! 🎉

---

## RESOURCES

- **Custom Hooks**: `src/hooks/index.ts`
- **Visual Guide**: `VISUAL_IMPACT_IMPROVEMENTS_2025.md`
- **Implementation Details**: `FASE2_IMPLEMENTATION_SUMMARY.md`
- **Button Component**: `src/components/ui/button.tsx` (has glow built-in)
- **Skeleton Loader**: `src/components/ui/skeleton-loader.tsx` (with staggered animations)
- **Empty State**: `src/components/ui/empty-state.tsx` (with floating icon)

---

## SUMMARY

The tools are ready:
✅ Custom hooks for clean data management
✅ Visual improvements for premium feel
✅ Empty states and loading patterns
✅ Staggered animations for engagement
✅ Accessibility built-in
✅ Mobile optimized

**Pick a page and start integrating!** The patterns in this guide work for any list or data-heavy page.
