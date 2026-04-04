export default function formatLanguageName(language: string | undefined | null): string {
  if (!language) return 'Unknown';
  const map: Record<string, string> = {
    solidity: 'Solidity',
    vyper: 'Vyper',
    yul: 'Yul',
  };
  return map[language.toLowerCase()] || language;
}
