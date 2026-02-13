# Madadgar Mobile APK Build

## Performance (Old & New Phones)

- **Hermes** JS engine (default) — faster startup, less memory
- **FlatList optimizations** — `removeClippedSubviews`, `maxToRenderPerBatch`, `initialNumToRender`, `windowSize` for smooth scrolling on low-end devices
- **APK vs Web** — APK is faster because: native code, bundled assets, no browser overhead, better caching

## Build APK

### 1. Set API URL (Required)

Your web app must be deployed (e.g. Vercel). Set the API URL in EAS:

```bash
cd apps/mobile
eas env:create --name EXPO_PUBLIC_API_URL --value "https://your-app.vercel.app" --environment preview --visibility plainText
eas env:create --name EXPO_PUBLIC_API_URL --value "https://your-app.vercel.app" --environment production --visibility plainText
```

Replace `https://your-app.vercel.app` with your actual deployed web URL.

### 2. Build (Interactive — first time)

**First build** needs interactive mode for Android keystore:

```bash
cd apps/mobile
pnpm build:apk
# or: eas build --platform android --profile preview
```

When prompted for credentials, choose "Let Expo handle it" for the keystore.

### 3. Download APK

After build completes (~10–15 min), download the APK from the link in the terminal or [expo.dev](https://expo.dev) → Projects → Madadgar → Builds.

### 4. Install

- Send APK link to your phone and install
- Or use `adb install path/to/app.apk`
