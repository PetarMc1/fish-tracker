import type { AppProps } from "next/app";
import Navbar from "@/components/NavBar";
import "@/styles/globals.css"; // your global styles

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Navbar />
      <Component {...pageProps}/>
    </>
  );
}
