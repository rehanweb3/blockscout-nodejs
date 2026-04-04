import React from 'react';

export default function useGetCsrfToken() {
  const [ token, setToken ] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetch('/api/csrf').then((r) => r.json()).then((d) => {
      setToken(d.token || null);
    }).catch(() => {});
  }, []);

  return token;
}
