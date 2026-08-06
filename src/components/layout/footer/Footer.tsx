import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#1B1F3B] py-10">
      <div className="container mx-auto flex flex-col items-center gap-3 px-6 text-center text-sm text-white/60">
        <Image src="/logo-light.png" alt="Threddo" width={35} height={40} />
        <p>© {new Date().getFullYear()} Threddo. All rights reserved.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/about" className="text-white/70 hover:text-white hover:underline">
            About
          </Link>
          <Link href="/safety" className="text-white/70 hover:text-white hover:underline">
            Safety
          </Link>
          <Link href="/privacy" className="text-white/70 hover:text-white hover:underline">
            Privacy
          </Link>
          <Link href="/terms" className="text-white/70 hover:text-white hover:underline">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}
