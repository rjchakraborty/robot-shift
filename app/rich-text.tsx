"use client";

import {
  Children,
  isValidElement,
  memo,
  type ReactNode,
} from "react";
import ReactMarkdown, { defaultUrlTransform } from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

type RichTextProps = {
  content: string;
  className?: string;
  allowedLinks?: readonly string[];
};

type HastNode = {
  type?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

function rehypeFocusableDisplayMath() {
  return (tree: HastNode) => {
    const pending = [tree];
    while (pending.length > 0) {
      const node = pending.pop();
      if (!node) continue;
      pending.push(...(node.children ?? []));

      const className = node.properties?.className;
      const classes = Array.isArray(className) ? className : [className];
      if (
        node.type === "element" &&
        classes.some((value) => value === "katex-display")
      ) {
        node.properties = {
          ...node.properties,
          tabIndex: 0,
          role: "region",
          ariaLabel: "Scrollable equation",
        };
      }
    }
  };
}

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

function isMathOnlyParagraph(children: ReactNode) {
  const meaningfulChildren = Children.toArray(children).filter(
    (child) => typeof child !== "string" || child.trim().length > 0,
  );
  if (meaningfulChildren.length !== 1 || !isValidElement(meaningfulChildren[0])) {
    return false;
  }

  const className = (meaningfulChildren[0].props as { className?: unknown }).className;
  return typeof className === "string" && /\bkatex(?:-display)?\b/.test(className);
}

function normalizeDisplayMathBlocks(content: string) {
  return content
    .split(/(```[\s\S]*?```)/g)
    .map((segment) => {
      if (segment.startsWith("```")) return segment;
      return segment.replace(
        /\$\$([\s\S]*?)\$\$/g,
        (_, expression: string) => `\n\n$$\n${expression.trim()}\n$$\n\n`,
      );
    })
    .join("");
}

export const RichText = memo(function RichText({
  content,
  className,
  allowedLinks,
}: RichTextProps) {
  const approved = allowedLinks ? new Set(allowedLinks.map((url) => new URL(url).href)) : undefined;
  const normalizedContent = normalizeDisplayMathBlocks(content);

  return (
    <div className={className}>
      <ReactMarkdown
        skipHtml
        disallowedElements={["img"]}
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[
          [rehypeKatex, {
            strict: "warn",
            throwOnError: false,
            trust: false,
            output: "htmlAndMathml",
          }],
          rehypeFocusableDisplayMath,
        ]}
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
          p: ({ children }) => (
            <p className={isMathOnlyParagraph(children) ? "standalone-equation" : undefined}>
              {children}
            </p>
          ),
        }}
      >
        {normalizedContent}
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
