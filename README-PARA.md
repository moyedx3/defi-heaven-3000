# Para SDK Test App

Minimal Next.js app with Para SDK integration for testing.

## Setup

1. Get your Para API key from [Developer Portal](https://developer.getpara.com)
   - For testing, use a BETA API key (starts with `beta_`)

2. Create `.env.local` file:
```bash
NEXT_PUBLIC_PARA_API_KEY=beta_YOUR_API_KEY_HERE
```

3. Install dependencies (already done):
```bash
npm install
```

4. Run the dev server:
```bash
npm run dev
```

## Testing

Use these test credentials in the BETA environment:

- **Email**: Any email ending in `@test.getpara.com`
  - Examples: `dev@test.getpara.com`, `test1@test.getpara.com`
  - **Any OTP code will work** (e.g., `123456`, `000000`)

- **Phone**: US phone numbers in format `(xxx)-555-xxxx`
  - Examples: `(425)-555-1234`, `(206)-555-9876`
  - **Any OTP code will work**

## Important Notes

- Test credentials **only work in BETA environment**
- BETA accounts are limited to **50 users**
- Delete users via [Developer Portal](https://developer.getpara.com) if you hit the limit
- Production requires real contact information and OTP verification

## Files

- `app/providers.tsx` - Para SDK provider setup
- `app/page.tsx` - Minimal connect wallet UI
- `app/layout.tsx` - Root layout with providers

