// Analytics - Vercel Analytics Integration
'use client';
import { Analytics as VercelAnalytics } from '@vercel/analytics/react';

export function Analytics() {
  // Only load analytics in production
  if (import.meta.env.MODE !== 'production') {
    return null;
  }

  return <VercelAnalytics />;
}