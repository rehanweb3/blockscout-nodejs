export enum EventTypes {
  PAGE_VIEW = 'Page view',
  ACCOUNT_ACCESS_GRANTED = 'Account access granted',
  ACCOUNT_ACCESS_DENIED = 'Account access denied',
  ACCOUNT_LINK_INFO = 'Account link info',
  SEARCH_QUERY = 'Search query',
  TX_ADD_TO_MM = 'TX add to MM',
  ADDRESS_SUBMIT = 'Address submit',
  CONTRACT_VERIFY = 'Contract verify',
  TOKEN_INFO = 'Token info',
  CONTRACT_INTERACT = 'Contract interact',
}

export function logEvent(_event: EventTypes, _props?: Record<string, unknown>): void {}

export function init(): void {}

export function track(_event: string, _props?: Record<string, unknown>): void {}

export default { init, track, logEvent };
