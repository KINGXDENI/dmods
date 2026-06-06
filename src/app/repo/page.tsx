import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/metadata';
import RepoClient from '@/components/RepoClient';

export const metadata: Metadata = constructMetadata({
  title: 'iOS Repo Sources – DMods',
  description: 'Add DMods iOS repository source to AltStore, Scarlet, ESign, or KSign to install tweaked apps directly on your device with automatic updates.',
  path: '/repo',
  ogParams: {
    title: 'iOS Repo Integration',
    subtitle: 'Add DMods as a source in AltStore, Scarlet, ESign, or KSign.',
    badge: 'Repo Integration',
    platform: 'ios',
    type: 'home'
  }
});

export default function RepoPage() {
  return <RepoClient />;
}
