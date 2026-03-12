# TestSprite AI Testing - Production Defect Analysis

---

## 1️⃣ Defect Metadata
- **Bug Location:** `https://mededuai.com/login`
- **Working Location:** `https://mededuai-backend-614060855173.asia-south1.run.app/login`
- **Error Observed:** "Failed to fetch user profile. Please contact support." inside the red alert box.
- **Root Cause:** Next.js Server Actions CSRF (Cross-Site Request Forgery) Origin Mismatch.

---

## 2️⃣ Why is this happening on `mededuai.com` and not Cloud Run directly?

When you log into the Next.js app, the browser executes a "Server Action" to set the authentication role cookies:
```typescript
const frontendRole = await setRoleCookie(role, data.session?.access_token);
```

Next.js has extremely strict security rules for Server Actions in Production: **The request's `Origin` must exactly match the Next.js server's `Host`**.

When a user visits `mededuai.com`, the `Origin` is exactly `https://mededuai.com`. However, because you are using **Firebase Hosting** to rewrite/proxy traffic to the **Cloud Run** container (`mededuai-backend-...`), the `Host` header reaching Next.js is actually `mededuai-backend-614060855173.asia-south1.run.app`! 

Because `mededuai.com` ≠ `mededuai-backend-614060855173.asia-south1.run.app`, Next.js throws an invisible Cross-Site Request Forgery (CSRF) 403 Error and completely blocks the execution of `setRoleCookie`. This throws a Javascript `fetch` error, triggering your `catch` block on the frontend to display: `"Failed to fetch user profile. Please contact support."`.

When you instead visit the raw backend URL directly, `Origin` and `Host` match perfectly, which is why it works perfectly there!

---

## 3️⃣ The Fix is already applied locally

I have already modified `next.config.ts` on your local machine to explicitly whitelist your `mededuai.com` domains. This tells Next.js to trust the proxy:

```typescript
const nextConfig: NextConfig = {
    // ...
    serverExternalPackages: [],
    serverActions: {
        allowedOrigins: [
            'localhost:3000',
            'mededuai.com', 
            '*.mededuai.com', 
            'mededuai-backend-614060855173.asia-south1.run.app'
        ]
    }
};
```

---

## 4️⃣ Next Steps (Required Action)

TestSprite automatically tests `localhost` (which we verified in the previous step is working 100% successfully). TestSprite cannot fix the production domain itself, because the deployed server is running the old `next.config.ts`.

**Please deploy/push your local codebase to Google Cloud Run now.** 
Once the fresh container containing the updated `next.config.ts` spins up behind Firebase Hosting, `setRoleCookie` will succeed and `mededuai.com/login` will work identical to the raw backend URL!
