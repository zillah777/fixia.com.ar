# FIXIA.COM.AR - REPAIR IMPLEMENTATION GUIDE 2025

**Purpose:** Step-by-step code fixes for all identified issues
**Total Fixes:** 12 issues
**Estimated Implementation Time:** 4 weeks (18 hours development)
**Complexity:** Mostly LOW to MEDIUM

---

## PART 1: CRITICAL FIXES (4 issues - 2 hours)

### FIX #1: Hero Text Scaling on Mobile (30 min)

**File:** `apps/web/src/pages/HomePage.tsx`
**Line:** ~132

**Current Code:**
```tsx
<h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold">
  Find Professional Services
</h1>
```

**Problem:** 36px on 320px screens = excessive wrapping

**Fixed Code:**
```tsx
<h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold">
  Find Professional Services
</h1>
```

**Also Update tailwind.config.js:**
```javascript
export default {
  theme: {
    extend: {
      screens: {
        'xs': '360px',  // Add this for better coverage
      }
    }
  }
}
```

**Verification:**
- Test on 320px simulator
- Test on iPhone SE (375px)
- Verify text doesn't wrap more than 2 lines

---

### FIX #2: Navigation Sheet Width on Mobile (30 min)

**File:** `apps/web/src/components/MobileNavigation.tsx`
**Line:** ~150

**Current Code:**
```tsx
<SheetContent className="w-80" side="left">
  {/* Navigation content */}
</SheetContent>
```

**Problem:** w-80 = 320px, overflows on 320px screens

**Fixed Code:**
```tsx
<SheetContent className="w-[85vw] sm:w-80 max-w-sm" side="left">
  {/* Navigation content */}
</SheetContent>
```

**Explanation:**
- `w-[85vw]`: Use 85% of viewport width on small screens
- `sm:w-80`: Use 320px fixed width on sm+ screens
- `max-w-sm`: Cap at 384px (sm breakpoint)

**Verification:**
- Test on 320px, 375px, 640px
- Sheet should never overflow screen
- Content should be readable

---

### FIX #3: Dynamic Tailwind Classes (30 min)

**File:** `apps/web/src/pages/DashboardPage.tsx`
**Line:** ~35

**Current Code:**
```tsx
<div className={`grid grid-cols-2 md:grid-cols-2 lg:grid-cols-${isProfessional ? '3' : '4'} gap-3 sm:gap-4`}>
  {/* Quick action cards */}
</div>
```

**Problem:** Template literal not scanned by Tailwind purger

**Fixed Code:**
```tsx
import { cn } from "@/lib/utils";

<div className={cn(
  "grid grid-cols-2 md:grid-cols-2 gap-3 sm:gap-4",
  isProfessional ? "lg:grid-cols-3" : "lg:grid-cols-4"
)}>
  {/* Quick action cards */}
</div>
```

**Alternative if cn() utility doesn't exist:**
```tsx
<div className={isProfessional
  ? "grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
  : "grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
}>
  {/* Quick action cards */}
</div>
```

**Verification:**
- Check browser DevTools for applied styles
- Verify grid columns correct for professionals vs clients
- Test on lg: breakpoint (1024px)

---

### FIX #4: Touch Target Sizes - Accessibility (1 hour)

**File:** `apps/web/src/components/MobileNavigation.tsx`
**Line:** ~299 (and similar in MobileBottomNavigation)

**Current Code:**
```tsx
<button className="py-2 px-4 text-sm hover:text-foreground/80">
  {item.label}
</button>
```

**Problem:** py-2 = 8px → total height ~28-32px (below 44px minimum)

**Fixed Code - Option A (Vertical stacking):**
```tsx
<button className="w-full py-3 px-4 text-sm hover:text-foreground/80 flex flex-col items-center gap-2">
  <span className="text-xl">{item.icon}</span>
  <span className="text-xs">{item.label}</span>
</button>
```

**Fixed Code - Option B (Horizontal layout):**
```tsx
<button className="min-h-12 min-w-12 py-2 px-4 text-sm hover:text-foreground/80 flex items-center gap-3">
  <span className="text-lg">{item.icon}</span>
  <span>{item.label}</span>
</button>
```

**Best Practice:**
```tsx
// Create a reusable component
export function NavButton({
  icon: Icon,
  label,
  onClick
}: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-full h-14 px-4 py-2 flex items-center gap-3 hover:bg-accent/50 rounded-md transition-colors"
      aria-label={label}
    >
      <Icon className="h-5 w-5" />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}
```

**Verification:**
- Check with WAVE accessibility tool
- Test on actual mobile device (not simulator)
- Verify each touch target is 44x44px minimum
- Check focus states visible with keyboard navigation

---

## PART 2: HIGH PRIORITY FIXES (3 issues - 8 hours)

### FIX #5: Data Export Feature (3 hours)

**File 1:** `apps/web/src/pages/ProfilePage.tsx` (Frontend)

**Current Code:**
```tsx
const handleDataDownload = () => {
  toast.info('Descargando datos...');
  // Placeholder
};
```

**Fixed Code:**
```tsx
// 1. Add state at component level
const [isExporting, setIsExporting] = useState(false);

// 2. Implement the handler
const handleDataDownload = async () => {
  try {
    setIsExporting(true);

    // Call API with blob response type
    const response = await apiClient.get('/user/export', {
      responseType: 'blob',
      timeout: 60000 // Increase timeout for large exports
    });

    // Create blob URL and download
    const url = window.URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fixia-data-${new Date().toISOString().split('T')[0]}.zip`;

    // Trigger download
    document.body.appendChild(link);
    link.click();

    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 100);

    toast.success('Tus datos han sido descargados exitosamente en formato ZIP');
  } catch (error: any) {
    console.error('Data export error:', error);
    toast.error(
      error.response?.data?.message ||
      'Error al descargar datos. Intenta más tarde.'
    );
  } finally {
    setIsExporting(false);
  }
};

// 3. Update button with loading state
<Button
  onClick={handleDataDownload}
  disabled={isExporting}
  variant="outline"
  className="w-full"
>
  {isExporting ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Descargando datos...
    </>
  ) : (
    <>
      <Download className="mr-2 h-4 w-4" />
      Descargar mis datos
    </>
  )}
</Button>
```

**File 2:** Backend API (`apps/api/src/users/users.controller.ts`)

**Add Endpoint:**
```typescript
@Get('export')
@UseGuards(JwtAuthGuard)
async exportUserData(@CurrentUser() user: User, @Res() res: Response) {
  try {
    // 1. Fetch all user data
    const userData = await this.usersService.getUserCompleteData(user.id);

    // 2. Create ZIP file with JSON and CSV exports
    const archive = archiver('zip', { zlib: { level: 9 } });

    // Add JSON export
    archive.append(JSON.stringify(userData, null, 2), {
      name: 'user-data.json'
    });

    // Add metadata
    archive.append(
      JSON.stringify({
        exportDate: new Date().toISOString(),
        userId: user.id,
        format: 'GDPR Data Portability',
        version: '1.0'
      }, null, 2),
      { name: 'export-metadata.json' }
    );

    // 3. Set response headers
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="fixia-data-${Date.now()}.zip"`
    );

    // 4. Pipe archive to response
    archive.pipe(res);
    archive.finalize();

    // 5. Log export action
    this.auditService.log({
      userId: user.id,
      action: 'DATA_EXPORT',
      timestamp: new Date(),
      ip: req.ip
    });

  } catch (error) {
    throw new InternalServerErrorException('Failed to export data');
  }
}

// Helper method to gather all user data
async getUserCompleteData(userId: string) {
  return {
    profile: await this.prisma.user.findUnique({ where: { id: userId } }),
    services: await this.prisma.service.findMany({ where: { userId } }),
    opportunities: await this.prisma.opportunity.findMany({ where: { userId } }),
    jobs: await this.prisma.job.findMany({ where: { userId } }),
    feedback: await this.prisma.feedback.findMany({ where: { userId } }),
    notifications: await this.prisma.notification.findMany({ where: { userId } }),
    favorites: await this.prisma.favorite.findMany({ where: { userId } }),
  };
}
```

**Install Dependencies:**
```bash
npm install archiver
npm install --save-dev @types/archiver
```

**Verification:**
- [ ] Export creates valid ZIP file
- [ ] ZIP contains all user data in JSON format
- [ ] Download triggers automatically
- [ ] File naming includes date
- [ ] Large exports don't timeout (60s)
- [ ] Audit log records export action

---

### FIX #6: Account Deletion (4 hours)

**File 1:** Create new component `apps/web/src/components/DeleteAccountDialog.tsx`

```tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '../lib/api';
import { useSecureAuth } from '../context/SecureAuthContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';
import { AlertCircle, Loader2 } from 'lucide-react';

type DeleteStep = 'warning' | 'password' | 'confirm' | 'final';

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteAccountDialog({ open, onOpenChange }: DeleteAccountDialogProps) {
  const [step, setStep] = useState<DeleteStep>('warning');
  const [password, setPassword] = useState('');
  const [reason, setReason] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const { logout } = useSecureAuth();
  const navigate = useNavigate();

  const handleNext = () => {
    switch (step) {
      case 'warning':
        setStep('password');
        break;
      case 'password':
        if (!password.trim()) {
          setError('La contraseña es requerida');
          return;
        }
        setError('');
        setStep('confirm');
        break;
      case 'confirm':
        setStep('final');
        break;
    }
  };

  const handleConfirmDelete = async () => {
    if (!password.trim()) {
      setError('La contraseña es requerida para confirmar');
      return;
    }

    try {
      setIsDeleting(true);
      setError('');

      // Call API to initiate deletion
      await api.post('/user/account/delete', {
        password,
        reason: reason.trim() || undefined,
        confirmation: true
      });

      toast.success(
        'Tu cuenta será eliminada en 30 días. Recibirás un email de confirmación.'
      );

      // Logout user
      await logout();

      // Redirect to home
      setTimeout(() => {
        navigate('/');
      }, 2000);

      onOpenChange(false);
    } catch (error: any) {
      const message = error.response?.data?.message ||
                     'Error al eliminar la cuenta. Intenta más tarde.';
      setError(message);
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setStep('warning');
    setPassword('');
    setReason('');
    setError('');
    onOpenChange(false);
  };

  // Step 1: Warning
  if (step === 'warning') {
    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Eliminar Cuenta Permanentemente
            </AlertDialogTitle>
          </AlertDialogHeader>

          <AlertDialogDescription className="space-y-3">
            <p>
              ⚠️ <strong>ADVERTENCIA:</strong> Esta acción no se puede deshacer.
            </p>

            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
              <ul className="text-sm space-y-2">
                <li>✗ Se eliminarán todos tus datos personales</li>
                <li>✗ Se borrarán tus servicios y anuncios</li>
                <li>✗ Perderás acceso a tu cuenta y tu historial</li>
                <li>✗ No podrás recuperar esta información</li>
              </ul>
            </div>

            <p className="text-sm">
              <strong>Período de gracia:</strong> Tu cuenta será eliminada en 30 días.
              Puedes cancelar la eliminación en cualquier momento durante este período.
            </p>
          </AlertDialogDescription>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>
              No, cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleNext}
              className="bg-destructive hover:bg-destructive/90"
            >
              Continuar eliminación
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  // Step 2: Password verification
  if (step === 'password') {
    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Verifica tu identidad</AlertDialogTitle>
          </AlertDialogHeader>

          <AlertDialogDescription>
            Ingresa tu contraseña para confirmar que deseas eliminar tu cuenta.
          </AlertDialogDescription>

          <div className="space-y-3">
            <Input
              type="password"
              placeholder="Tu contraseña"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              disabled={isDeleting}
              onKeyDown={(e) => e.key === 'Enter' && handleNext()}
            />

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel} disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleNext}
              disabled={isDeleting || !password.trim()}
              className="bg-destructive hover:bg-destructive/90"
            >
              Continuar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  // Step 3: Reason (optional)
  if (step === 'confirm') {
    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Por qué te vas?</AlertDialogTitle>
          </AlertDialogHeader>

          <AlertDialogDescription>
            Nos gustaría saber por qué deseas eliminar tu cuenta (opcional).
            Esto nos ayuda a mejorar.
          </AlertDialogDescription>

          <Textarea
            placeholder="Cuéntanos qué nos falta..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={isDeleting}
            rows={3}
            className="resize-none"
          />

          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel} disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleNext}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              Continuar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  // Step 4: Final confirmation
  if (step === 'final') {
    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">
              Confirmar eliminación
            </AlertDialogTitle>
          </AlertDialogHeader>

          <AlertDialogDescription className="space-y-3">
            <p>
              <strong>Última oportunidad para cambiar de opinión.</strong>
            </p>
            <p>
              Tu cuenta será marcada para eliminación. Recibirás un email de
              confirmación. Tienes 30 días para cancelar si cambias de opinión.
            </p>
            <p className="text-sm">
              Después de 30 días, tu cuenta y todos tus datos se eliminarán
              permanentemente.
            </p>
          </AlertDialogDescription>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel} disabled={isDeleting}>
              No, cancelar
            </AlertDialogCancel>
            <Button
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              variant="destructive"
              className="w-full"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                'Sí, eliminar mi cuenta'
              )}
            </Button>
          </AlertDialogFooter>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded p-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </AlertDialogContent>
      </AlertDialog>
    );
  }
}
```

**File 2:** Update ProfilePage to use component

```tsx
// 1. Import the new component
import { DeleteAccountDialog } from '../components/DeleteAccountDialog';

// 2. Add state
const [showDeleteDialog, setShowDeleteDialog] = useState(false);

// 3. Add button
<Button
  onClick={() => setShowDeleteDialog(true)}
  variant="destructive"
  className="w-full"
>
  <Trash2 className="mr-2 h-4 w-4" />
  Eliminar Cuenta Permanentemente
</Button>

// 4. Add dialog component
<DeleteAccountDialog
  open={showDeleteDialog}
  onOpenChange={setShowDeleteDialog}
/>
```

**File 3:** Backend API (`apps/api/src/users/users.controller.ts`)

```typescript
@Post('account/delete')
@UseGuards(JwtAuthGuard)
async deleteAccount(
  @CurrentUser() user: User,
  @Body() body: DeleteAccountDto,
  @Req() req: Request
) {
  try {
    // 1. Verify password
    const isPasswordValid = await bcrypt.compare(
      body.password,
      user.password_hash
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Contraseña incorrecta');
    }

    // 2. Mark account for deletion
    const deletionDate = new Date();
    deletionDate.setDate(deletionDate.getDate() + 30); // 30 days grace period

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        deletionScheduledAt: deletionDate,
        deletionReason: body.reason || null,
        updatedAt: new Date()
      }
    });

    // 3. Send confirmation email
    await this.emailService.sendAccountDeletionNotice({
      email: user.email,
      name: user.name,
      deletionDate,
      cancellationUrl: `${process.env.FRONTEND_URL}/cancel-deletion?token=${token}`
    });

    // 4. Audit log
    await this.auditService.log({
      userId: user.id,
      action: 'ACCOUNT_DELETION_REQUESTED',
      scheduledDate: deletionDate,
      ip: req.ip,
      timestamp: new Date()
    });

    return {
      success: true,
      message: 'Cuenta marcada para eliminación en 30 días',
      deletionDate
    };

  } catch (error) {
    if (error instanceof UnauthorizedException) {
      throw error;
    }
    throw new InternalServerErrorException('Error al procesar la solicitud');
  }
}

// Scheduled job to delete accounts after 30 days
@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
async deletePendingAccounts() {
  const now = new Date();

  const usersToDelete = await this.prisma.user.findMany({
    where: {
      deletionScheduledAt: {
        lte: now
      }
    }
  });

  for (const user of usersToDelete) {
    // 1. Delete all user data
    await this.prisma.service.deleteMany({ where: { userId: user.id } });
    await this.prisma.opportunity.deleteMany({ where: { userId: user.id } });
    await this.prisma.job.deleteMany({ where: { userId: user.id } });
    await this.prisma.feedback.deleteMany({ where: { userId: user.id } });
    await this.prisma.notification.deleteMany({ where: { userId: user.id } });

    // 2. Delete user account
    await this.prisma.user.delete({ where: { id: user.id } });

    // 3. Log deletion
    await this.auditService.log({
      userId: user.id,
      action: 'ACCOUNT_PERMANENTLY_DELETED',
      timestamp: new Date()
    });
  }
}
```

**Verification:**
- [ ] Dialog shows 4-step flow
- [ ] Password verification works
- [ ] Account marked for deletion (30 day grace period)
- [ ] Confirmation email sent
- [ ] Cancellation link in email works
- [ ] Scheduled job deletes account after 30 days
- [ ] Audit log records action

---

### FIX #7: Input Field Responsive Padding (1 hour)

**File:** `apps/web/src/components/ui/input.tsx`

**Current Code:**
```tsx
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
);
```

**Fixed Code:**
```tsx
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-11 sm:h-12 w-full rounded-md border border-input bg-background px-3 sm:px-4 py-2 text-base sm:text-lg placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
);
```

**Changes:**
- `h-11` → `h-11 sm:h-12` (44px → 48px at breakpoint)
- `px-3` → `px-3 sm:px-4` (12px → 16px padding)
- `text-base` → `text-base sm:text-lg` (16px → 18px text)

**Verification:**
- [ ] Test on mobile keyboard visibility
- [ ] Test on tablet layout
- [ ] Verify padding scales smoothly
- [ ] Check no text clipping

---

## PART 3: MEDIUM PRIORITY FIXES (3 issues - 6 hours)

### FIX #8: Button Text Responsive Sizing (1.5 hours)

**Find all buttons with fixed text sizing and update:**

**Pattern 1 - Hero CTA buttons (HomePage.tsx)**
```tsx
// Before
<Button className="px-6 sm:px-10 text-sm">
  Get Started
</Button>

// After
<Button className="px-6 sm:px-10 text-sm sm:text-base">
  Get Started
</Button>
```

**Pattern 2 - Form buttons (Forms)**
```tsx
// Before
<Button type="submit" className="w-full">
  Submit
</Button>

// After
<Button type="submit" className="w-full text-base">
  Submit
</Button>
```

**Pattern 3 - Icon buttons (Toolbars)**
```tsx
// Before
<button className="p-2 hover:bg-accent">
  <Icon className="h-4 w-4" />
</button>

// After
<button className="p-2 sm:p-2.5 hover:bg-accent min-h-10 min-w-10">
  <Icon className="h-5 w-5" />
</button>
```

**Audit Script:**
```bash
# Find all className=".*text-sm" without sm:text variant
grep -r "className=\".*text-sm" apps/web/src --include="*.tsx" | grep -v "sm:text"
```

---

### FIX #9: Grid Layout Breakpoints (2 hours)

**Audit and fix all grid layouts missing sm: breakpoint:**

**Pattern to find:**
```tsx
<div className="grid grid-cols-2 md:grid-cols-3">
```

**Should be:**
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
```

**Find all instances:**
```bash
grep -r "grid grid-cols-" apps/web/src --include="*.tsx" | grep -v "sm:" | head -20
```

**Common locations to fix:**
1. HomePage.tsx - Featured services section
2. DashboardPage.tsx - Quick actions (already covered)
3. ServicesPage.tsx - Service cards
4. OpportunitiesPage.tsx - Opportunity cards
5. Cards layouts throughout

---

### FIX #10: Image Optimization and Lazy Loading (2 hours)

**Create utility:**
```typescript
// apps/web/src/utils/imageOptimization.ts
export function getOptimizedImageUrl(
  url: string,
  width: number,
  height: number,
  quality: number = 80
): string {
  // If already optimized, return as-is
  if (url.includes('?w=')) return url;

  // Add optimization params
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}w=${width}&h=${height}&q=${quality}`;
}

export interface ImageWithOptimizationProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false
}: ImageWithOptimizationProps) {
  const optimizedSrc = getOptimizedImageUrl(src, width, height);

  return (
    <img
      src={optimizedSrc}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      className={`aspect-video object-cover ${className || ''}`}
    />
  );
}
```

**Apply to images:**
```tsx
// Before
<img src={imageUrl} alt="Service" />

// After
<OptimizedImage
  src={imageUrl}
  alt="Service"
  width={400}
  height={300}
  className="rounded-lg"
/>
```

---

### FIX #11: Modal Background Scrim (1 hour)

**File:** `apps/web/src/styles/globals.css`

**Add:**
```css
/* Modal/Dialog backdrop styling */
@supports (backdrop-filter: blur(1px)) {
  [role="dialog"]::backdrop {
    background-color: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
  }

  .dialog-overlay {
    background-color: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
  }
}

/* Fallback for browsers without backdrop-filter support */
@supports not (backdrop-filter: blur(1px)) {
  [role="dialog"]::backdrop {
    background-color: rgba(0, 0, 0, 0.7);
  }

  .dialog-overlay {
    background-color: rgba(0, 0, 0, 0.7);
  }
}
```

**Verify in Radix Dialog component:**
```tsx
<DialogContent className="... dark:bg-slate-950">
  {/* Content */}
</DialogContent>
```

---

### FIX #12: Error State Styling (1.5 hours)

**Create error styling system:**

```tsx
// apps/web/src/components/FormField.tsx
export function FormField({
  label,
  error,
  children,
  required = false
}: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>

      <div className="relative">
        {children}
      </div>

      {error && (
        <p className="text-xs text-destructive flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}

// Usage
<FormField label="Email" error={errors.email} required>
  <Input
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    className={cn(
      errors.email && "border-destructive focus-visible:ring-destructive"
    )}
    aria-invalid={!!errors.email}
  />
</FormField>
```

**Add to all form inputs throughout the app:**
```bash
# Find all Input fields in forms
grep -r "<Input" apps/web/src/pages --include="*.tsx" | head -20
```

---

## PART 4: TESTING & VALIDATION

### Automated Testing Checklist

```typescript
// apps/web/src/__tests__/responsive.test.tsx
import { render, screen } from '@testing-library/react';
import HomePage from '../pages/HomePage';

describe('Responsive Design', () => {
  it('should display hero text with correct scaling', () => {
    const { container } = render(<HomePage />);
    const hero = container.querySelector('h1');

    // Check classes include all breakpoints
    expect(hero?.className).toContain('text-3xl');
    expect(hero?.className).toContain('sm:text-5xl');
    expect(hero?.className).toContain('md:text-6xl');
  });

  it('should apply touch targets of minimum 44px', () => {
    const { container } = render(<NavButton label="Test" />);
    const button = container.querySelector('button');

    // Check min-height class
    expect(button?.className).toContain('min-h-');
  });

  it('should use cn() utility for dynamic classes', () => {
    const { container } = render(
      <DashboardPage userRole="professional" />
    );
    const grid = container.querySelector('.grid');

    // Verify Tailwind classes are applied (not template literals)
    expect(grid?.className).toMatch(/grid-cols-[34]/);
  });
});
```

### Manual Testing Checklist

- [ ] Test on real devices (320px, 375px, 768px, 1440px)
- [ ] Check text scaling smooth across breakpoints
- [ ] Verify navigation sheet width doesn't overflow
- [ ] Touch all buttons/inputs - should be 44x44px minimum
- [ ] Download data export - should create ZIP file
- [ ] Delete account - should show 4-step flow
- [ ] Test dark mode on all fixed pages
- [ ] Check focus states on keyboard navigation
- [ ] Verify error messages appear on form failures

---

## COMPLETION TIMELINE

**Week 1: Critical Fixes (2 hours)**
- [ ] Fix hero text scaling
- [ ] Fix navigation sheet width
- [ ] Fix dynamic Tailwind classes
- [ ] Fix touch target sizes
- Deploy and test

**Week 2: High Priority (8 hours)**
- [ ] Data export feature
- [ ] Account deletion
- [ ] Input padding
- Deploy to staging

**Week 3: Medium Priority (6 hours)**
- [ ] Button text sizing
- [ ] Grid breakpoints
- [ ] Image optimization
- [ ] Modal styling
- [ ] Error styling
- QA testing

**Week 4: Final Polish (2 hours)**
- [ ] Full regression testing
- [ ] Performance optimization
- [ ] Deploy to production

---

**Total Implementation Time:** 18 hours
**Quality Gate:** All fixes tested on real devices before deployment

