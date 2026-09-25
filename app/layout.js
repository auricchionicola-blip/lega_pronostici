import './globals.css';

export const metadata = {
  title: 'Lega Pronostici',
  description: 'App Pronostici Calcio con gli Amici',
};

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body className="bg-slate-950 text-slate-100 antialiased">{children}</body>
    </html>
  );
}
