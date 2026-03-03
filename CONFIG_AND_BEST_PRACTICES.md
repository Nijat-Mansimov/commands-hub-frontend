# Frontend Configuration & Best Practices

## Environment Configuration

### Development
```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=Attack Payload System
VITE_ENABLE_ADMIN_FEATURES=true
VITE_ENABLE_ANALYTICS=false
```

### Production
```
VITE_API_BASE_URL=https://api.yourdomain.com/api
VITE_APP_NAME=Attack Payload System (Prod)
VITE_ENABLE_ADMIN_FEATURES=true
VITE_ENABLE_ANALYTICS=true
```

### Staging
```
VITE_API_BASE_URL=https://staging-api.yourdomain.com/api
VITE_APP_NAME=Attack Payload System (Staging)
VITE_ENABLE_ADMIN_FEATURES=true
VITE_ENABLE_ANALYTICS=true
```

---

## API Configuration

### Axios Instance Settings

**Timeout**: 30 seconds
- Requests abort after 30 seconds
- Configurable per-request if needed

**Credentials**: Enabled
- Cookies sent automatically
- Required for session authentication

**Base URL**: Environment variable
- Development: `http://localhost:5000/api`
- Production: Custom domain

---

## Authentication Flow

### Login Flow
```
1. User submits email + password
2. API validates credentials
3. Server creates session (sets httpOnly cookie)
4. Frontend redirects to dashboard
5. AuthContext refreshes user profile
```

### Auto-Logout Flow
```
1. User makes API request
2. Server returns 401 (Unauthorized)
3. Interceptor detects 401
4. Shows "Session Expired" toast
5. Redirects to /login
6. Client clears auth context
```

### Protected Routes
```
1. Check isAuthenticated in AuthContext
2. If false, redirect to /login
3. If true, render protected component
4. Use <ProtectedRoute> wrapper component
```

---

## React Query Configuration

### Caching Strategy
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,        // 30 seconds
      gcTime: 5 * 60 * 1000,       // 5 minutes (garbage collection)
      retry: 1,                     // Retry failed requests once
      retryDelay: 1000,             // Wait 1s before retry
      refetchOnWindowFocus: true,   // Refetch when window regains focus
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});
```

### Query Keys Convention
```typescript
// Format: [resource, filtering, pagination]
['templates']                          // All templates
['templates', { category: 'Nmap' }]   // Filtered templates
['templates', 'featured']              // Featured templates
['template', templateId]               // Single template
['filters', 'options']                 // Filter options
['admin', 'stats']                     // Admin statistics
```

### Invalidation Pattern
```typescript
// After creating a template
queryClient.invalidateQueries({ 
  queryKey: ['templates'] 
});

// After updating specific template
queryClient.invalidateQueries({ 
  queryKey: ['template', templateId] 
});

// Invalidate multiple queries
queryClient.invalidateQueries({
  queryKey: ['templates'] // Invalidates all starting with 'templates'
});
```

---

## Form Handling Best Practices

### React Hook Form Integration
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
});

export function MyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
      {errors.name && <span>{errors.name.message}</span>}
    </form>
  );
}
```

### Field Validation Pattern
```typescript
import { validateFieldValues } from '@/services/utils';

const { valid, errors } = validateFieldValues(
  template.requiredFields,
  formValues
);

if (!valid) {
  // Display errors
  Object.entries(errors).forEach(([field, error]) => {
    setFieldError(field, error);
  });
  return;
}

// Submit form
mutate(formValues);
```

---

## Error Handling Patterns

### API Error Handling
```typescript
// Automatic via interceptor
api.interceptors.response.use(null, (error) => {
  const status = error.response?.status;
  const message = error.response?.data?.message;
  
  // Handle different status codes
  switch (status) {
    case 401:
      // Redirect to login
      break;
    case 403:
      // Show permission denied
      break;
    case 422:
      // Show validation errors
      break;
    default:
      // Show generic error
  }
});
```

### Mutation Error Handling
```typescript
const { mutate } = useMutation({
  onError: (error: AxiosError) => {
    const message = (error.response?.data as any)?.message;
    toast({
      title: 'Error',
      description: message || 'Something went wrong',
      variant: 'destructive',
    });
  },
});
```

### Component Error Boundary
```typescript
import { ErrorBoundary } from '@/components/ErrorBoundary';

<ErrorBoundary fallback={<ErrorPage />}>
  <TemplateList />
</ErrorBoundary>
```

---

## Performance Optimization

### Code Splitting
```typescript
// Lazy load routes
const TemplateDetail = React.lazy(() => import('./pages/TemplateDetail'));

<Suspense fallback={<Loading />}>
  <TemplateDetail />
</Suspense>
```

### Memoization
```typescript
import { useMemo, useCallback, memo } from 'react';

// Memoize expensive computations
const sortedTemplates = useMemo(() => {
  return templates.sort((a, b) => b.rating - a.rating);
}, [templates]);

// Memoize callbacks
const handleFilter = useCallback((filters) => {
  setFilters(filters);
}, []);

// Memoize components
const TemplateCard = memo(({ template }) => {
  return <div>{template.name}</div>;
});
```

### List Virtualization
```typescript
// For large lists, use virtualization
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={templates.length}
  itemSize={100}
>
  {({ index, style }) => (
    <div style={style}>
      <TemplateCard template={templates[index]} />
    </div>
  )}
</FixedSizeList>
```

### Pagination
```typescript
const [page, setPage] = useState(1);
const { data } = useTemplates({ page, limit: 12 });

// Only fetch and render current page
const maxPages = data?.pagination.pages || 1;
```

---

## Type Safety

### Strict TypeScript
```typescript
// Enable strict mode in tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true
  }
}
```

### Type Definitions
```typescript
// Always define types for API responses
interface Template {
  _id: string;
  name: string;
  description: string;
  // ... other fields
}

// Use types in components
const { data: template } = useTemplate(id);
template?.name // TypeScript knows this is string
```

### Generic Hooks
```typescript
// Create generic hooks for common patterns
function useQuery<T>(
  key: string[],
  fn: () => Promise<T>
): UseQueryResult<T> {
  return useQuery({
    queryKey: key,
    queryFn: fn,
  });
}
```

---

## Development Workflow

### Pre-commit Checks
```bash
# Install husky
npm install --save-dev husky

# Add pre-commit hook
npx husky add .husky/pre-commit "npm run lint && npm run type-check"
```

### Debugging Tools

**React DevTools Browser Extension**
- Inspect component tree
- View component props and state
- Profile component rendering

**Redux DevTools** (if using Redux)
- Time-travel debugging
- Action/state tracking

**Network DevTools**
- Monitor API requests
- Inspect request/response headers
- Check response times

**React Query DevTools**
- View cached queries
- Inspect query state
- Clear cache

---

## Security Best Practices

### Never Store Sensitive Data
```typescript
// ❌ DON'T: Store in localStorage
localStorage.setItem('authToken', token);

// ✅ DO: Use httpOnly cookies (server-managed)
// Cookies set by server are inaccessible to JS
```

### Validate User Input
```typescript
// Always validate on client and server
const { valid, errors } = validateFieldValues(fields, values);
if (!valid) return; // Don't submit

// Server will validate again
```

### CSRF Protection
```typescript
// Server sets CSRF tokens in cookies
// Include in POST/PUT/DELETE requests
// Axios automatically handles if configured
```

### Escape User-Generated Content
```typescript
// ❌ DON'T: Use dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// ✅ DO: React escapes by default
<div>{userContent}</div>
```

---

## Testing Best Practices

### Component Testing
```typescript
import { render, screen } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

render(
  <QueryClientProvider client={queryClient}>
    <TemplateList />
  </QueryClientProvider>
);

expect(screen.getByText('Templates')).toBeInTheDocument();
```

### API Mocking
```typescript
// Use MSW (Mock Service Worker)
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

const server = setupServer(
  http.get('/api/templates', () => {
    return HttpResponse.json({
      success: true,
      data: mockTemplates,
    });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
```

---

## Accessibility

### ARIA Labels
```typescript
<button aria-label="Delete template">
  <TrashIcon />
</button>
```

### Keyboard Navigation
```typescript
// Ensure all interactive elements are keyboard accessible
<input type="text" />
<button>Submit</button>
```

### Color Contrast
```typescript
// Use accessible color combinations
// Check: https://webaim.org/resources/contrastchecker/
```

### Screen Reader Support
```typescript
// Meaningful alt text
<img alt="Attack payload template" src="..." />

// Proper heading hierarchy
<h1>Templates</h1>
<h2>Search</h2>
```

---

## Monitoring & Analytics

### Error Tracking
```typescript
// Can integrate with Sentry, LogRocket, etc.
import * as Sentry from "@sentry/react";

Sentry.captureException(error);
```

### Performance Monitoring
```typescript
// Track custom metrics
const startTime = performance.now();
// ... do something
const duration = performance.now() - startTime;
console.log(`Operation took ${duration}ms`);
```

---

## Deployment Checklist

- [ ] Set production environment variables
- [ ] Run build: `npm run build`
- [ ] Test production build: `npm run preview`
- [ ] Run tests: `npm run test`
- [ ] Check console for warnings
- [ ] Verify all API endpoints work
- [ ] Test authentication flow
- [ ] Test on multiple browsers
- [ ] Check mobile responsiveness
- [ ] Verify analytics tracking
- [ ] Set up error monitoring
- [ ] Configure CDN/caching headers
- [ ] Enable HTTPS
- [ ] Set up backups

---

## References

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Query Docs](https://tanstack.com/query/latest)
- [Axios Docs](https://axios-http.com/)
- [Vite Docs](https://vitejs.dev/)
- [Testing Library](https://testing-library.com/)
- [Web Accessibility Guidelines](https://www.w3.org/WAI/)
