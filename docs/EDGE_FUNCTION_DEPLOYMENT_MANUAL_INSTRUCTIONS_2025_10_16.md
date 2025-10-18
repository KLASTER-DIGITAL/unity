# 🚀 EDGE FUNCTION DEPLOYMENT - MANUAL INSTRUCTIONS

## ⚠️ PROBLEM

The Edge Function (version 37) currently deployed only contains i18n endpoints. It's missing critical endpoints like:
- ❌ `/profiles/create` - Create user profile
- ❌ `/entries` - Create diary entries
- ❌ `/motivations/cards/:userId` - Get motivation cards
- ❌ And many other endpoints

## ✅ SOLUTION

The full Edge Function file is ready at:
```
/Users/rustamkarimov/DEV/UNITY-v2/supabase/functions/make-server-9729c493/index.ts
```

### Files to Deploy:
1. **index.ts** (68,707 bytes) - Main Edge Function with ALL endpoints
2. **kv_store.tsx** (2,813 bytes) - Key-value store implementation

### Deployment Methods:

#### Method 1: Using Supabase Dashboard (Recommended)
1. Go to: https://supabase.com/dashboard/project/ecuwuzqlwdkkdncampnc/functions
2. Click on `make-server-9729c493` function
3. Click "Edit" button
4. Replace the entire content of `index.ts` with the full file content
5. Click "Deploy"

#### Method 2: Using Supabase CLI (Requires Docker)
```bash
cd /Users/rustamkarimov/DEV/UNITY-v2
supabase functions deploy make-server-9729c493 --project-ref ecuwuzqlwdkkdncampnc
```

#### Method 3: Using Supabase MCP (Programmatic)
The full file is ready to be deployed via the Supabase MCP API.

## 📋 CHECKLIST

After deployment, verify:
- [ ] `/profiles/create` endpoint returns 200
- [ ] `/entries` endpoint returns 200
- [ ] `/motivations/cards/:userId` endpoint returns 200
- [ ] All i18n endpoints still work
- [ ] No 404 errors in browser console

## 🔗 RELATED FILES

- Local Edge Function: `supabase/functions/make-server-9729c493/index.ts`
- KV Store: `supabase/functions/make-server-9729c493/kv_store.tsx`
- API Client: `src/shared/lib/api/api.ts`

---

**Status**: 🟡 PENDING DEPLOYMENT  
**Date**: 2025-10-16  
**Version**: 37 (needs update to 38+)

