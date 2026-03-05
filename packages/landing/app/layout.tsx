import "./globals.css";

export const metadata = {
  title: "MAYA - Digital Ecosystem v3.0",
  description: "MAYA - Digital Ecosystem",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8"/> 
        <meta content="width=device-width, initial-scale=1.0" name="viewport"/> 
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script> 
        <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;600;700&family=Comfortaa:wght@700&family=Caveat:wght@700&display=swap" rel="stylesheet"/> 
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/> 
        <script dangerouslySetInnerHTML={{ __html: `
            tailwind.config = { 
                darkMode: "class", 
                theme: { 
                    extend: { 
                        colors: { 
                            earth: { 
                                50: '#fdf8f6', 
                                100: '#f2e8e5', 
                                200: '#eaddd7', 
                                800: '#4a3728', 
                                900: '#2d1e16', 
                            }, 
                            flora: "#7FB069", 
                            bloom: "#D36582", 
                            mist: "#6DB1BF", 
                            iridescent: "#A3E4D7", 
                        }, 
                        fontFamily: { 
                            sans: ["'Quicksand'", "sans-serif"], 
                            display: ["'Comfortaa'", "cursive"], 
                            script: ["'Caveat'", "cursive"], 
                        }, 
                    }, 
                }, 
            }; 
        `}} />
        <style dangerouslySetInnerHTML={{ __html: `
            @layer base { 
                body { 
                    background-color: #000000;
                    color: #ffffff;
                    @apply font-sans overflow-x-hidden; 
                } 
                h1, h2, h3 { 
                    @apply font-display; 
                    color: #ffffff;
                    text-shadow: 0 0 40px rgba(255, 255, 255, 0.15);
                } 
            } 
            .organic-shape { 
                border-radius: 60% 40% 70% 30% / 40% 50% 60% 40%; 
            } 
            .neural-pathway { 
                position: absolute; 
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
                height: 2px; 
                z-index: -1; 
                filter: blur(1px); 
            } 
            .glass-module { 
                background: rgba(10, 10, 10, 0.75);
                backdrop-filter: blur(25px);
                -webkit-backdrop-filter: blur(25px);
                border: 1px solid rgba(255, 255, 255, 0.12);
                box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.7);
                border-radius: 2.5rem; 
            } 
            .glow-accent { 
                box-shadow: 0 0 20px rgba(163, 228, 215, 0.5); 
            } 
            .bg-pattern { 
                background-color: #000000;
                background-image: 
                    radial-gradient(circle at 50% 0%, rgba(127, 176, 105, 0.1), transparent 40%),
                    radial-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px);
                background-size: 100% 100%, 40px 40px;
            } 
            .floating { 
                animation: float 6s ease-in-out infinite; 
            } 
            @keyframes float { 
                0% { transform: translateY(0px); } 
                50% { transform: translateY(-20px); } 
                100% { transform: translateY(0px); } 
            } 
            /* Hide scrollbar for Chrome, Safari and Opera */
            ::-webkit-scrollbar {
                display: none;
            }
            /* Hide scrollbar for IE, Edge and Firefox */
            html {
                -ms-overflow-style: none;  /* IE and Edge */
                scrollbar-width: none;  /* Firefox */
            }
            
            [class*="text-earth-900"],
            [class*="text-earth-800"] {
                color: #ffffff !important;
            }
            [class*="bg-earth-900"] {
                background-color: #000000 !important;
                border: 1px solid rgba(255, 255, 255, 0.2);
            }
            [class*="text-earth-200/"],
            [class*="text-earth-800/"],
            [class*="text-earth-900/"] {
                color: rgba(255, 255, 255, 0.8) !important;
            }
            [class*="bg-earth-100"] {
                background-color: rgba(255, 255, 255, 0.05) !important;
            }
            button,
            [role="button"],
            a {
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            button:hover,
            [role="button"]:hover {
                filter: brightness(1.2);
                transform: translateY(-1px);
            }
            input {
                background-color: rgba(20, 20, 20, 0.8) !important;
                color: #ffffff !important;
                border-color: rgba(255, 255, 255, 0.15) !important;
            }
            input:focus {
                border-color: rgba(127, 176, 105, 0.6) !important;
                background-color: rgba(30, 30, 30, 0.9) !important;
            }
        `}} type="text/tailwindcss" />
      </head>
      <body className="bg-pattern">{children}</body>
    </html>
  );
}
