import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

// Apple icon path
const appleSvg = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '6px', color: '#ffffff' }}>
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5 1.07 3.29 1.07.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.69 4.04-.02.07-.43 1.44-1.39 2.86M15.97 4.17c.66-.8 1.1-1.89.98-3.17-1.1.04-2.44.73-3.22 1.64-.66.77-1.24 1.88-1.09 3.14 1.23.09 2.48-.61 3.33-1.61z"/>
  </svg>
);

// Android icon path
const androidSvg = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '6px', color: '#a7a7a7' }}>
    <path d="M12 4a4.5 4.5 0 00-4.5 4.5h9A4.5 4.5 0 0012 4z"/>
    <circle cx="10" cy="6.8" r="0.45" fill="black" />
    <circle cx="14" cy="6.8" r="0.45" fill="black" />
    <path d="M9 4.2L7.6 2.8a.4.4 0 00-.56.56l1.4 1.4a.4.4 0 00.56-.56zM15 4.2l1.4-1.4a.4.4 0 00-.56-.56l-1.4 1.4a.4.4 0 00.56.56z"/>
    <path d="M7.5 9.5a1 1 0 00-1 1v6a1.5 1.5 0 001.5 1.5h8a1.5 1.5 0 001.5-1.5v-6a1 1 0 00-1-1H7.5z"/>
    <rect x="9.5" y="18" width="1.2" height="2.5" rx="0.6" />
    <rect x="13.3" y="18" width="1.2" height="2.5" rx="0.6" />
    <rect x="5.8" y="10" width="1.1" height="5.5" rx="0.55" />
    <rect x="17.1" y="10" width="1.1" height="5.5" rx="0.55" />
  </svg>
);

// DMods Brand Logo SVG (Fallback if PNG fails to load)
const brandLogoSvg = (
  <svg 
    width="36" 
    height="42" 
    viewBox="0 0 459 531" 
    preserveAspectRatio="xMidYMid meet"
    style={{ color: '#ffffff', marginRight: '8px', display: 'flex' }}
  >
    <g 
      transform="translate(0.000000,531.000000) scale(0.100000,-0.100000)"
      fill="currentColor" 
      stroke="none"
    >
      <path d="M780 4075 c0 -489 4 -875 9 -875 8 0 97 49 371 205 l125 71 3 272 c1 150 5 272 7 272 3 0 60 -33 128 -74 333 -200 866 -516 889 -526 22 -10 31 -8 64 13 22 14 219 132 439 262 220 131 433 257 472 281 l73 43 2 -271 3 -272 73 -43 c96 -57 412 -233 418 -233 2 0 4 392 4 870 0 479 -2 870 -5 870 -3 0 -98 -57 -212 -126 -463 -282 -1299 -787 -1311 -791 -7 -3 -38 10 -70 30 -31 19 -271 164 -532 322 -261 159 -549 333 -640 388 -91 55 -198 120 -237 144 l-73 43 0 -875z"/>
      <path d="M1189 3253 c-189 -101 -380 -210 -423 -241 -245 -176 -400 -413 -468 -714 -30 -134 -32 -386 -5 -518 58 -275 190 -516 383 -700 142 -136 165 -149 1127 -684 224 -124 410 -226 412 -226 3 0 5 645 5 1433 l0 1432 -58 34 c-31 18 -183 108 -337 198 -154 91 -282 167 -286 169 -3 1 -160 -81 -350 -183z m546 -329 l65 -36 0 -944 c0 -519 -2 -944 -4 -944 -14 0 -621 339 -682 381 -238 165 -368 426 -351 704 14 213 127 419 296 539 30 21 551 308 608 335 1 1 32 -15 68 -35z"/>
      <path d="M2757 3239 l-347 -202 0 -1433 c0 -789 3 -1434 6 -1434 4 0 99 51 213 114 113 62 404 223 646 356 242 133 476 268 519 299 109 77 245 208 320 308 329 439 351 1039 54 1470 -124 180 -264 286 -664 504 -154 83 -306 166 -340 185 l-60 34 -347 -201z m688 -532 c113 -62 181 -114 255 -194 177 -193 229 -500 127 -753 -43 -106 -89 -172 -192 -275 -77 -77 -124 -114 -205 -161 -115 -68 -556 -309 -583 -320 -16 -6 -17 59 -17 934 l0 941 67 40 67 40 196 -101 c107 -56 236 -123 285 -151z"/>
    </g>
  </svg>
);

async function fetchIconAsBase64(url?: string): Promise<string | null> {
  if (!url) return null;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 86400 } // cache for 1 day
    });
    if (!res.ok) return null;
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = res.headers.get('content-type') || 'image/png';
    return `data:${contentType};base64,${buffer.toString('base64')}`;
  } catch (err) {
    console.error("Failed to fetch icon for OG image", err);
    return null;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const title = searchParams.get('title') || 'DMods – Premium IPA & APK Hub';
  const subtitle = searchParams.get('subtitle') || 'Find and download modified apps safely.';
  const badge = searchParams.get('badge') || '';
  const version = searchParams.get('version') || '';
  const size = searchParams.get('size') || '';
  const platform = searchParams.get('platform') || 'cross'; // 'ios', 'android', 'cross'
  const icon = searchParams.get('icon') || '';
  const type = searchParams.get('type') || 'home'; // 'app', 'list', 'home'

  // Fetch fonts dynamically
  let outfitBoldData: ArrayBuffer | null = null;
  let interRegularData: ArrayBuffer | null = null;

  try {
    const [boldRes, regRes] = await Promise.all([
      fetch('https://cdn.jsdelivr.net/npm/@fontsource/outfit/files/outfit-latin-700-normal.woff').then(res => {
        if (!res.ok) throw new Error(`Failed to load Outfit font: ${res.status}`);
        return res.arrayBuffer();
      }),
      fetch('https://cdn.jsdelivr.net/npm/@fontsource/inter/files/inter-latin-400-normal.woff').then(res => {
        if (!res.ok) throw new Error(`Failed to load Inter font: ${res.status}`);
        return res.arrayBuffer();
      })
    ]);
    outfitBoldData = boldRes;
    interRegularData = regRes;
  } catch (e) {
    console.error("Failed to fetch custom fonts, using default sans-serif", e);
  }

  const fonts = [];
  if (outfitBoldData) {
    fonts.push({
      name: 'Outfit',
      data: outfitBoldData,
      weight: 700 as const,
      style: 'normal' as const,
    });
  }
  if (interRegularData) {
    fonts.push({
      name: 'Inter',
      data: interRegularData,
      weight: 400 as const,
      style: 'normal' as const,
    });
  }

  // Fetch and resolve remote app icon safely
  let iconBase64: string | null = null;
  if (type === 'app' && icon) {
    iconBase64 = await fetchIconAsBase64(icon);
  }

  // Custom typography styles based on load result
  const titleFontFamily = outfitBoldData ? 'Outfit, Inter, sans-serif' : 'sans-serif';
  const bodyFontFamily = interRegularData ? 'Inter, sans-serif' : 'sans-serif';

  return new ImageResponse(
    (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        backgroundColor: '#070709',
        backgroundImage: 'radial-gradient(circle at 90% 10%, rgba(167, 167, 167, 0.12), transparent 50%), radial-gradient(circle at 10% 90%, rgba(167, 167, 167, 0.05), transparent 45%)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '50px 60px',
        justifyContent: 'space-between',
        boxSizing: 'border-box',
        color: '#ffffff',
        position: 'relative',
      }}>
        {/* Glow border line top */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '10%',
          right: '10%',
          height: '2px',
          backgroundImage: 'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.15), transparent)',
        }} />

        {/* Grid pattern */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.01) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.01) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
        }} />

        {/* Brand Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" style={{ marginRight: '8px', display: 'flex' }}>
              {/* Outer Shield */}
              <path 
                d="M12 2L4 5v6c0 5.5 3.5 10.5 8 12 4.5-1.5 8-6.5 8-12V5l-8-3z" 
                style={{
                  fill: 'none',
                  stroke: '#ffffff',
                  strokeWidth: 2.5,
                  strokeLinecap: 'round',
                  strokeLinejoin: 'round',
                }}
              />
              {/* Inner Shield Body with transparent white fill */}
              <path 
                d="M12 6L7 9.5V14c0 2.5 2 4.5 5 5.5 3-1 5-3 5-5.5V9.5L12 6z" 
                style={{
                  fill: 'rgba(255, 255, 255, 0.12)',
                }}
              />
              {/* Stylized geometric D/M winged pattern inside */}
              <path 
                d="M8 10l4 3 4-3v3.5c0 1.5-1.5 3-4 3.5-2.5-.5-4-2-4-3.5V10z" 
                style={{
                  fill: '#a7a7a7',
                }}
              />
            </svg>
            <span style={{
              fontSize: '22px',
              fontWeight: 900,
              fontFamily: titleFontFamily,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#ffffff',
            }}>
              DMods
            </span>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '9999px',
            border: '1px solid rgba(167, 167, 167, 0.2)',
            backgroundColor: 'rgba(167, 167, 167, 0.05)',
            fontFamily: bodyFontFamily,
          }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 10px #10b981' }} />
            <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', color: '#a7a7a7', textTransform: 'uppercase' }}>
              Archive Active
            </span>
          </div>
        </div>

        {/* Card Main Body */}
        {type === 'app' ? (
          // Dynamic App detail layout
          <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '40px', flex: 1, padding: '20px 0' }}>
            {/* App Icon container with custom glowing shadows */}
            <div style={{
              display: 'flex',
              width: '170px',
              height: '170px',
              borderRadius: '42px',
              backgroundColor: '#111115',
              border: '2px solid rgba(255, 255, 255, 0.15)',
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              {iconBase64 ? (
                <img src={iconBase64} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: '100%',
                  color: '#a7a7a7',
                }}>
                  {platform === 'ios' ? appleSvg : platform === 'android' ? androidSvg : null}
                  <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '6px' }}>
                    {platform === 'ios' ? 'iOS' : platform === 'android' ? 'APK' : 'MOD'}
                  </span>
                </div>
              )}
            </div>

            {/* App Details Details */}
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                {/* Platform Tag */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  fontSize: '11px',
                  fontWeight: 900,
                  fontFamily: bodyFontFamily,
                  color: '#ffffff',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  {platform === 'ios' ? appleSvg : platform === 'android' ? androidSvg : null}
                  {platform === 'ios' ? 'iOS IPA' : platform === 'android' ? 'Android APK' : 'CROSS-PLATFORM'}
                </div>

                {/* Badge Category */}
                {badge && (
                  <div style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(167, 167, 167, 0.15)',
                    border: '1px solid rgba(167, 167, 167, 0.25)',
                    fontSize: '11px',
                    fontWeight: 900,
                    fontFamily: bodyFontFamily,
                    color: '#ffffff',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    {badge}
                  </div>
                )}
              </div>

              {/* Title */}
              <h1 style={{
                fontSize: title.length > 25 ? '38px' : '48px',
                fontWeight: 900,
                fontFamily: titleFontFamily,
                margin: '0 0 10px 0',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                color: '#ffffff',
              }}>
                {title}
              </h1>

              {/* Subtitle / Description */}
              <p style={{
                fontSize: '15px',
                fontWeight: 400,
                fontFamily: bodyFontFamily,
                color: '#8e8e93',
                margin: '0 0 16px 0',
                lineHeight: 1.4,
                display: '-webkit-box',
                maxHeight: '44px',
                overflow: 'hidden',
              }}>
                {subtitle}
              </p>

              {/* Technical Specifications Specs Grid */}
              <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                {version && (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, fontFamily: bodyFontFamily, color: '#a7a7a7', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Version</span>
                    <span style={{ fontSize: '14px', fontWeight: 700, fontFamily: titleFontFamily, color: '#ffffff', marginTop: '2px' }}>{version}</span>
                  </div>
                )}
                {size && (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, fontFamily: bodyFontFamily, color: '#a7a7a7', textTransform: 'uppercase', letterSpacing: '0.1em' }}>File Size</span>
                    <span style={{ fontSize: '14px', fontWeight: 700, fontFamily: titleFontFamily, color: '#ffffff', marginTop: '2px' }}>{size}</span>
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, fontFamily: bodyFontFamily, color: '#a7a7a7', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Verification</span>
                  <span style={{ fontSize: '14px', fontWeight: 700, fontFamily: titleFontFamily, color: '#10b981', marginTop: '2px', display: 'flex', alignItems: 'center' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ marginRight: '4px' }}>
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round"/>
                      <polyline points="22 4 12 14.01 9 11.01" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    100% SECURE
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Directory/Listing general layout
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1, padding: '20px 0', maxWidth: '85%' }}>
            {/* Category / Area Info Badge */}
            {badge && (
              <div style={{
                width: 'fit-content',
                padding: '4px 12px',
                borderRadius: '6px',
                backgroundColor: 'rgba(167, 167, 167, 0.15)',
                border: '1px solid rgba(167, 167, 167, 0.25)',
                fontSize: '11px',
                fontWeight: 900,
                fontFamily: bodyFontFamily,
                color: '#ffffff',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: '12px',
              }}>
                {badge}
              </div>
            )}

            {/* Title */}
            <h1 style={{
              fontSize: '56px',
              fontWeight: 900,
              fontFamily: titleFontFamily,
              margin: '0 0 12px 0',
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              color: '#ffffff',
            }}>
              {title}
            </h1>

            {/* Subtitle / Description */}
            <p style={{
              fontSize: '18px',
              fontWeight: 400,
              fontFamily: bodyFontFamily,
              color: '#a7a7a7',
              margin: '0 0 24px 0',
              lineHeight: 1.4,
            }}>
              {subtitle}
            </p>

            {/* Features Row */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, fontFamily: bodyFontFamily, color: '#ffffff' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#a7a7a7' }} />
                <span>NO PC SIGNING</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, fontFamily: bodyFontFamily, color: '#ffffff' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#a7a7a7' }} />
                <span>DNS ANTI-REVOKE</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, fontFamily: bodyFontFamily, color: '#ffffff' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#a7a7a7' }} />
                <span>DIRECT INSTALLS</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          paddingTop: '20px',
          fontFamily: bodyFontFamily,
        }}>
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#a7a7a7', letterSpacing: '0.05em' }}>
            dmods.app
          </span>
          <span style={{ fontSize: '11px', fontWeight: 900, color: '#a7a7a7', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            Secured Sideload Database & Decryption Key Archive
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: fonts,
    }
  );
}
