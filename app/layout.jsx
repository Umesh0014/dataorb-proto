import "./globals.css";
import CommentLayer from "../components/CommentLayer";

export const metadata = {
  title: "DataOrb — Dashboard Shell",
  description: "DataOrb insights dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body>
        {children}
        <CommentLayer />
      </body>
    </html>
  );
}
