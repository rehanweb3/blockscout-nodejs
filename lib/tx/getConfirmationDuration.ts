export default function getConfirmationDuration(confirmationDuration: Array<number> | undefined): string {
  if (!confirmationDuration || confirmationDuration.length === 0) return 'unknown';
  const ms = confirmationDuration.reduce((sum, n) => sum + n, 0);
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${ seconds } secs`;
  const minutes = Math.round(seconds / 60);
  return `${ minutes } mins`;
}
