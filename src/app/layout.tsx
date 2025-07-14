import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LINE Chat App",
  description: "A LINE-style chat application",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "LINE Chat",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#8cabd8",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Clear all caches immediately on page load
              if ('caches' in window) {
                caches.keys().then(function(names) {
                  for (let name of names) {
                    caches.delete(name);
                  }
                });
              }
              
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  // Unregister all existing service workers first
                  navigator.serviceWorker.getRegistrations().then(function(registrations) {
                    for(let registration of registrations) {
                      registration.unregister();
                    }
                  }).then(function() {
                    // Register new service worker
                    return navigator.serviceWorker.register('/sw.js?v=' + Date.now());
                  }).then(function(registration) {
                    console.log('ServiceWorker registration successful');
                    
                    // Force immediate activation
                    if (registration.waiting) {
                      registration.waiting.postMessage({type: 'SKIP_WAITING'});
                    }
                    
                    // Check for updates every 30 seconds
                    setInterval(function() {
                      registration.update();
                    }, 30000);
                    
                    // Handle updates
                    registration.addEventListener('updatefound', function() {
                      const newWorker = registration.installing;
                      if (newWorker) {
                        newWorker.addEventListener('statechange', function() {
                          if (newWorker.state === 'installed') {
                            // Force reload without confirmation
                            window.location.reload(true);
                          }
                        });
                      }
                    });
                  }).catch(function(error) {
                    console.log('ServiceWorker registration failed: ', error);
                  });
                });
                
                // Listen for controllerchange event
                navigator.serviceWorker.addEventListener('controllerchange', function() {
                  window.location.reload(true);
                });
              }
              
              // Force reload on page visibility change
              document.addEventListener('visibilitychange', function() {
                if (!document.hidden) {
                  window.location.reload(true);
                }
              });
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
