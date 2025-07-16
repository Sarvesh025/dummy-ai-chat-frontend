import "./globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const metadata = {
  title: "Kuvaka Chat",
  description: "Gemini-style chat app",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-white dark:bg-gray-900 transition-colors">
      <body className="min-h-screen">
        <ToastContainer />
        <main>{children}</main>
      </body>
    </html>
  );
}
