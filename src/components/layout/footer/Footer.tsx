import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-black/5 py-10">
      <div className="container mx-auto flex flex-col items-center gap-2 px-6 text-center text-sm text-black/60">
        <p>© {new Date().getFullYear()} Threddo. All rights reserved.</p>
        <div className="flex gap-4">
          <Link href="/about" className="hover:underline">
            About
          </Link>
          <Link href="/safety" className="hover:underline">
            Safety
          </Link>
          <Link href="/privacy" className="hover:underline">
            Privacy
          </Link>
          <Link href="/terms" className="hover:underline">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}
