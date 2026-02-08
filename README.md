# E-Visa Portal

A fully functional frontend-only demo of an Online Visa Portal with Admin Panel. Built with Next.js 14, TypeScript, TailwindCSS, and shadcn/ui.

## Features

### Public Portal
- **Home Page**: Select nationality, destination, and visa type with IP-based auto-detection
- **Country Pages**: Detailed visa information for each destination
- **Application Flow**: Dynamic form rendering based on admin-configured templates
- **Email Verification**: Demo verification with code "123456"
- **Multiple Applicants**: Add multiple applicants to a single application
- **Payment**: Simulated payment with 3-hour deadline
- **Track Application**: Track status using email and application code
- **User Portal**: View all applications after email verification

### Admin Panel
- **Dashboard**: Overview of applications and statistics
- **Visa Types**: CRUD for visa types (Tourism, Business, Transit, etc.)
- **Countries**: Manage country pages with custom sections
- **Templates**: Dynamic form builder with sections and fields
- **Template Bindings**: Bind templates to destination + visa type + nationalities with fees
- **Applications**: View and manage all applications, update status per applicant
- **Payment Page Builder**: Add custom fields to payment page
- **Email Templates**: Manage notification email templates
- **Users**: RBAC user management (Super Admin, Admin, Operator)
- **Settings**: Reset demo data

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS + shadcn/ui
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **Tables**: TanStack Table
- **Storage**: localStorage + IndexedDB (Dexie)

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Navigate to project directory
cd e-visa

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the public portal.

### Demo Accounts

Access the admin panel at [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

| Role | Email | Password |
|------|-------|----------|
| Super Admin | super@visa.com | super123 |
| Admin | admin@visa.com | admin123 |
| Operator | operator@visa.com | operator123 |

### Demo Verification Code

For email verification (both public and user portal), use code: **123456**

## Project Structure

```
src/
├── app/
│   ├── (public)/          # Public pages (Home, Apply, Track, etc.)
│   ├── admin/             # Admin panel pages
│   └── layout.tsx         # Root layout
├── components/
│   ├── shared/            # Shared components
│   └── ui/                # shadcn/ui components
├── data/
│   └── un_countries.ts    # UN member states list (193 countries)
├── lib/
│   ├── storage/           # localStorage & IndexedDB utilities
│   └── utils/             # Utility functions
├── services/              # Mock service layer
├── stores/                # Zustand stores
└── types/                 # TypeScript types
```

## Key Features Explained

### Dynamic Form Builder
Admin can create application templates with:
- Unlimited sections (e.g., Personal Info, Passport, Documents)
- Unlimited fields per section
- Field types: text, textarea, select, radio, checkbox, date, file, email, phone, number
- Validation: required, min/max length, regex, custom error messages
- Conditional visibility: show field based on another field's value

### Template Bindings
The binding system allows:
1. Create a template (form structure)
2. Bind template to Destination + Visa Type
3. Assign nationalities with specific fees:
   - Government fee
   - Service fee
   - Currency
   - Optional expedited fee

### Application Flow
1. User selects nationality, destination, visa type
2. System shows fee preview based on binding
3. User verifies email (code: 123456)
4. User fills dynamic form (rendered from template)
5. User can add multiple applicants
6. Review and confirm
7. Payment (3-hour deadline)
8. Each applicant receives unique application code
9. Track status using email + code

### Status Management
Per-applicant status tracking:
- Draft → Unpaid → Submitted → In Review → Need Docs → Approved/Rejected → Ready to Download

## Data Persistence

All data is stored locally:
- **localStorage**: Visa types, templates, bindings, applications, users, settings
- **IndexedDB**: Uploaded files (documents, photos)

Use "Reset Demo Data" in Admin Settings to restore initial state.

## Pages

### Public
- `/` - Home (visa selection)
- `/country/[slug]` - Country visa information
- `/apply` - Application form
- `/apply/review` - Review before payment
- `/payment` - Payment page
- `/track` - Track application status
- `/resume/[token]` - Resume unpaid application
- `/me` - User portal
- `/about`, `/faq`, `/privacy`, `/terms`, `/contact` - Static pages

### Admin
- `/admin/login` - Admin login
- `/admin` - Dashboard
- `/admin/applications` - Applications list
- `/admin/applications/[id]` - Application details
- `/admin/countries` - Country pages
- `/admin/countries/[id]` - Edit country page
- `/admin/visa-types` - Visa types
- `/admin/templates` - Form templates
- `/admin/templates/[id]` - Edit template
- `/admin/template-bindings` - Manage bindings
- `/admin/payment-page-builder` - Payment page fields
- `/admin/email-templates` - Email templates
- `/admin/users` - Admin users
- `/admin/settings` - App settings

## Notes

- This is a **frontend-only demo** - no backend required
- All data is stored in browser (localStorage/IndexedDB)
- Payment is simulated - no real transactions
- Email verification accepts only "123456"
- IP geolocation uses ipapi.co with fallback to Azerbaijan

## License

This project is for demonstration purposes only.
