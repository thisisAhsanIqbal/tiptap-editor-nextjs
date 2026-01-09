"use client";

import React from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import ThemeSwitcher from "./theme-switcher";
import GithubIcon from "../../assets/github.svg";
import Logo from "../../assets/logo.svg";

const Header = () => {
  const pathname = usePathname();
  const isEditPage = pathname === "/";

  return (
    <header className="sticky z-50 top-0 px-6 border-b border-neutral-300 dark:border-neutral-700 bg-white/20 dark:bg-[#0d101820] backdrop-blur-lg">
      <div className="h-14 w-full mx-auto flex items-center justify-between gap-6">
        <Link href="/">
          <Logo width={120} />
        </Link>

        <div className="flex items-center gap-5 px-3">
          <Link
            href="/posts"
            className="text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium"
          >
            All Posts
          </Link>
          <ThemeSwitcher />
          <Link href="https://github.com/thisisAhsanIqbal/tiptap-editor-nextjs/tree/main">
            <GithubIcon className="size-5" />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
