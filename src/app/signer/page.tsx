import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/metadata';
import RemoteSignerClient from '@/components/RemoteSignerClient';

export const metadata: Metadata = constructMetadata({
  title: 'Remote IPA Signer – DMods',
  description: 'Sign and sideload any decrypted iOS IPA package directly from a URL. Upload custom P12 certificates or choose from free enterprise profiles online.',
  path: '/signer',
  ogParams: {
    title: 'Remote IPA Signer',
    subtitle: 'Sign and sideload raw IPA download links instantly on-device. No computer required.',
    badge: 'Sideload tool',
    platform: 'ios',
    type: 'home'
  }
});

export default function SignerPage() {
  return <RemoteSignerClient />;
}
