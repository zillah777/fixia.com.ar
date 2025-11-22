# HOOK STRATEGY GUIDE - CHOOSING THE RIGHT HOOK
## Complete Guide to FASE 2 Custom Hooks and When to Use Them

---

## 🎯 THE HOOK HIERARCHY

Fixia has **5 custom hooks** organized in 3 levels. Pick the right level for your needs:

### LEVEL 1: Low-Level Utilities
For maximum control, building blocks

### LEVEL 2: Mid-Level Building Blocks
For flexibility, custom layouts

### LEVEL 3: Ultra-High-Level Convenience
For speed, simple list pages

---

## 📊 DECISION TREE

```
Does your page show a simple list?
├─ YES → useListPage ⭐ (LEVEL 3)
│
└─ NO → Do you need custom layout?
   ├─ YES → ListPageTemplate or compose hooks
   │
   └─ NO → Do you need pagination?
      ├─ YES → useDataWithState + usePaginatedData
      │
      └─ NO → useDataWithState
```

---

## 🪜 LEVEL 1: LOW-LEVEL UTILITIES

### useLoadingState
**Purpose**: Simple loading state management
**Complexity**: ⭐ Simplest
**Reusability**: High
**Use When**: You need basic loading state for forms, buttons, async operations

```typescript
const { isLoading, startLoading, stopLoading } = useLoadingState();

// Usage
const handleSubmit = async () => {
  startLoading();
  try {
    await api.submit(data);
    stopLoading();
  } catch (err) {
    stopLoading();
  }
};

return (
  <Button disabled={isLoading}>
    {isLoading ? 'Saving...' : 'Save'}
  </Button>
);
```

**Best For**:
- Form submissions
- Button loading states
- Simple async operations
- Creating other hooks

---

### usePaginatedData
**Purpose**: Pagination management with validation
**Complexity**: ⭐ Simplest
**Reusability**: High
**Use When**: You need to paginate an array of data

```typescript
const { page, nextPage, prevPage, goToPage, canGoNext, canGoPrev, totalPages } =
  usePaginatedData(items.length, { initialPageSize: 20 });

const paginatedItems = items.slice((page - 1) * 20, page * 20);

return (
  <>
    {paginatedItems.map(item => <ItemCard key={item.id} item={item} />)}

    <Button onClick={prevPage} disabled={!canGoPrev}>Previous</Button>
    <span>Page {page} of {totalPages}</span>
    <Button onClick={nextPage} disabled={!canGoNext}>Next</Button>
  </>
);
```

**Best For**:
- Paginating existing data arrays
- Client-side pagination
- Building other hooks
- Simple list navigation

---

## 🏗️ LEVEL 2: MID-LEVEL BUILDING BLOCKS

### useDataFetch
**Purpose**: Data fetching with retry logic
**Complexity**: ⭐⭐ Intermediate
**Reusability**: High (but less common than others)
**Use When**: You need sophisticated data fetching with retry logic

```typescript
const { data, isLoading, error, refetch } = useDataFetch(
  () => api.getItems(),
  [filters],
  { retryCount: 3, retryDelay: 1000 }
);

return (
  <>
    {isLoading && <LoadingSpinner />}
    {error && <ErrorBanner error={error} onRetry={refetch} />}
    {data && <ItemList items={data} />}
  </>
);
```

**Best For**:
- Complex data fetching scenarios
- Retry logic requirements
- Custom error handling
- Advanced use cases

**Note**: Usually you'll use useDataWithState instead, which wraps this.

---

### useDataWithState ⭐ MOST POWERFUL
**Purpose**: Data fetch + semantic state determination
**Complexity**: ⭐⭐ Intermediate
**Reusability**: Very High
**Use When**: You want clean UI logic without multiple if/else conditions

```typescript
const { data, state, error, refetch } = useDataWithState(
  () => api.getItems(),
  [filters]
);

return (
  <>
    {state === 'loading' && <SkeletonLoader />}
    {state === 'empty' && <EmptyState />}
    {state === 'error' && <ErrorBanner error={error} onRetry={refetch} />}
    {state === 'ready' && <ItemList items={data} />}
  </>
);
```

**Best For**:
- Most list pages
- Complex UX with multiple states
- Clean, readable code
- When you need maximum clarity

**Why It's Powerful**:
- Semantic state: 'loading' | 'empty' | 'error' | 'ready'
- No complex conditionals
- Handles edge cases automatically
- Super readable

---

## ⚡ LEVEL 3: ULTRA-HIGH-LEVEL CONVENIENCE

### useListPage ⭐⭐ EASIEST TO USE
**Purpose**: Complete list page (fetch + pagination + state) in ONE hook
**Complexity**: ⭐ Simplest to use
**Reusability**: Medium (perfect for simple list pages)
**Use When**: You have a simple list page with no custom layout needs

```typescript
const { items, state, page, nextPage, prevPage, refetch } = useListPage(
  () => api.getItems(),
  [filters],
  12  // page size
);

return (
  <>
    {state === 'loading' && <SkeletonLoader />}
    {state === 'empty' && <EmptyState />}
    {state === 'ready' && (
      <>
        {items.map(item => <ItemCard key={item.id} item={item} />)}

        <Button onClick={prevPage} disabled={!canGoPrev}>Prev</Button>
        <span>Page {page} of {totalPages}</span>
        <Button onClick={nextPage} disabled={!canGoNext}>Next</Button>
      </>
    )}
  </>
);
```

**Best For**:
- Simple list pages
- Quick prototyping
- Standard list UX
- Minimal code needed

**What It Includes**:
- Data fetching
- Pagination
- Semantic state
- All navigation
- Error handling

---

## 🧩 COMPOSITION PATTERNS

You can combine hooks for custom needs:

### Pattern 1: useDataWithState + usePaginatedData
**When**: Standard list + custom layout

```typescript
const { data, state, refetch } = useDataWithState(fetchFn, deps);
const { page, nextPage, prevPage } = usePaginatedData(data?.length || 0);

// Custom render
return (
  <CustomLayout>
    {state === 'ready' && (
      <>
        {data.slice((page-1)*20, page*20).map(...)}
        <CustomPagination {...} />
      </>
    )}
  </CustomLayout>
);
```

---

### Pattern 2: useLoadingState + useDataFetch
**When**: Sophisticated fetching + custom handling

```typescript
const { isLoading, startLoading, stopLoading } = useLoadingState();
const { data, error } = useDataFetch(() => api.getItems(), []);

const handleRefresh = async () => {
  startLoading();
  // Custom refresh logic
  stopLoading();
};

return <CustomUI />;
```

---

### Pattern 3: All Three Together
**When**: Maximum control with all features

```typescript
const { data, state } = useDataWithState(fetchFn, deps);
const { page, pageSize, nextPage, prevPage } = usePaginatedData(data?.length || 0);
const { isLoading, startLoading } = useLoadingState();

// Completely custom logic
```

---

## 📋 QUICK REFERENCE TABLE

| Hook | Level | Complexity | Use For | Example |
|------|-------|-----------|---------|---------|
| **useLoadingState** | 1 | ⭐ | Forms, buttons | `const { isLoading } = useLoadingState()` |
| **usePaginatedData** | 1 | ⭐ | Paginate arrays | `const { page, nextPage } = usePaginatedData(100)` |
| **useDataFetch** | 2 | ⭐⭐ | Advanced fetching | `const { data } = useDataFetch(fetchFn, deps)` |
| **useDataWithState** | 2 | ⭐⭐ | Clean list logic | `const { state, data } = useDataWithState(...)` |
| **useListPage** | 3 | ⭐ | Simple lists | `const { items, state } = useListPage(...)` |

---

## 🎓 LEARNING PATH

### Week 1: Learn the Basics
1. Read this guide
2. Study useLoadingState (5 min)
3. Study usePaginatedData (5 min)
4. Try simple examples

### Week 2: Learn Building Blocks
1. Study useDataWithState (10 min)
2. Study useListPage (5 min)
3. Try composition patterns
4. Refactor first page

### Week 3+: Master Combinations
1. Learn when to combine hooks
2. Create custom patterns
3. Optimize for your use cases

---

## 🚀 IMPLEMENTATION ROADMAP

### Phase 1: Quick Wins (This Week)
```typescript
// Simple pages → useListPage
<ListPageTemplate
  fetchFn={...}
  renderItem={...}
/>
```

### Phase 2: Standard Pages (Next Week)
```typescript
// Standard lists → useDataWithState
const { data, state } = useDataWithState(...);
```

### Phase 3: Complex Pages (Weeks 3+)
```typescript
// Custom layouts → Compose hooks
const { data, state } = useDataWithState(...);
const { page, nextPage } = usePaginatedData(...);
```

---

## ⚙️ PERFORMANCE TIPS

### Tip 1: Memoize Dependencies
```typescript
const deps = useMemo(() => [filters, userId], [filters, userId]);
const { data } = useDataWithState(fetchFn, deps);
```

### Tip 2: Memoize Callbacks
```typescript
const handleRefresh = useCallback(() => {
  refetch();
}, [refetch]);
```

### Tip 3: Use Pagination for Large Lists
```typescript
// Good: Paginate
const { page, nextPage } = usePaginatedData(10000);

// Avoid: Render 10000 items
{data.map(item => <Card item={item} />)}
```

---

## 🎯 COMMON SCENARIOS

### Scenario 1: Simple Service List
```typescript
// Use: useListPage or ListPageTemplate
const { items, state } = useListPage(() => api.getServices());

return state === 'ready' ? <Grid items={items} /> : <Loading />;
```

### Scenario 2: Filtered Professional Search
```typescript
// Use: useDataWithState + custom pagination
const { data, state } = useDataWithState(
  () => api.getProfessionals(filters),
  [filters]
);

const { page, nextPage, prevPage } = usePaginatedData(data?.length || 0);
```

### Scenario 3: Form Submission
```typescript
// Use: useLoadingState
const { isLoading, startLoading, stopLoading } = useLoadingState();

const handleSubmit = async (form) => {
  startLoading();
  await api.submit(form);
  stopLoading();
};
```

### Scenario 4: Complex Dashboard
```typescript
// Use: Compose hooks or custom logic
const data1 = useDataWithState(fetch1, deps1);
const data2 = useDataWithState(fetch2, deps2);
const { isLoading: isSaving } = useLoadingState();
```

---

## ❓ FAQ

### Q: Which hook should I start with?
**A**: `useListPage` for simple lists, `useDataWithState` for most things

### Q: Can I use multiple hooks together?
**A**: Yes! They're designed for composition

### Q: Should I use hooks or components?
**A**: Both! Hooks for logic, Components (DataListPattern, ListPageTemplate) for layout

### Q: What if my use case doesn't fit?
**A**: Combine Level 1 and 2 hooks for custom solutions

### Q: How do I handle errors?
**A**: All hooks include error handling. State will be 'error'

### Q: Can I refetch data?
**A**: Yes! All fetch hooks have `refetch()` method

---

## 🎊 SUMMARY

You now have:
- ✅ 5 custom hooks at different levels
- ✅ 2 component patterns (DataListPattern, ListPageTemplate)
- ✅ Clear decision tree for choosing the right hook
- ✅ Composition patterns for custom needs
- ✅ Performance tips
- ✅ Common scenarios covered

**Pick the hook that matches your complexity level, and you're good to go!** 🚀

---

## 📚 RELATED DOCUMENTATION

- [README_FASE2.md](./README_FASE2.md) - Master index
- [PRACTICAL_EXAMPLES_FASE2.md](./PRACTICAL_EXAMPLES_FASE2.md) - Code examples
- [INTEGRATION_GUIDE_FASE2.md](./INTEGRATION_GUIDE_FASE2.md) - Integration guide

---

**Start simple, scale as needed. The right hook for every situation.** ✨
