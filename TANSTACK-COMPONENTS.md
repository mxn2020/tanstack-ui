# TanStack Components Implementation Guide

This document lists additional TanStack-integrated components we could implement in the UI package.

## Current TanStack Integration

### Existing Components

**packages/ui/src/tanstack-components/**
- ✅ `LinkButton.tsx` - Button with TanStack Router Link integration

---

## Recommended TanStack Components to Implement

### 1. TanStack Router Components

#### High Priority

**1.1 LinkCard.tsx**
```tsx
// Clickable Card that navigates using TanStack Router
<LinkCard to="/dashboard" variant="primary">
  <CardHeader>...</CardHeader>
</LinkCard>
```
**Use Case**: Dashboard cards, navigation tiles
**Complexity**: Low
**Dependencies**: Card component, TanStack Router

---

**1.2 NavLink.tsx**
```tsx
// Navigation link with active state styling
<NavLink to="/dashboard" activeProps={{ className: '...' }}>
  Dashboard
</NavLink>
```
**Use Case**: Sidebar navigation, breadcrumbs
**Complexity**: Low
**Dependencies**: TanStack Router
**Features**:
- Active state detection
- Pending state during navigation
- Preloading support

---

**1.3 RouterBreadcrumb.tsx**
```tsx
// Auto-generated breadcrumbs from router state
<RouterBreadcrumb />
```
**Use Case**: Page navigation, user orientation
**Complexity**: Medium
**Dependencies**: Breadcrumb component, TanStack Router
**Features**:
- Automatic breadcrumb generation from route tree
- Customizable route labels
- Integration with existing Breadcrumb component

---

**1.4 LinkDropdownItem.tsx**
```tsx
// Dropdown menu item with router navigation
<DropdownMenu>
  <LinkDropdownItem to="/settings">Settings</LinkDropdownItem>
</DropdownMenu>
```
**Use Case**: Navigation menus, user menus
**Complexity**: Low
**Dependencies**: DropdownMenu, TanStack Router

---

**1.5 RouterTabs.tsx**
```tsx
// Tabs that sync with URL search params
<RouterTabs paramName="view">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="analytics">Analytics</TabsTrigger>
  </TabsList>
</RouterTabs>
```
**Use Case**: Multi-view pages with URL state
**Complexity**: Medium
**Dependencies**: Tabs component, TanStack Router
**Features**:
- URL search param synchronization
- Browser back/forward support
- Shareable tab states

---

### 2. TanStack Table Components

#### High Priority

**2.1 DataGrid.tsx**
```tsx
// Full-featured data grid with TanStack Table
<DataGrid
  data={users}
  columns={columns}
  enableSorting
  enableFiltering
  enablePagination
/>
```
**Use Case**: Admin panels, data management
**Complexity**: High
**Dependencies**: Table component, TanStack Table
**Features**:
- Sorting (client & server)
- Filtering (column & global)
- Pagination
- Column visibility
- Column resizing
- Row selection
- Virtualization support

---

**2.2 SortableTable.tsx**
```tsx
// Table with built-in sorting
<SortableTable data={items} columns={columns} />
```
**Use Case**: Simple sortable lists
**Complexity**: Medium
**Dependencies**: Table component, TanStack Table
**Features**:
- Click column headers to sort
- Sort indicators
- Multi-column sorting

---

**2.3 FilterableTable.tsx**
```tsx
// Table with column filters
<FilterableTable
  data={items}
  columns={columns}
  filters={[
    { column: 'status', type: 'select', options: [...] },
    { column: 'name', type: 'text' }
  ]}
/>
```
**Use Case**: Data exploration, analytics
**Complexity**: Medium
**Dependencies**: Table, Input, Select, TanStack Table

---

**2.4 VirtualizedTable.tsx**
```tsx
// Table with virtual scrolling for large datasets
<VirtualizedTable
  data={largeDataset}
  columns={columns}
  estimateSize={50}
/>
```
**Use Case**: Large datasets (1000+ rows)
**Complexity**: High
**Dependencies**: Table, TanStack Table, TanStack Virtual
**Features**:
- Render only visible rows
- Smooth scrolling
- Dynamic row heights

---

### 3. TanStack Query Components

#### High Priority

**3.1 QueryBoundary.tsx**
```tsx
// Error and loading boundary for queries
<QueryBoundary
  loadingFallback={<Loading />}
  errorFallback={(error) => <Alert variant="error">{error.message}</Alert>}
>
  <DataComponent />
</QueryBoundary>
```
**Use Case**: Async data loading patterns
**Complexity**: Low
**Dependencies**: Loading, Alert, TanStack Query

---

**3.2 InfiniteScrollList.tsx**
```tsx
// List with infinite scrolling
<InfiniteScrollList
  queryKey="posts"
  fetchFn={fetchPosts}
  renderItem={(post) => <PostCard {...post} />}
/>
```
**Use Case**: Social feeds, product lists
**Complexity**: Medium
**Dependencies**: List, TanStack Query
**Features**:
- Automatic page loading
- Loading indicators
- Error handling

---

**3.3 OptimisticList.tsx**
```tsx
// List with optimistic updates
<OptimisticList
  items={items}
  onAdd={addItem}
  onUpdate={updateItem}
  onDelete={deleteItem}
/>
```
**Use Case**: Todo lists, real-time updates
**Complexity**: Medium
**Dependencies**: List, TanStack Query
**Features**:
- Instant UI updates
- Rollback on error
- Conflict resolution

---

### 4. TanStack Form Components

#### High Priority

**4.1 FormField.tsx**
```tsx
// Integrated form field with validation
<Form form={form}>
  <FormField
    name="email"
    label="Email"
    component={Input}
    validators={{
      onChange: ({ value }) => !value.includes('@') ? 'Invalid email' : undefined
    }}
  />
</Form>
```
**Use Case**: All forms
**Complexity**: Medium
**Dependencies**: Input, Textarea, Select, TanStack Form
**Features**:
- Built-in validation
- Error display
- Field state management

---

**4.2 FormArray.tsx**
```tsx
// Dynamic form arrays
<FormArray name="addresses">
  {(fields, { add, remove }) => (
    <>
      {fields.map((field, i) => (
        <FormField key={field.key} name={`addresses[${i}].street`} />
      ))}
      <Button onClick={add}>Add Address</Button>
    </>
  )}
</FormArray>
```
**Use Case**: Multi-item forms, dynamic fields
**Complexity**: High
**Dependencies**: Input, Button, TanStack Form

---

**4.3 FormWizard.tsx**
```tsx
// Multi-step form wizard
<FormWizard
  steps={[
    { title: 'Personal Info', fields: [...] },
    { title: 'Address', fields: [...] },
    { title: 'Confirm', fields: [...] }
  ]}
  onSubmit={handleSubmit}
/>
```
**Use Case**: Registration, checkout flows
**Complexity**: High
**Dependencies**: Tabs, Button, TanStack Form, TanStack Router
**Features**:
- Step validation
- Progress indicator
- URL state sync
- Draft saving

---

### 5. TanStack Virtual Components

#### Medium Priority

**5.1 VirtualList.tsx**
```tsx
// Virtualized list for large datasets
<VirtualList
  items={largeArray}
  estimateSize={50}
  renderItem={(item) => <ListItem>{item.name}</ListItem>}
/>
```
**Use Case**: Long lists, chat messages
**Complexity**: Medium
**Dependencies**: List, TanStack Virtual

---

**5.2 VirtualGrid.tsx**
```tsx
// Virtualized grid layout
<VirtualGrid
  items={images}
  columns={3}
  estimateSize={200}
  renderItem={(item) => <ImageCard {...item} />}
/>
```
**Use Case**: Image galleries, product grids
**Complexity**: High
**Dependencies**: TanStack Virtual

---

### 6. Combined/Advanced Components

#### Medium Priority

**6.1 ServerDataGrid.tsx**
```tsx
// Data grid with server-side operations
<ServerDataGrid
  queryKey="users"
  fetchFn={fetchUsers}
  columns={columns}
  enableServerSorting
  enableServerFiltering
  enableServerPagination
/>
```
**Use Case**: Large datasets with backend filtering
**Complexity**: Very High
**Dependencies**: DataGrid, TanStack Table, TanStack Query, TanStack Router
**Features**:
- Server-side sorting
- Server-side filtering
- Server-side pagination
- URL state sync

---

**6.2 RouterForm.tsx**
```tsx
// Form with router integration
<RouterForm
  form={form}
  to="/success"
  searchParams={(data) => ({ id: data.id })}
>
  <FormField name="name" component={Input} />
  <Button type="submit">Submit</Button>
</RouterForm>
```
**Use Case**: Forms that navigate on success
**Complexity**: Medium
**Dependencies**: TanStack Form, TanStack Router

---

**6.3 CachedSelect.tsx**
```tsx
// Select with query caching
<CachedSelect
  queryKey="users"
  fetchFn={fetchUsers}
  labelKey="name"
  valueKey="id"
/>
```
**Use Case**: Dropdowns with API data
**Complexity**: Medium
**Dependencies**: Select, TanStack Query

---

**6.4 SearchableCombobox.tsx**
```tsx
// Combobox with search and infinite scroll
<SearchableCombobox
  queryKey="products"
  searchFn={searchProducts}
  placeholder="Search products..."
/>
```
**Use Case**: Large option sets, product search
**Complexity**: High
**Dependencies**: Popover, Input, TanStack Query
**Features**:
- Debounced search
- Infinite scroll
- Keyboard navigation
- Multi-select variant

---

## Implementation Priority

### Phase 1 (Quick Wins)
1. ✅ LinkButton (already done)
2. NavLink
3. LinkCard
4. LinkDropdownItem
5. QueryBoundary

### Phase 2 (Core Features)
6. DataGrid
7. FormField
8. RouterTabs
9. RouterBreadcrumb
10. SortableTable

### Phase 3 (Advanced Features)
11. FormWizard
12. InfiniteScrollList
13. VirtualList
14. FilterableTable
15. ServerDataGrid

### Phase 4 (Nice to Have)
16. VirtualGrid
17. FormArray
18. OptimisticList
19. RouterForm
20. SearchableCombobox

---

## Technical Requirements

### Required Dependencies

Already in package.json:
- ✅ `@tanstack/react-router`
- ✅ `react` & `react-dom`

Need to add:
- `@tanstack/react-table` - For table components
- `@tanstack/react-query` - For query components
- `@tanstack/react-form` - For form components
- `@tanstack/react-virtual` - For virtualization

### Installation Command

```bash
pnpm add @tanstack/react-table @tanstack/react-query @tanstack/react-form @tanstack/react-virtual
```

---

## Naming Convention

- **Router components**: `Link*`, `Router*`, `Nav*`
- **Table components**: `*Table`, `DataGrid`
- **Form components**: `Form*`
- **Query components**: `Query*`, `*List` (with async data)
- **Virtual components**: `Virtual*`

---

## File Structure

```
packages/ui/src/
├── components/          # Base UI components
├── tanstack-components/ # TanStack integrations
│   ├── router/
│   │   ├── LinkButton.tsx ✅
│   │   ├── LinkCard.tsx
│   │   ├── NavLink.tsx
│   │   └── RouterBreadcrumb.tsx
│   ├── table/
│   │   ├── DataGrid.tsx
│   │   ├── SortableTable.tsx
│   │   └── VirtualizedTable.tsx
│   ├── form/
│   │   ├── FormField.tsx
│   │   ├── FormArray.tsx
│   │   └── FormWizard.tsx
│   ├── query/
│   │   ├── QueryBoundary.tsx
│   │   └── InfiniteScrollList.tsx
│   └── virtual/
│       ├── VirtualList.tsx
│       └── VirtualGrid.tsx
└── examples/
    └── Resizable.example.tsx ✅
```

---

## Documentation

Each component should include:
- TypeScript types
- Usage examples
- Props documentation
- Accessibility notes
- Performance considerations

---

## Sources

- [TanStack Libraries](https://tanstack.com/)
- [TanStack Table](https://tanstack.com/table/latest)
- [TanStack Query](https://tanstack.com/query/latest/docs/framework/react/overview)
- [TanStack Start](https://tanstack.com/start/latest/docs/framework/react/overview)
- [TanStack Form](https://tanstack.com/form/latest/docs/framework/react/guides/ui-libraries)
