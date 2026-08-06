import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownContentProps {
  content: string;
  className?: string;
}

/**
 * Renders a markdown string as styled HTML. Used for blog post bodies (and
 * anywhere else in the app that ends up wanting rich text from a plain
 * string — reviews, announcements, etc.) so it lives here rather than
 * under features/blog.
 *
 * Uses @tailwindcss/typography's `prose` classes for sensible default
 * spacing/type — themed to match Threddo's brand colors via the prose-*
 * CSS variable overrides below rather than fighting the plugin's defaults
 * per-element.
 */
export function MarkdownContent({ content, className = "" }: MarkdownContentProps) {
  return (
    <div
      className={`prose max-w-none prose-neutral prose-headings:font-[var(--font-display)] prose-headings:text-[#1B1F3B] prose-a:text-[#E8543D] prose-a:no-underline hover:prose-a:underline prose-blockquote:border-l-[#E8A33D] prose-strong:text-[#1B1F3B] prose-img:rounded-xl ${className}`}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
