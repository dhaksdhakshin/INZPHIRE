import type { ReactNode } from "react";

import "../styles/index.css";

export const metadata = {
  title: "INZPHIRE",
  description: "INZPHIRE presentations",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
