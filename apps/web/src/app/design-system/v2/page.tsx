import type { Metadata } from 'next';
import { ShowcaseClient } from './ShowcaseClient';

export const metadata: Metadata = {
  title: 'Design system · v2',
  robots: { index: false, follow: false },
};

export default function DesignSystemV2Page(): React.ReactElement {
  return <ShowcaseClient />;
}
