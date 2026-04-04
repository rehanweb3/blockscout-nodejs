export function route({ pathname, query }: { pathname: string; query?: Record<string, string> }): string {
  let path = pathname as string;
  if (query) {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([ k, v ]) => {
      if (path.includes(`[${k}]`)) {
        path = path.replace(`[${k}]`, encodeURIComponent(v));
      } else {
        params.set(k, v);
      }
    });
    const qs = params.toString();
    if (qs) path += `?${qs}`;
  }
  return path;
}
