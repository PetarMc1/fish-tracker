import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import Navbar from "@/components/NavBar";
import Footer from "@/components/Footer";
import "@/styles/globals.css";

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isAdminPage = router.pathname === '/admin';

  return (
    <>
      <div className="w-full bg-red-500 border-b border-red-500" role="status" aria-live="polite">
        <div className="max-w-6xl mx-auto px-4 py-3 text-center text-black font-semibold text-sm sm:text-base">
          API unavailable due to project inactivity. For more information contact <a href="mailto:petar@petarmc.com" className="">petar@petarmc.com</a>
        </div>
      </div>
      {!isAdminPage && <Navbar />}
      <Component {...pageProps}/>
      {!isAdminPage && <Footer />}
    </>
  );
}
