import type { AppProps } from 'next/app'
import { MantineProvider } from '@mantine/core';
// import { Analytics } from '@vercel/analytics/react';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <MantineProvider withGlobalStyles>
      <Component {...pageProps} />
      {/* <Analytics /> */}
    </MantineProvider>
  );
}
