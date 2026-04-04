import React from 'react';

interface PageNextJsProps {
  pathname: string;
  children: React.ReactNode;
  query?: Record<string, unknown>;
  apiData?: unknown;
}

export default function PageNextJs({ children }: PageNextJsProps) {
  return <>{children}</>;
}
