# Frontend Quick Start Guide

## 5-Minute Setup

### 1. Install Dependencies
```bash
bun install
# or: npm install
```

### 2. Configure Environment
The `.env.local` file is already created with defaults. For local development, it should work as-is:
```
VITE_API_BASE_URL=http://localhost:5000/api
```

### 3. Start Development Server
```bash
bun run dev
# or: npm run dev
```

Open http://localhost:5173 in your browser.

### 4. Backend Requirement
Make sure the backend is running on http://localhost:5000:
```bash
cd ../backend
npm install
npm start
```

---

## Common Tasks

### View All Templates
```
URL: http://localhost:5173/templates
API: GET /api/templates
```

### Create a Template
```
URL: http://localhost:5173/templates/create
API: POST /api/templates
Requires: Authentication
```

### View Single Template
```
URL: http://localhost:5173/templates/:id
API: GET /api/templates/:id
```

### Generate Command
```
API: POST /api/templates/:id/generate
Body: { fieldValues: { field1: 'value1', ... } }
```

### Rate Template
```
API: POST /api/templates/:id/rate
Body: { score: 5, comment: 'Great!' }
Requires: Authentication
```

### Admin Dashboard
```
URL: http://localhost:5173/admin
API: GET /api/admin/stats
Requires: Admin role
```

---

## Build & Deploy

### Build for Production
```bash
bun run build
# Output: dist/
```

### Preview Production Build
```bash
bun run preview
```

### Deploy (Example: Vercel)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

---

## Project Structure

```
src/
├── pages/          # Page components (routes)
├── components/     # Reusable components
├── hooks/          # Custom React hooks
├── services/       # API & utility services
├── context/        # React context
├── types/          # TypeScript definitions
└── lib/            # Utility libraries
```

---

## Key Files to Know

| File | Purpose |
|------|---------|
| `src/services/api.ts` | Axios instance with interceptors |
| `src/services/auth.ts` | Authentication API calls |
| `src/services/templates.ts` | Template API calls |
| `src/hooks/useMutations.ts` | Server mutation hooks |
| `src/hooks/useTemplates.ts` | Query hooks |
| `src/context/AuthContext.tsx` | Authentication state |

---

## Debugging

### Enable Detailed Logging
In `src/services/api.ts`, all requests/responses are logged in development mode:
```
[API Request] GET /api/templates
[API Response] 200 /api/templates
```

### Browser DevTools
1. Open DevTools (F12)
2. Network tab: View all API requests
3. Console tab: See request/response logs
4. Storage tab: Check cookies and session

### React Query DevTools
The app includes React Query DevTools in development:
```typescript
// In App.tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
```

---

## Common Issues & Solutions

### Issue: "Cannot connect to backend"
**Solution**: Ensure backend is running on http://localhost:5000
```bash
cd ../backend
npm start
```

### Issue: "401 Unauthorized"
**Solution**: Log out and log back in
```typescript
// In browser console
localStorage.clear()
```

### Issue: "Stale data after creating template"
**Solution**: Verify `invalidateQueries` is working:
```bash
# Check React Query DevTools for query updates
```

### Issue: Port 5173 already in use
**Solution**: Use different port
```bash
bun run dev -- --port 5174
```

---

## Code Examples

### Display Templates with Filters
```typescript
import { useTemplates } from '@/hooks/useTemplates';

export function TemplateList() {
  const [filters, setFilters] = useState({ category: 'Nmap' });
  const { data, isLoading } = useTemplates(filters);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-3 gap-4">
      {data?.data.map(t => (
        <TemplateCard key={t._id} template={t} />
      ))}
    </div>
  );
}
```

### Create & Submit Template
```typescript
import { useCreateTemplate } from '@/hooks/useMutations';
import { useNavigate } from 'react-router-dom';

export function CreateTemplate() {
  const navigate = useNavigate();
  const { mutate, isPending } = useCreateTemplate();

  const onSubmit = (data) => {
    mutate(data, {
      onSuccess: (response) => {
        navigate(`/templates/${response._id}`);
      },
    });
  };

  return (
    <form onSubmit={onSubmit}>
      {/* Form fields */}
      <button disabled={isPending} type="submit">
        {isPending ? 'Creating...' : 'Create'}
      </button>
    </form>
  );
}
```

### Generate Command with Validation
```typescript
import { useGenerateCommand } from '@/hooks/useMutations';
import { validateFieldValues } from '@/services/utils';

export function CommandGenerator({ template }) {
  const [values, setValues] = useState({});
  const { mutate, isPending, data } = useGenerateCommand();

  const handleGenerate = () => {
    const { valid, errors } = validateFieldValues(
      template.requiredFields,
      values
    );

    if (!valid) {
      // Show errors in UI
      console.log(errors);
      return;
    }

    mutate({ id: template._id, fieldValues: values });
  };

  return (
    <div>
      {/* Input fields */}
      <button onClick={handleGenerate} disabled={isPending}>
        Generate
      </button>
      {data?.command && <pre>{data.command}</pre>}
    </div>
  );
}
```

### Copy Command to Clipboard
```typescript
import { copyToClipboard } from '@/services/utils';
import { toast } from '@/components/ui/use-toast';

export function CopyButton({ command }) {
  const handleCopy = async () => {
    const success = await copyToClipboard(command);
    if (success) {
      toast({ title: 'Copied!', description: 'Command in clipboard' });
    }
  };

  return <button onClick={handleCopy}>Copy</button>;
}
```

---

## Next Steps

1. **Read Full Guide**: See `API_INTEGRATION_GUIDE.md` for comprehensive documentation
2. **Explore Components**: Check `src/components/templates/` for template examples
3. **Review Pages**: Look at `src/pages/` to understand app structure
4. **Run Tests**: `bun run test` (if configured)
5. **Check Backend**: Visit `/backend/QUICKSTART.md` for backend setup

---

## Useful Commands

```bash
# Development
bun run dev          # Start dev server
bun run build        # Build for production
bun run preview      # Preview production build
bun run lint         # Run ESLint
bun run type-check   # Check TypeScript types
bun run test         # Run tests

# Or with npm
npm run dev
npm run build
# etc...
```

---

## API Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/auth/login` | Login user |
| POST | `/auth/register` | Register user |
| POST | `/auth/logout` | Logout user |
| GET | `/auth/profile` | Get current user |
| GET | `/templates` | List templates |
| GET | `/templates/featured` | Get featured |
| GET | `/templates/:id` | Get template detail |
| POST | `/templates/:id/generate` | Generate command |
| POST | `/templates/:id/rate` | Rate template |
| GET | `/filters/options` | Get filter options |
| POST | `/templates` | Create template |
| PUT | `/templates/:id` | Update template |
| DELETE | `/templates/:id` | Delete template |
| GET | `/admin/stats` | Get admin stats |

For complete endpoint documentation, see `/backend/SCHEMA.md` and `/backend/README.md`.

---

Happy coding! 🚀
