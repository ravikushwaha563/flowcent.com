import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";
import ScrollToTop from "@/components/ScrollToTop";
import { Toaster } from 'sonner';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Flowcent – AI-Powered Payment Collection for Indian Freelancers",
    template: "%s | Flowcent",
  },
  description: "Stop chasing payments. Flowcent tracks every invoice, detects payment excuses with AI, and sends automatic follow-ups — so you get paid faster.",
  keywords: ["invoice tracking", "payment collection", "AI follow-up", "freelancer payment", "India fintech", "payment automation"],
  metadataBase: new URL("https://flowcent.in"),
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://flowcent.in",
    siteName: "Flowcent",
    title: "Flowcent – Get Paid Automatically",
    description: "AI-assisted invoice tracking, payment links, and follow-up automation for Indian freelancers and small agencies.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Flowcent – AI Payment Intelligence Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Flowcent – Get Paid Automatically",
    description: "AI-powered invoice tracking and follow-ups for Indian freelancers. Stop chasing payments.",
    images: ["/og-image.png"],
    creator: "@flowcentin",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: "#09090f",
  colorScheme: "dark",
};

const revealScript = `
(function(){
  var CLASSES = ['.reveal-up','.reveal-left','.reveal-right','.reveal-scale','.reveal-fade'];
  var sel = CLASSES.join(',');
  function init(){
    var els = document.querySelectorAll(sel);
    if(!els.length) return;
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){ e.target.classList.add('visible'); io.unobserve(e.target); }
      });
    },{ threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function(el){ io.observe(el); });
  }
  // Delay 200ms so React hydration completes before we mutate class lists
  function safeInit(){ setTimeout(init, 200); }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', safeInit);
  } else { safeInit(); }
  // Re-scan on soft nav (Next.js router push)
  var origPush = history.pushState;
  history.pushState = function(){ origPush.apply(this, arguments); setTimeout(init, 300); };
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: "dark" }}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-[#09090f]`} style={{ background: "#09090f" }}>
        <script dangerouslySetInnerHTML={{ __html: revealScript }} />
        <div className="fixed inset-0 pointer-events-none noise z-[-1] opacity-50"></div>
        <AuthProvider>
          <div className="page-enter relative z-0">
            {children}
          </div>
          <ScrollToTop />
          <Toaster 
            theme="dark" 
            position="bottom-right"
            toastOptions={{ 
              style: { 
                background: '#0a0f1c', 
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff',
                fontFamily: 'var(--font-sans)',
              } 
            }} 
          />
        </AuthProvider>
      </body>
    </html>
  );
}
