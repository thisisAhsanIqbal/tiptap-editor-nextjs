"use client";

import React from "react";

import { LuDownload } from "react-icons/lu";

interface ActionBarProps {
  onExport: () => void;
}

const ActionBar = ({
  onExport,
}: ActionBarProps) => {
  return (
    <div className="mb-6 flex items-center justify-end flex-wrap gap-3">
      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={onExport}
          className="flex items-center gap-2 px-2 sm:px-4 h-8 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-md font-medium border border-slate-200 dark:border-slate-700 text-sm"
        >
          <LuDownload className="size-4" />
          <span className="hidden sm:inline">Export</span>
        </button>
      </div>
    </div>
  );
};

export default ActionBar;
