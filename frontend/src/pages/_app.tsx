import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import Navbar from "@/components/NavBar";
import "@/styles/globals.css";

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isAdminPage = router.pathname === '/admin';

  return (
    <>
      {!isAdminPage && <Navbar />}
      <Component {...pageProps}/>
    </>
  );
}
