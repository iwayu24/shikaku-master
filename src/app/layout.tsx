import type { Metadata, Viewport } from 'next';
import { ExamStoreProvider } from '@/lib/storage';
import { AppShell } from '@/components/layout/AppShell';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'シカクマスター | 日商簿記2級・3級 スキマ学習＆模擬テスト',
    template: '%s | シカクマスター',
  },
  description:
    '日商簿記2級（商業・工業）・3級の仕訳演習・模擬テスト・勘定科目辞典をモバイルファーストで学べる資格学習プラットフォーム。中小企業診断士など他資格へ拡張可能。',
  applicationName: 'シカクマスター',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'シカクマスター',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#4F46E5',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <ExamStoreProvider>
          <AppShell>{children}</AppShell>
        </ExamStoreProvider>
      </body>
    </html>
  );
}
