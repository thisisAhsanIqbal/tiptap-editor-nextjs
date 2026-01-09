import CodeBlock from "@tiptap/extension-code-block";

import { defaultLanguage } from "@/lib/lowlight";

import { lowlightPlugin } from "./lowlight-plugin";

export const CodeBlockLowlight = CodeBlock.extend({
  addOptions() {
    return {
      ...this.parent?.(),
      defaultLanguage: defaultLanguage,
      languageClassPrefix: "language-",
      exitOnTripleEnter: true,
      exitOnArrowDown: true,
      enableTabIndentation: true,
      tabSize: 2,
      HTMLAttributes: {},
    };
  },

  addProseMirrorPlugins() {
    return [lowlightPlugin];
  },
});
