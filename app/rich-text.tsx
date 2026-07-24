"use client";

import { memo } from "react";
import ReactMarkdown, { defaultUrlTransform } from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

type RichTextProps = {
  content: string;
  className?: string;
  allowedLinks?: readonly string[];
};

function safeUrlTransform(url: string, allowedLinks?: ReadonlySet<string>): string {
  if (url.startsWith("#")) return url;

  try {
    const parsed = new URL(url);
    if (parsed.protocol === "https:" || parsed.protocol === "http:") {
      if (allowedLinks && !allowedLinks.has(parsed.href)) return "";
      return defaultUrlTransform(url);
    }
  } catch {
    return "";
  }

  return "";
}

export const RichText = memo(function RichText({
  content,
  className,
  allowedLinks,
}: RichTextProps) {
  const approved = allowedLinks ? new Set(allowedLinks.map((url) => new URL(url).href)) : undefined;

  return (
    <div className={className}>
      <ReactMarkdown
        skipHtml
        disallowedElements={["img"]}
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[[rehypeKatex, {
          strict: "warn",
          throwOnError: false,
          trust: false,
          output: "htmlAndMathml",
        }]]}
        urlTransform={(url) => safeUrlTransform(url, approved)}
        components={{
          a: ({ href, children, ...props }) => {
            if (!href) return <span>{children}</span>;
            return (
              <a
                {...props}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
              >
                {children}
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});

export function DisplayEquation({
  latex,
  label,
  className,
}: {
  latex: string;
  label: string;
  className?: string;
}) {
  return (
    <div className={className} aria-label={label}>
      <RichText content={`$$\n${latex}\n$$`} />
    </div>
  );
}
