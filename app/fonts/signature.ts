import localFont from "next/font/local";

// Mrs Saint Delafield (SIL OFL 1.1), for the handwritten signature on the home page.
export const signature = localFont({
  src: "./mrs-saint-delafield.woff2",
  variable: "--font-signature",
  weight: "400",
  display: "block",
});
