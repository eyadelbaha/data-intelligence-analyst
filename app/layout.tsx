import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Data Intelligence Analyst',
  description: 'AI-powered customer data analysis, CLV prediction, and business intelligence',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="scan-line" />
        {children}
      </body>
    </html>
  );
}
