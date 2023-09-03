import "./globals.css";
import { Inter } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
import { MyContextProvider } from "@/context/MyContext";
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Marzban Seller Panel",
  description: "Marzban Seller Panel",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <MyContextProvider>{children}</MyContextProvider>
      </body>
    </html>
  );
}
