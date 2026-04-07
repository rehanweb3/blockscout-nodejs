import type { DocumentContext, DocumentInitialProps } from 'next/document';
import Document, { Html, Head, Main, NextScript } from 'next/document';
import React from 'react';

import logRequestFromBot from 'nextjs/utils/logRequestFromBot';
import * as serverTiming from 'nextjs/utils/serverTiming';

import config from 'configs/app';
import * as svgSprite from 'ui/shared/IconSvg';

const marketplaceFeature = config.features.marketplace;

interface ChainConfig {
  rpcUrl: string;
  wsUrl: string;
  chainId: string;
}

let cachedChainConfig: ChainConfig | null = null;

async function fetchChainConfig(): Promise<ChainConfig> {
  if (cachedChainConfig) return cachedChainConfig;
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    const response = await fetch(`${ backendUrl }/api/v2/config`, { signal: AbortSignal.timeout(3000) });
    const data = await response.json() as { rpc_url?: string; websocket_url?: string; chain_id?: string };
    cachedChainConfig = {
      rpcUrl: data.rpc_url || '',
      wsUrl: data.websocket_url || '',
      chainId: data.chain_id || '1',
    };
  } catch {
    cachedChainConfig = { rpcUrl: '', wsUrl: '', chainId: '1' };
  }
  return cachedChainConfig;
}

interface MyDocumentProps extends DocumentInitialProps {
  chainConfig: ChainConfig;
}

class MyDocument extends Document<MyDocumentProps> {
  static async getInitialProps(ctx: DocumentContext): Promise<MyDocumentProps> {
    const originalRenderPage = ctx.renderPage;
    ctx.renderPage = async() => {
      const start = Date.now();
      const result = await originalRenderPage();
      const end = Date.now();

      serverTiming.appendValue(ctx.res, 'renderPage', end - start);

      return result;
    };

    await logRequestFromBot(ctx.req, ctx.res, ctx.pathname);

    const [ initialProps, chainConfig ] = await Promise.all([
      Document.getInitialProps(ctx),
      fetchChainConfig(),
    ]);

    return { ...initialProps, chainConfig };
  }

  render() {
    const { chainConfig } = this.props;
    const chainConfigJson = JSON.stringify({
      rpcUrl: chainConfig?.rpcUrl || '',
      wsUrl: chainConfig?.wsUrl || '',
      chainId: chainConfig?.chainId || '1',
    });

    return (
      <Html lang="en">
        <Head>
          { /* FONT PRECONNECT — unblocks font download before CSS is parsed */ }
          <link rel="preconnect" href="https://fonts.googleapis.com"/>
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
          <link rel="dns-prefetch" href="https://fonts.googleapis.com"/>

          { /* FONTS */ }
          <link
            href={ config.UI.fonts.heading?.url ?? 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap' }
            rel="stylesheet"
          />
          <link
            href={ config.UI.fonts.body?.url ?? 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap' }
            rel="stylesheet"
          />

          { /* CHAIN CONFIG — injected from backend, available as window.__CHAIN_CONFIG__ before any bundle runs */ }
          { /* eslint-disable-next-line @next/next/no-sync-scripts */ }
          <script
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={ { __html: `window.__CHAIN_CONFIG__=${ chainConfigJson };` } }
          />

          { /* eslint-disable-next-line @next/next/no-sync-scripts */ }
          <script src="/assets/envs.js"/>
          { config.features.multichain.isEnabled && (
            <>
              { /* eslint-disable-next-line @next/next/no-sync-scripts */ }
              <script src="/assets/multichain/config.js"/>
            </>
          ) }
          { marketplaceFeature.isEnabled && marketplaceFeature.essentialDapps && (
            <>
              { /* eslint-disable-next-line @next/next/no-sync-scripts */ }
              <script src="/assets/essential-dapps/chains.js"/>
            </>
          ) }

          { /* FAVICON */ }
          <link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon/favicon-16x16.png"/>
          <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon/favicon-32x32.png"/>
          <link rel="icon" type="image/png" sizes="48x48" href="/assets/favicon/favicon-48x48.png"/>
          <link rel="shortcut icon" href="/assets/favicon/favicon.ico"/>
          <link rel="apple-touch-icon" sizes="180x180" href="/assets/favicon/apple-touch-icon-180x180.png"/>
          <link rel="icon" type="image/png" sizes="192x192" href="/assets/favicon/android-chrome-192x192.png"/>
          <link rel="preload" as="image" href={ svgSprite.href }/>
        </Head>
        <body>
          <Main/>
          <NextScript/>
        </body>
      </Html>
    );
  }
}

export default MyDocument;
