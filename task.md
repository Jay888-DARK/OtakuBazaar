# OtakuBazaar — Task Tracker

## Phase 1: Project Scaffold & Relocation
- `[x]` Scaffold Next.js App Router project with TypeScript strict mode
- `[x]` Relocate project to active workspace (`c:\Users\HP\OneDrive\Desktop\SAAS prototype\OtakuBazaar`)
- `[x]` Clean legacy routes (`src/app/seller/page.tsx` permanently deleted)
- `[x]` Clean all non-ASCII / Japanese strings in comments from `HoloCard3D.tsx`

## Phase 2: Domain Layer (Clean Architecture)
- `[x]` `src/domain/types/index.ts` — branded IDs, shared types
- `[x]` `src/domain/value-objects/Money.ts`
- `[x]` `src/domain/value-objects/ListingStatus.ts`
- `[x]` `src/domain/value-objects/OfferStatus.ts`
- `[x]` `src/domain/entities/User.ts`
- `[x]` `src/domain/entities/Listing.ts`
- `[x]` `src/domain/entities/BargainOffer.ts`
- `[x]` `src/domain/events/DomainEvent.ts`
- `[x]` `src/domain/repositories/IListingRepository.ts`
- `[x]` `src/domain/repositories/IBargainOfferRepository.ts`

## Phase 3: Application Layer
- `[x]` `src/application/errors/ApplicationErrors.ts`
- `[x]` `src/application/ports/IEventBus.ts`
- `[x]` `src/application/ports/IPaymentGateway.ts`
- `[x]` `src/application/ports/IShippingProvider.ts`
- `[x]` `src/application/dtos/CreateListingDTO.ts`
- `[x]` `src/application/dtos/AcceptBargainOfferDTO.ts`
- `[x]` `src/application/use-cases/CreateListingUseCase.ts`
- `[x]` `src/application/use-cases/AcceptBargainOfferUseCase.ts`

## Phase 4: Infrastructure & Database Layer
- `[x]` `prisma/schema.prisma` & `src/infrastructure/database/prisma/schema.prisma`
- `[x]` Install `@prisma/client` and `prisma`
- `[x]` Configure `.env` with SQLite `DATABASE_URL="file:./dev.db"`
- `[x]` Generate Prisma Client (`npx prisma generate`) and push schema (`npx prisma db push`)
- `[x]` Singleton Prisma Client with informative `DATABASE_URL` check (`prismaClient.ts`)
- `[x]` Replace in-memory `ListingRepository` with direct Prisma SQLite queries (`findMany`, `findUnique`, `create`, `update`)
- `[x]` Connect `OrderRepository` to Prisma with FK auto-population and double-entry ledger integration
- `[x]` Clean obsolete ambient type shims (`src/types/prisma.d.ts`)

## Phase 5: Presentation & Server Actions
- `[x]` Server Actions in `src/app/actions.ts` wired directly to `ListingRepository` & Prisma DB
- `[x]` Safe revalidation for Next.js cache paths (`safeRevalidatePath`)
- `[x]` Consolidated seller dashboard at `/profile`
- `[x]` Instant listing creation at `/sell`

## Phase 6: Automated End-to-End Verification
- `[x]` Direct persistence flow verified (`src/server/__tests__/verifyPersistenceFlow.ts`)
- `[x]` Enterprise directives & 15-min distributed locks verified (`enterpriseCompliance.test.ts`)
- `[x]` FinTech payment capture, double-entry escrow ledger & UPI disbursement verified (`escrowWebhooks.test.ts`)
- `[x]` `npx tsc --noEmit` — 0 errors across entire workspace
