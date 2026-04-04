import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import localizedFormat from 'dayjs/plugin/localizedFormat';

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(localizedFormat);

export const FORMATS = {
  lll: 'DD MMM, HH:mm:ss',
  ll: 'DD MMM YYYY',
  'l': 'MM/DD/YYYY',
  'L': 'MM/DD/YYYY',
  'LT': 'HH:mm',
  'LTS': 'HH:mm:ss',
  'LLL': 'DD MMM YYYY HH:mm',
  'LLLL': 'dddd, DD MMM YYYY HH:mm',
  'DD MMM, HH:mm:ss': 'DD MMM, HH:mm:ss',
} as const;

export default dayjs;
