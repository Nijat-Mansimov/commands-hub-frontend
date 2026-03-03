# Frontend - Backend Integration Guide

## Overview
This document provides a comprehensive guide for connecting the React frontend with the Node.js/Express backend API for Commands-HUB.

## Prerequisites
- Node.js 18+
- Backend running on `http://localhost:5000`
- Bun or npm installed

## Setup Instructions

### 1. Environment Configuration

Copy `.env.example` to `.env.local` (already created):

```bash
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=Attack Payload System
VITE_APP_VERSION=1.0.0
VITE_ENABLE_ADMIN_FEATURES=true
VITE_ENABLE_ANALYTICS=false
```

### 2. Install Dependencies

```bash
# Using Bun (recommended)
bun install

# Or using npm
npm install
```

### 3. Start Development Server

```bash
# Using Bun
bun run dev

# Or using npm
npm run dev
```

The frontend will be available at `http://localhost:5173`

---

## Project Structure

```
src/
├── components/          # React components
│   ├── auth/           # Authentication components
│   ├── common/         # Common/layout components
│   ├── templates/      # Template-specific components
│   └── ui/             # Shadcn/ui components
├── context/            # React context providers
│   └── AuthContext.tsx # Authentication context
├── hooks/              # Custom React hooks
│   ├── useMutations.ts   # Server mutations (create, update, delete)
│   └── useTemplates.ts   # Query hooks for templates
├── pages/              # Page components
├── services/           # API services
│   ├── api.ts         # Axios instance with interceptors
│   ├── auth.ts        # Authentication API calls
│   ├── templates.ts   # Template API calls
│   └── utils.ts       # Utility functions
├── types/              # TypeScript type definitions
│   ├── auth.ts
│   ├── common.ts
│   └── template.ts
├── lib/                # Utility libraries
├── App.tsx             # Main app component
└── main.tsx            # App entry point
```

---

## API Service Classes

### 1. Axios Configuration (`services/api.ts`)

**Features:**
- Automatic credential handling (withCredentials: true)
- Request/response logging in development
- Comprehensive error handling
- Automatic 401 redirect to login
- Toast notifications for errors

**Request Interceptor:**
- Logs all requests in dev mode
- Adds custom headers
- Can add authentication tokens

**Response Interceptor:**
- Logs successful responses in dev mode
- Handles 401 (Unauthorized) - Redirects to login
- Handles 403 (Forbidden) - Shows permission error
- Handles 404 (Not Found) - Logs warning
- Handles 422/400 (Validation) - Lets component handle
- Handles 500 (Server Error) - Shows server error toast
- Handles network errors - Shows connection error toast

---

## API Services

### Authentication Service (`services/auth.ts`)

```typescript
// Login
await authService.login({ email, password });

// Register
await authService.register({ email, password, username });

// Get current user profile
await authService.getProfile();

// Logout
await authService.logout();

// Change password
await authService.changePassword(currentPassword, newPassword);
```

### Templates Service (`services/templates.ts`)

#### Query Methods

```typescript
// Get all templates with filters
await templatesService.getAll({
  search: 'kerberoasting',
  category: 'Active Directory',
  tool: 'impacket',
  targetSystem: 'Windows',
  difficulty: 'Intermediate',
  sort: 'topRated',
  page: 1,
  limit: 12
});

// Get featured templates
await templatesService.getFeatured();

// Get popular templates
await templatesService.getPopular();

// Get single template by ID
await templatesService.getById(templateId);

// Get similar templates
await templatesService.getSimilar(templateId);

// Get user's templates
await templatesService.getMyTemplates(filters);

// Get available filter options
await templatesService.getFilterOptions();

// Advanced search
await templatesService.advancedSearch('sqlmap');

// Get ratings for template
await templatesService.getRatings(templateId);

// Get admin statistics
await templatesService.getAdminStats();
```

#### Mutation Methods

```typescript
// Create template
await templatesService.create({
  name: 'Kerberoasting Attack',
  description: '...',
  category: 'Active Directory - Kerberoasting from Windows',
  tool: 'impacket',
  targetSystem: 'Windows',
  commandTemplate: 'GetUserSPNs.py ...',
  requiredFields: [...],
  variants: [...]
});

// Update template
await templatesService.update(templateId, updatedTemplate);

// Delete template
await templatesService.delete(templateId);

// Generate single command
await templatesService.generate(templateId, {
  dcip: '192.168.1.1',
  username: 'admin',
  password: 'pass123'
});

// Generate multiple commands
await templatesService.generateBatch(templateId, [
  { dcip: '192.168.1.1', username: 'admin', password: 'pass123' },
  { dcip: '192.168.1.2', username: 'user', password: 'pass456' }
]);

// Add rating
await templatesService.rate(templateId, 5, 'Great template!');

// Feature template (admin)
await templatesService.feature(templateId);

// Unfeature template (admin)
await templatesService.unfeature(templateId);
```

---

## React Query Hooks

### Query Hooks (`hooks/useTemplates.ts`)

```typescript
// Get templates with pagination
const { data, isLoading, error } = useTemplates({
  category: 'Nmap',
  page: 1
});

// Get single template
const { data, isLoading } = useTemplate(templateId);

// Get featured templates
const { data } = useFeaturedTemplates();

// Get popular templates
const { data } = usePopularTemplates();

// Get user's templates
const { data } = useMyTemplates();

// Get similar templates
const { data } = useSimilarTemplates(templateId);

// Get filter options (cached for 5 minutes)
const { data: filterOptions } = useFilterOptions();

// Get admin stats
const { data: stats } = useAdminStats();
```

### Mutation Hooks (`hooks/useMutations.ts`)

```typescript
// Create template
const { mutate: create, isPending } = useCreateTemplate();
create({ name: '...', ... });

// Update template
const { mutate: update } = useUpdateTemplate();
update({ id: templateId, template: {...} });

// Delete template
const { mutate: deleteTemplate } = useDeleteTemplate();
deleteTemplate(templateId);

// Generate command
const { mutate: generate, data } = useGenerateCommand();
generate({ id: templateId, fieldValues: {...} });

// Generate batch commands
const { mutate: generateBatch } = useGenerateBatchCommands();
generateBatch({ id: templateId, fieldValueSets: [...] });

// Rate template
const { mutate: rate } = useRateTemplate();
rate({ id: templateId, score: 5, comment: '...' });

// Feature template
const { mutate: feature } = useFeatureTemplate();
feature(templateId);

// Unfeature template
const { mutate: unfeature } = useUnfeatureTemplate();
unfeature(templateId);

// Register user
const { mutate: register } = useRegister();
register({ email: '...', password: '...', username: '...' });

// Change password
const { mutate: changePassword } = useChangePassword();
changePassword({ currentPassword: '...', newPassword: '...' });
```

---

## Context & State Management

### Authentication Context (`context/AuthContext.tsx`)

```typescript
// Usage in components
const { user, isAuthenticated, isLoading, login, logout } = useAuth();

// Check if user is authenticated
if (isAuthenticated) {
  // Show authenticated content
}

// Login
await login(email, password);

// Logout
await logout();

// Refresh user profile
await refreshUser();
```

### Protected Routes

```typescript
<Route path="/templates/create" element={
  <ProtectedRoute>
    <CreateTemplatePage />
  </ProtectedRoute>
} />
```

---

## Utility Services

### Command Utilities (`services/utils.ts`)

```typescript
// Copy to clipboard
await copyToClipboard(command);

// Download as file
downloadAsFile(content, 'command.txt');

// Export as PowerShell script
exportAsScript(command, 'command.ps1');

// Extract placeholders from template
const placeholders = extractPlaceholders('{{target}} {{port}}');
// Returns: ['target', 'port']

// Validate field values
const { valid, errors } = validateFieldValues(fields, values);

// Validate individual field
const error = validateFieldType('email', 'test@example.com');

// Format bytes
formatBytes(1024 * 1024); // "1 MB"

// Format date
formatDate('2025-03-01T12:00:00Z');

// Format relative time
formatRelativeTime('2025-02-28T12:00:00Z'); // "2 days ago"

// Truncate text
truncateText('Long text...', 20);

// Parse category
parseCategory('Active Directory - Kerberoasting');
// Returns: { major: 'Active Directory', subcategory: 'Kerberoasting' }

// Get major category
getMajorCategory('Nmap - Port Scanning'); // 'Nmap'

// Get subcategory
getSubcategory('Nmap - Port Scanning'); // 'Port Scanning'
```

---

## Common Patterns & Usage Examples

### 1. Fetching Templates with React Query

```typescript
import { useTemplates } from '@/hooks/useTemplates';

export function TemplateList() {
  const [filters, setFilters] = useState({ page: 1 });
  const { data, isLoading, error } = useTemplates(filters);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading templates</div>;

  return (
    <div>
      {data?.data.map(template => (
        <TemplateCard key={template._id} template={template} />
      ))}
    </div>
  );
}
```

### 2. Creating a Template with Mutations

```typescript
import { useCreateTemplate } from '@/hooks/useMutations';
import { useNavigate } from 'react-router-dom';

export function CreateTemplate() {
  const navigate = useNavigate();
  const { mutate: createTemplate, isPending } = useCreateTemplate();

  const handleSubmit = (data) => {
    createTemplate(data, {
      onSuccess: (response) => {
        navigate(`/templates/${response._id}`);
      },
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button disabled={isPending}>
        {isPending ? 'Creating...' : 'Create Template'}
      </button>
    </form>
  );
}
```

### 3. Generating Commands with Validation

```typescript
import { useGenerateCommand } from '@/hooks/useMutations';
import { validateFieldValues } from '@/services/utils';

export function CommandGenerator({ template }) {
  const { mutate: generate, isPending } = useGenerateCommand();
  const [values, setValues] = useState({});

  const handleGenerate = () => {
    const { valid, errors } = validateFieldValues(
      template.requiredFields,
      values
    );

    if (!valid) {
      // Show errors
      return;
    }

    generate({ id: template._id, fieldValues: values });
  };

  return (
    <div>
      {/* Form inputs */}
      <button onClick={handleGenerate} disabled={isPending}>
        Generate
      </button>
    </div>
  );
}
```

### 4. Copying Command with Feedback

```typescript
import { copyToClipboard } from '@/services/utils';
import { toast } from '@/components/ui/use-toast';

export function CopyCommandButton({ command }) {
  const handleCopy = async () => {
    const success = await copyToClipboard(command);
    if (success) {
      toast({
        title: 'Copied!',
        description: 'Command copied to clipboard',
      });
    }
  };

  return <button onClick={handleCopy}>Copy Command</button>;
}
```

### 5. Admin Actions

```typescript
import { useFeatureTemplate, useUnfeatureTemplate } from '@/hooks/useMutations';

export function AdminTemplateActions({ templateId, isFeatured }) {
  const { mutate: feature } = useFeatureTemplate();
  const { mutate: unfeature } = useUnfeatureTemplate();

  return (
    <>
      {!isFeatured ? (
        <button onClick={() => feature(templateId)}>Feature</button>
      ) : (
        <button onClick={() => unfeature(templateId)}>Unfeature</button>
      )}
    </>
  );
}
```

---

## Best Practices

### 1. Error Handling

**Always handle errors in mutations:**

```typescript
const { mutate } = useMutation({
  onError: (error) => {
    const message = error.response?.data?.message || error.message;
    toast({ title: 'Error', description: message, variant: 'destructive' });
  },
});
```

### 2. Loading States

**Show loading indicators:**

```typescript
const { data, isLoading, isFetching } = useQuery({...});

if (isLoading) return <Skeleton />;
if (isFetching) return <div>Updating...</div>;
```

### 3. Query Invalidation

**After mutations, invalidate related queries:**

```typescript
const { mutate } = useMutation({
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['templates'] });
  },
});
```

### 4. Pagination

**Implement client-side pagination:**

```typescript
const [page, setPage] = useState(1);
const { data } = useTemplates({ page, limit: 12 });

const maxPages = data?.pagination.pages || 1;
```

### 5. Form Validation

**Validate before submission:**

```typescript
const { valid, errors } = validateFieldValues(fields, formData);
if (!valid) {
  // Show field errors
  return;
}
// Submit form
```

### 6. Debouncing Search

**Debounce search input:**

```typescript
import { useCallback, useEffect, useState } from 'react';
import { debounce } from '@/services/utils';

const [search, setSearch] = useState('');
const [filters, setFilters] = useState({});

const handleSearch = useCallback(
  debounce((value) => {
    setFilters(prev => ({ ...prev, search: value }));
  }, 300),
  []
);

useEffect(() => {
  handleSearch(search);
}, [search, handleSearch]);
```

### 7. Caching Strategy

**Configure React Query caching:**

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,      // 30 seconds
      gcTime: 5 * 60 * 1000,     // 5 minutes (formerly cacheTime)
      retry: 1,
      retryDelay: 1000,
    },
  },
});
```

### 8. Type Safety

**Always define proper TypeScript types:**

```typescript
interface Template {
  _id: string;
  name: string;
  // ... other fields
}

// Use in components
const { data: template } = useTemplate(id) as { data: Template };
```

---

## Testing API Calls

### Using cURL

```bash
# Get templates
curl http://localhost:5000/api/templates

# Get filters
curl http://localhost:5000/api/filters/options

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' \
  -c cookies.txt

# Create template (with authentication)
curl -X POST http://localhost:5000/api/templates \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{...template_data...}'
```

### Using Postman

1. Import the API endpoints
2. Set `{{base_url}}` to `http://localhost:5000/api`
3. Use `Pre-request Script` to add authentication headers if needed
4. Test authentication by saving login response to variables

---

## Troubleshooting

### 1. CORS Errors

**Issue**: `Access to XMLHttpRequest blocked by CORS policy`

**Solution**:
- Backend must have CORS enabled (already configured)
- Check `withCredentials: true` in api.ts
- Verify backend URL in .env.local

### 2. 401 Unauthorized

**Issue**: Requests returning 401

**Solution**:
- Ensure cookies are being sent (withCredentials: true)
- Check session cookie is present in browser DevTools
- Verify session timeout isn't exceeded
- Try logging in again

### 3. Stale Data

**Issue**: Data not updating after mutation

**Solution**:
- Ensure `invalidateQueries` is called in mutation onSuccess
- Check query keys match exactly
- Clear browser cache and try again

### 4. Slow Requests

**Issue**: API requests taking too long

**Solution**:
- Check backend is running and responsive
- Monitor network in DevTools
- Check for slow database queries on backend
- Verify pagination is being used for large datasets

---

## Deployment

### Build for Production

```bash
# Using Bun
bun run build

# Or using npm
npm run build
```

### Environment Variables for Production

Create `.env.production` with production backend URL:

```
VITE_API_BASE_URL=https://api.yourdomain.com/api
```

### Deploy to Vercel

```bash
vercel --prod
```

### Deploy to Netlify

```bash
netlify deploy --prod --dir=dist
```

---

## Performance Optimization

1. **Code Splitting**: Use React.lazy() for route-lazy loading
2. **Image Optimization**: Compress images, use WebP
3. **Caching**: Configure appropriate staleTime and gcTime
4. **Pagination**: Always paginate large datasets
5. **Debouncing**: Debounce search and filter inputs
6. **Memoization**: Use useMemo and useCallback for expensive operations

---

## Additional Resources

- [React Query Documentation](https://tanstack.com/query/latest)
- [Axios Documentation](https://axios-http.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Shadcn/ui Documentation](https://ui.shadcn.com/)
- [Vite Documentation](https://vitejs.dev/)

For questions or issues, please refer to the backend API documentation in the [backend README](../backend/README.md).
