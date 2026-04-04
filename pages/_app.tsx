import type { HTMLChakraProps } from '@chakra-ui/react';
import { QueryClientProvider } from '@tanstack/react-query';
import type { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import React from 'react';

import type { NextPageWithLayout } from 'nextjs/types';

import type { Route } from 'nextjs-routes';
import PageMetadata from 'nextjs/PageMetadata';

import getSocketUrl from 'lib/api/getSocketUrl';
import useQueryClientConfig from 'lib/api/useQueryClientConfig';
import { AppContextProvider } from 'lib/contexts/app';
import { clientConfig as rollbarConfig, Provider as RollbarProvider } from 'lib/rollbar';
import { SocketProvider } from 'lib/socket/context';
import { Provider as ChakraProvider } from 'toolkit/chakra/provider';
import { Toaster } from 'toolkit/chakra/toaster';

import 'lib/setLocale';
import 'nextjs/global.css';

const AppErrorBoundary = dynamic(
  () => import('ui/shared/AppError/AppErrorBoundary'),
  { ssr: false },
);
const AppErrorGlobalContainer = dynamic(
  () => import('ui/shared/AppError/AppErrorGlobalContainer'),
  { ssr: false },
);
const Layout = dynamic(
  () => import('ui/shared/layout/Layout'),
  { ssr: false },
);
const GoogleAnalytics = dynamic(() => import('ui/shared/GoogleAnalytics'), { ssr: false });
const Web3Provider = dynamic(() => import('ui/shared/web3/Web3Provider'), { ssr: false });
const RewardsContextProvider = dynamic(
  () => import('lib/contexts/rewards').then((m) => ({ default: m.RewardsContextProvider })),
  { ssr: false },
);
const MarketplaceContextProvider = dynamic(
  () => import('lib/contexts/marketplace').then((m) => ({ default: m.MarketplaceContextProvider })),
  { ssr: false },
);
const SettingsContextProvider = dynamic(
  () => import('lib/contexts/settings').then((m) => ({ default: m.SettingsContextProvider })),
  { ssr: false },
);

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const ERROR_SCREEN_STYLES: HTMLChakraProps<'div'> = {
  h: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'center',
  width: 'fit-content',
  maxW: '800px',
  margin: { base: '0 auto', lg: '0 auto' },
  p: { base: 4, lg: 0 },
};

const CONSOLE_SCAM_WARNING = `\u26a0\ufe0fWARNING: Do not paste or execute any scripts here!
Anyone asking you to run code here might be trying to scam you and steal your data.
If you don't understand what this console is for, close it now and stay safe.`;

const CONSOLE_SCAM_WARNING_DELAY_MS = 500;

function MyApp({ Component, pageProps, router }: AppPropsWithLayout) {
  const queryClient = useQueryClientConfig();

  React.useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      // eslint-disable-next-line no-console
      console.warn(CONSOLE_SCAM_WARNING);
    }, CONSOLE_SCAM_WARNING_DELAY_MS);
    return () => window.clearTimeout(timeoutId);
  }, []);

  const socketUrl = getSocketUrl();

  const getLayout = Component.getLayout ?? ((page) => <Layout>{ page }</Layout>);

  return (
    <>
      <PageMetadata pathname={ router.pathname as Route['pathname'] } query={ pageProps.query } apiData={ pageProps.apiData }/>
      <ChakraProvider>
        <RollbarProvider config={ rollbarConfig }>
          <AppErrorBoundary
            { ...ERROR_SCREEN_STYLES }
            Container={ AppErrorGlobalContainer }
          >
            <QueryClientProvider client={ queryClient }>
              <AppContextProvider pageProps={ pageProps }>
                <SocketProvider url={ socketUrl }>
                  <Web3Provider>
                    <RewardsContextProvider>
                      <MarketplaceContextProvider>
                        <SettingsContextProvider>
                          { getLayout(<Component { ...pageProps }/>) }
                          <Toaster/>
                        </SettingsContextProvider>
                      </MarketplaceContextProvider>
                    </RewardsContextProvider>
                  </Web3Provider>
                </SocketProvider>
                <GoogleAnalytics/>
              </AppContextProvider>
            </QueryClientProvider>
          </AppErrorBoundary>
        </RollbarProvider>
      </ChakraProvider>
    </>
  );
}

export default MyApp;
