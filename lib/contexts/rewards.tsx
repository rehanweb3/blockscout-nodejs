import React from 'react';

export function RewardsContextProvider({ children }: React.PropsWithChildren) {
  return <>{children}</>;
}

export function useRewardsContext() {
  return {
    isEnabled: false,
    balance: null,
    dailyReward: null,
    isLoading: false,
  };
}
