# StockSense — application

This directory contains the Next.js application. The full project README lives at the
[repository root](../README.md).

## Quick start

```bash
npm install
npx prisma generate    # the Prisma client is not committed
npx prisma db push     # create prisma/dev.db (not committed)
npx prisma db seed     # load demo data
npm run dev            # http://localhost:8080  (port 8080, not 3000)
```

Sign in with any non-empty email and password, or use the one-click demo button.
Authentication is mocked — see [Known Limitations](../README.md#-known-limitations-read-before-relying-on-this).
