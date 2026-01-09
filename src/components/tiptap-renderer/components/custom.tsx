import React from "react";
import type { ReactElement } from "react";

import dynamic from "next/dynamic";
import Image from "next/image";
import { type Components } from "rehype-react";

import CopyButton from "./copy-button";
import HeadingWithAnchor from "./heading-with-anchor";

const SyntaxHighlighter = dynamic(() => import("./syntax-highlighter"));

interface PreProps {
  children?: React.ReactNode;
  [key: string]: any;
}

interface CodeProps {
  children?: React.ReactNode;
  className?: string;
  [key: string]: any;
}

interface ImageProps {
  src: string;
  alt?: string;
  width: string | number;
  "data-width": string | number;
  "data-height": string | number;
  [key: string]: any;
}

export const components: Partial<Components> = {
  h2: (props) => <HeadingWithAnchor level={2} {...props} />,
  h3: (props) => <HeadingWithAnchor level={3} {...props} />,
  h4: (props) => <HeadingWithAnchor level={4} {...props} />,
  img: ({ src, alt, width, ...props }: ImageProps) => (
    <Image
      src={src}
      alt={alt || ""}
      width={+props["data-width"]}
      height={+props["data-height"]}
      className="mx-auto rounded-lg"
    />
  ),
  iframe: (props: any) => {
    // Convert string boolean attributes to actual booleans
    // Handle both camelCase (React) and lowercase (HTML) attribute names
    const {
      autoPlay,
      autoplay,
      loop,
      allowFullScreen,
      allowfullscreen,
      ...restProps
    } = props;
    
    const booleanProps: any = {};
    
    // Handle autoPlay/autoplay
    const autoPlayValue = autoPlay ?? autoplay;
    if (autoPlayValue !== undefined) {
      booleanProps.autoPlay = typeof autoPlayValue === "string" 
        ? autoPlayValue === "true" || autoPlayValue === "1"
        : Boolean(autoPlayValue);
    }
    
    // Handle loop
    if (loop !== undefined) {
      booleanProps.loop = typeof loop === "string"
        ? loop === "true" || loop === "1"
        : Boolean(loop);
    }
    
    // Handle allowFullScreen/allowfullscreen
    const allowFullScreenValue = allowFullScreen ?? allowfullscreen;
    if (allowFullScreenValue !== undefined) {
      booleanProps.allowFullScreen = typeof allowFullScreenValue === "string"
        ? allowFullScreenValue === "true" || allowFullScreenValue === "1"
        : Boolean(allowFullScreenValue);
    }
    
    return (
      <iframe
        className="w-full h-full aspect-video mx-auto rounded-lg"
        {...restProps}
        {...booleanProps}
      />
    );
  },
  pre: ({ children, ...props }: PreProps) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const code = (children as ReactElement).props.children;
    return (
      <div className="relative group not-prose rounded-lg overflow-hidden border border-[#d1d9e0] dark:border-[#3d444d]">
        <CopyButton code={String(code)} />
        <pre {...(props as any)}>{children}</pre>
      </div>
    );
  },
  code: ({ children, ...props }: CodeProps) => {
    const match = /language-(\w+)/.exec(props.className || "");
    const code = String(children).replace(/\n$/, "");
    return match ? (
      <SyntaxHighlighter language={match[1]} content={code} />
    ) : (
      <code {...props}>{children}</code>
    );
  },
  table: (props: any) => (
    <table
      className="not-prose w-full table-auto border-collapse mx-auto text-sm"
      {...props}
    />
  ),
  tr: (props: any) => (
    <tr
      className="border-b last:border-b-0 border-b-[#d1d9e0] dark:border-b-[#3d444d]"
      {...props}
    />
  ),
  td: (props: any) => <td className="px-2.5 py-3.5" {...props} />,
  th: (props: any) => <td className="px-2.5 py-3.5 font-bold" {...props} />,
};
