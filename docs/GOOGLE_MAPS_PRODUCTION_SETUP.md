# Google Maps production configuration and deploy verification

BlinkMyAd uses the **Maps Embed API**, not the Maps JavaScript SDK. The Next.js frontend renders published backend location coordinates as an opt-in iframe after a visitor clicks **Load Google Maps**.

## Production environment (Vercel frontend)

Set both variables in **Production** on the `advibe` project:

```ini
NEXT_PUBLIC_GOOGLE_MAPS_ENABLED=true
NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY=<Google Maps Embed API key>
```

Keep the key value in Vercel Environment Variables, not in Git, screenshots, or support tickets. This is a browser-visible key: in Google Cloud restrict its **application** to the exact BlinkMyAd HTTPS hostnames and its **API** to Maps Embed API only.

For an immediate no-key rollback, set `NEXT_PUBLIC_GOOGLE_MAPS_ENABLED=false` and redeploy. The disabled state never uses a leftover key. The build deliberately fails if the enabled flag is not exactly `true`/`false`, or if enabled without a valid nonempty key string, so fix the Vercel environment rather than weakening `validateMapsConfig` in `src/services/maps-embed.mjs`.

Next.js compiles `NEXT_PUBLIC_*` into the build. After changing either variable, **redeploy the production build**. An unchanged deployment does not pick up a new browser key.

## Verification

1. Inspect the production **Vercel Build Logs**. A failure near `next.config.ts` or `validateMapsConfig` usually indicates a missing or incorrect Vercel Maps environment variable. Check variable names and Production target, not the secret contents.
2. On success, visit `https://www.blinkmyad.com/locations` or an Advertiser's Locations screen.
3. Ensure the API returned at least one published location with numeric latitude/longitude. The map does not appear when no qualifying locations exist.
4. Click **Load Google Maps**. A Google iframe error after a successful Next.js build usually indicates the Google Cloud billing, Maps Embed API enablement, or website/API key restrictions need correction.
5. Verify both `https://blinkmyad.com/*` and `https://www.blinkmyad.com/*` are allowed HTTP referrers, and check Google Cloud quota/error metrics.

Google Cloud billing may be required even when using a no-charge Maps Embed API. Never enable unrelated Maps APIs just to fix a restricted key.

## Optional interactive zone boundary (Map JavaScript API)

The live frontend can draw the **configured circular zone planning radius**, plus a pin on its published location. For example, a Civil Lines zone whose Admin radius is 2000 metres produces a 2 km radius circle. This is **not** a verified vehicle route, live GPS trace, or guarantee of ad delivery.

This map uses the backend's **published** `/public/zones` geometry; it never invents zone outlines. It is available in both the public Locations explorer and the Advertiser Locations page. If the zone metadata is missing or the optional integration is off, the existing no-charge Embed iframe remains.

**Maps JavaScript API / Dynamic Maps map loads can be billable**; this feature defaults off. Before enabling in production:

1. In Google Cloud enable **Maps JavaScript API**. Keep **Maps Embed API** enabled for fallback.
2. Create a separate HTTP-referrer-restricted browser key for Maps JavaScript API, allow only BlinkMyAd hostnames and restrict the key to **Maps JavaScript API**. Keep the existing Maps Embed key restricted to Maps Embed API.
3. Add these **Vercel Production** variables alongside the existing Embed configuration:

```ini
NEXT_PUBLIC_GOOGLE_MAPS_ENABLED=true
NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY=<existing Maps Embed API key>
NEXT_PUBLIC_GOOGLE_MAPS_COVERAGE_ENABLED=true
NEXT_PUBLIC_GOOGLE_MAPS_JS_KEY=<separate Maps JavaScript API browser key>
```

4. Configure Google Cloud quota/budget alerts for Dynamic Maps and rebuild the Vercel frontend.

**Rollback:** Set `NEXT_PUBLIC_GOOGLE_MAPS_COVERAGE_ENABLED=false` in Vercel and redeploy. The zero-configuration Embed map still works. Do not use a dummy key or disable validation to force the JavaScript map.
