const KEY = 'recent_search_keywords';
const MAX = 8;

export function getRecentSearchKeywords(): Array<string> {
  if (typeof localStorage === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveToRecentKeywords(keyword: string): void {
  if (typeof localStorage === 'undefined') return;
  const current = getRecentSearchKeywords().filter((k) => k !== keyword);
  current.unshift(keyword);
  localStorage.setItem(KEY, JSON.stringify(current.slice(0, MAX)));
}

export function removeRecentSearchKeyword(keyword: string): void {
  if (typeof localStorage === 'undefined') return;
  const current = getRecentSearchKeywords().filter((k) => k !== keyword);
  localStorage.setItem(KEY, JSON.stringify(current));
}

export function clearRecentSearchKeywords(): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(KEY);
}
