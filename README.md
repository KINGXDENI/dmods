# DMods: Premium Mobile-First Mod APK & IPA Hub

DMods is a high-performance, mobile-first web hub built with Next.js 16 and Tailwind CSS 4. It aggregates and serves decrypted iOS IPA tweak packages, modified Android APK applications, and browser-based iOS enterprise signing configurations.

---

## 📱 Visual & UX Design

- **Industrial Grayscale Theme:** Built around a unified, ultra-premium grayscale aesthetic featuring Almond accent colors, Charleston card containers, and glassmorphic micro-shadows.
- **Mobile-First Interaction:** Single-thumb target controls, bottom-bar navigation matching iOS/Android native app layouts, and 100% responsive interfaces.
- **Custom Iconography:** Integrates hand-crafted custom SVG vectors for Apple and Android brand marks to elevate visual consistency.

---

## ⚡ Core Features

### 1. Decrypted App & Game Repositories
* Aggregates live listings from community archives.
* Dedicated filters for platform (iOS vs Android) and category.
* High-speed, secure download endpoints with auto-sign parameter checks.

### 2. KSign & ESign iOS Sideloading Hubs
* Dedicated routes `/ksign` and `/esign` to install side-loaded signers directly on iOS devices without a computer.
* Integrates custom DNS anti-revoke profiles and corporate certificate bundle archives (`.zip`).
* **Active Status Resolver:** Automatic redirection follow checks on shortcode servers (`api.khoindvn.io.vn`). Exposes and disables expired or revoked enterprise signatures with clear status badges.
* Resolves manifest `.plist` descriptors from GitHub to extract direct `.ipa` files, Bundle Identifiers, and app versions.

### 3. Real-Time Search Overlay
* Debounced, high-speed remote repository search scanner (`Ctrl+K` or `Cmd+K` keybindings).
* Search suggestions and cached query results.

---

## 🛠️ Decryption & Scraping Architecture

DMods bypasses traditional scraping restrictions by resolving encrypted client-side payloads directly from source servers.

```mermaid
graph TD
    A[Start Scraper] --> B[Fetch khoindvn.io.vn]
    B --> C[Regex match Astro hoisted module script]
    C --> D[Fetch /_astro/hoisted.[hash].js]
    D --> E[Extract base64 encrypted payload string]
    E --> F[XOR Decryption using secure key]
    F --> G[Parse JSON database of ESign/KSign installers]
    G --> H[Resolve shortcode redirection links]
    H --> I[Check for homepage fallbacks - Revoked state]
    I --> J[Fetch plist XML and extract Bundle ID/IPA url]
    J --> K[Output Cached Static ISR Page]
```

- **XOR Handshake Decryption:** Parses official developer Astro module scripts, extracts base64 encrypted strings, and decodes them via custom Node.js `Buffer` XOR byte streams.
- **Incremental Static Regeneration (ISR):** Cache verification intervals (1 hour for primary index scraping, 24 hours for redirect locations and plist files) to ensure fast rendering.

---

## 🚀 Tech Stack

- **Framework:** Next.js 16 (App Router & Server Actions)
- **Styling:** Tailwind CSS 4 & Custom Vanilla CSS Tokens
- **Icons:** Lucide React & Hand-drawn Custom SVGs
- **Parser:** Cheerio (for static DOM traversal)
- **Language:** TypeScript
- **Runtime:** Node.js

---

## 💻 Getting Started

### Prerequisites
- Node.js (v18.x or higher)
- npm (v9.x or higher)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/KINGXDENI/dmods.git
   cd dmods
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Access the portal locally at `http://localhost:3000`.

### Production Compilation
Ensure the app compiles cleanly:
```bash
npm run build
```

---

## 🛡️ Disclaimers & Ethics
All files, certificates, and download manifests are compiled from publicly available third-party developer platforms. DMods does not host binary packages directly; it serves as a secure aggregator and signer-manifest resolver. Users are advised to run active DNS profiles to check against certificate revocations.
