/**
 * @file src/app/opengraph-image.tsx
 *
 * Professional 1200x630 OpenGraph Preview Card for OtakuBazaar.
 * Optimized for Instagram DMs, WhatsApp, iMessage, and Twitter card crawlers.
 * Strictly adheres to OtakuBazaar's dark archival vault aesthetic:
 * - #080808 obsidian background
 * - Subtle #D4AF37 gold hairlines and badges
 * - Framed Kitsune logo
 * - Authoritative typography & escrow guarantee badge
 */

import { ImageResponse } from 'next/og';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';
export const alt = 'OtakuBazaar — Authenticated Anime Figures & Collectibles';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function OpenGraphImage(): Promise<ImageResponse> {
  let logoDataUrl = '';
  try {
    const logoPath = path.join(process.cwd(), 'public', 'otakubazaar-logo.png');
    if (fs.existsSync(logoPath)) {
      const logoBuffer = fs.readFileSync(logoPath);
      logoDataUrl = `data:image/png;base64,${logoBuffer.toString('base64')}`;
    }
  } catch (err) {
    console.error('Failed to load logo for OpenGraph card:', err);
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#080808',
          padding: '54px 64px',
          boxSizing: 'border-box',
          border: '1px solid #1F1F1F',
          position: 'relative',
        }}
      >
        {/* Subtle Gold Hairline Inset Frame */}
        <div
          style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            right: '16px',
            bottom: '16px',
            border: '1px solid rgba(212, 175, 55, 0.22)',
            pointerEvents: 'none',
          }}
        />

        {/* Top Vault Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            borderBottom: '1px solid #1C1C1C',
            paddingBottom: '18px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '8px',
                height: '8px',
                backgroundColor: '#D4AF37',
              }}
            />
            <span
              style={{
                fontSize: '12px',
                letterSpacing: '0.24em',
                color: '#D4AF37',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              ARCHIVAL VAULT INDEX // VERIFIED SPECIMENS
            </span>
          </div>

          <span
            style={{
              fontSize: '11px',
              letterSpacing: '0.2em',
              color: '#777777',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            PAN-INDIA C2C ESCROW
          </span>
        </div>

        {/* Center Main Brand Presentation */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '52px',
            margin: 'auto 0',
          }}
        >
          {/* Kitsune Gold Logo Box */}
          <div
            style={{
              width: '210px',
              height: '210px',
              border: '1px solid #D4AF37',
              backgroundColor: '#000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '12px',
              boxSizing: 'border-box',
              flexShrink: 0,
            }}
          >
            {logoDataUrl ? (
              <img
                src={logoDataUrl}
                alt="OtakuBazaar Kitsune Logo"
                width={186}
                height={186}
                style={{
                  width: 186,
                  height: 186,
                  objectFit: 'contain',
                }}
              />
            ) : null}
          </div>

          {/* Editorial Logotype & Positioning */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <h1
              style={{
                fontSize: '66px',
                fontWeight: 900,
                color: '#F2EFE9',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                margin: 0,
                padding: 0,
                lineHeight: 1,
              }}
            >
              OTAKUBAZAAR
            </h1>

            <span
              style={{
                fontSize: '19px',
                letterSpacing: '0.2em',
                color: '#B0B0B0',
                textTransform: 'uppercase',
                marginTop: '16px',
                fontWeight: 600,
              }}
            >
              AUTHENTICATED ANIME FIGURES &amp; COLLECTIBLES
            </span>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                marginTop: '22px',
              }}
            >
              <div
                style={{
                  border: '1px solid #2A2A2A',
                  backgroundColor: '#0C0C0C',
                  color: '#CCCCCC',
                  padding: '7px 16px',
                  fontSize: '11px',
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                }}
              >
                100% ESCROW PROTECTED
              </div>
              <div
                style={{
                  border: '1px solid #2A2A2A',
                  backgroundColor: '#0C0C0C',
                  color: '#CCCCCC',
                  padding: '7px 16px',
                  fontSize: '11px',
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                }}
              >
                48H UNBOXING INSPECTION
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Guarantee Banner */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderTop: '1px solid #1C1C1C',
            paddingTop: '20px',
            width: '100%',
          }}
        >
          <span
            style={{
              fontSize: '13px',
              letterSpacing: '0.28em',
              color: '#D4AF37',
              fontWeight: 700,
              textTransform: 'uppercase',
            }}
          >
            0% BOOTLEG TOLERANCE • 48H ESCROW PROTECTION • PAN-INDIA INSURED
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
