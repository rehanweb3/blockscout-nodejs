const React = require('react');

function noOp() {}
function DynamicContextProvider({ children }) { return children; }
function DynamicConnectButton({ children }) { return React.createElement('button', { onClick: noOp }, children || 'Connect Wallet'); }
function DynamicUserProfile() { return null; }
function DynamicWagmiConnector({ children }) { return children; }

function useDynamicContext() {
  return { primaryWallet: null, user: null, handleLogOut: noOp, sdkHasLoaded: true };
}
function useIsLoggedIn() { return false; }
function getAuthToken() { return null; }
function useAuthenticateConnectedUser() { return { authenticateUser: noOp }; }

module.exports = {
  DynamicContextProvider,
  DynamicConnectButton,
  DynamicUserProfile,
  DynamicWagmiConnector,
  useDynamicContext,
  useIsLoggedIn,
  getAuthToken,
  useAuthenticateConnectedUser,
};
