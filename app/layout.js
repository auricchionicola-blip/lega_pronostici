export const metadata = {
  title: 'Lega Pronostici',
  description: 'App Pronostici Calcio con gli Amici',
};

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="bg-slate-100 text-slate-800 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
