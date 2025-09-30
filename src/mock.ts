// HTML String Format (Compact - no line breaks)
export const htmlMock = {
  title:
    "Building Modern Rich Text Editors with Tiptap: A Complete Developer Guide",
  content: `<h2>Why Choose Tiptap for Your Next Project?</h2><p>In the rapidly evolving landscape of web development, creating engaging content editing experiences has become crucial for modern applications. Tiptap stands out as a headless rich text editor built on top of ProseMirror, offering developers unparalleled flexibility and control over their editing interfaces while maintaining powerful functionality under the hood.</p><h3>The Headless Advantage</h3><p>Unlike traditional WYSIWYG editors that come with predefined UI components, Tiptap gives you complete control over the user interface. This headless approach means you can design editors that perfectly match your application's design system and user experience requirements.</p><pre><code class="language-javascript">import { useEditor, EditorContent } from '@tiptap/react'\nimport StarterKit from '@tiptap/starter-kit'\n\nconst TiptapEditor = () => {\n  const editor = useEditor({\n    extensions: [StarterKit],\n    content: '&lt;p&gt;Start typing your content here...&lt;/p&gt;',\n    editorProps: {\n      attributes: {\n        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',\n      },\n    },\n  })\n\n  return &lt;EditorContent editor={editor} /&gt;\n}</code></pre><figure><img src="https://res.cloudinary.com/dmhzdv5kf/image/upload/v1735024108/tiptap-editor-interface.jpg" alt="Tiptap Editor Interface Example" style="width:85%" data-width="1200" data-height="700" /><figcaption>A modern Tiptap editor interface with custom toolbar and styling</figcaption></figure><h2>Essential Extensions and Customization</h2><p>Tiptap's modular architecture shines through its extension system. Each piece of functionality is provided by an extension, allowing you to build exactly the editor you need without unnecessary bloat.</p><h3>Popular Extensions You Should Know</h3><ul><li><strong>StarterKit:</strong> Includes basic formatting like bold, italic, headings, and lists</li><li><strong>Image:</strong> Drag-and-drop image support with resizing capabilities</li><li><strong>Link:</strong> URL linking with customizable validation and styling</li><li><strong>Table:</strong> Full-featured table editing with row/column manipulation</li><li><strong>CodeBlock:</strong> Syntax-highlighted code blocks with language selection</li></ul><pre><code class="language-javascript">import { Editor } from '@tiptap/core'\nimport StarterKit from '@tiptap/starter-kit'\nimport Image from '@tiptap/extension-image'\nimport Link from '@tiptap/extension-link'\nimport CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'\nimport { lowlight } from 'lowlight'\n\nconst editor = new Editor({\n  element: document.querySelector('.element'),\n  extensions: [\n    StarterKit,\n    Image.configure({\n      HTMLAttributes: {\n        class: 'rounded-lg shadow-md',\n      },\n    }),\n    Link.configure({\n      openOnClick: false,\n      HTMLAttributes: {\n        class: 'text-blue-600 underline cursor-pointer',\n      },\n    }),\n    CodeBlockLowlight.configure({\n      lowlight,\n    }),\n  ],\n  content: '&lt;p&gt;Hello World! 🌎️&lt;/p&gt;',\n})</code></pre><blockquote><p>"The beauty of Tiptap lies in its flexibility. You're not constrained by predetermined UI decisions – you have the freedom to create exactly the editing experience your users need." - Philipp Kühn, Creator of Tiptap</p></blockquote><h3>Building Custom Extensions</h3><p>Creating custom extensions allows you to add specialized functionality tailored to your application's needs. Here's how you can build a simple custom node:</p><pre><code class="language-javascript">import { Node, mergeAttributes } from '@tiptap/core'\n\nconst CustomCallout = Node.create({\n  name: 'callout',\n  \n  addOptions() {\n    return {\n      types: ['info', 'warning', 'error', 'success'],\n      HTMLAttributes: {},\n    }\n  },\n\n  addAttributes() {\n    return {\n      type: {\n        default: 'info',\n        parseHTML: element => element.getAttribute('data-type'),\n        renderHTML: attributes => ({\n          'data-type': attributes.type,\n        }),\n      },\n    }\n  },\n\n  parseHTML() {\n    return [\n      {\n        tag: 'div[data-type]',\n      },\n    ]\n  },\n\n  renderHTML({ HTMLAttributes }) {\n    return [\n      'div',\n      mergeAttributes(\n        { class: 'callout' },\n        this.options.HTMLAttributes,\n        HTMLAttributes,\n      ),\n      0,\n    ]\n  },\n\n  addCommands() {\n    return {\n      setCallout: attributes => ({ commands }) => {\n        return commands.wrapIn(this.name, attributes)\n      },\n    }\n  },\n})</code></pre><h2>Advanced Features and Real-World Applications</h2><p>Modern applications demand more than basic text editing. Tiptap excels in providing advanced features that power sophisticated content management systems and collaborative platforms.</p><table><thead><tr><th>Feature</th><th>Use Case</th><th>Implementation Complexity</th><th>Performance Impact</th></tr></thead><tbody><tr><td>Collaborative Editing</td><td>Multi-user documents</td><td>High</td><td>Medium</td></tr><tr><td>Slash Commands</td><td>Quick content insertion</td><td>Medium</td><td>Low</td></tr><tr><td>Drag & Drop</td><td>Media and block reordering</td><td>Medium</td><td>Low</td></tr><tr><td>Real-time Preview</td><td>Live markdown rendering</td><td>Low</td><td>Low</td></tr><tr><td>Custom Nodes</td><td>Specialized content types</td><td>High</td><td>Variable</td></tr></tbody></table><h3>Implementing Slash Commands</h3><p>Slash commands provide users with a quick way to insert content and format text, similar to modern editors like Notion:</p><pre><code class="language-javascript">import { Extension } from '@tiptap/core'\nimport Suggestion from '@tiptap/suggestion'\n\nconst SlashCommand = Extension.create({\n  name: 'slashCommand',\n\n  addOptions() {\n    return {\n      suggestion: {\n        char: '/',\n        command: ({ editor, range, props }) => {\n          props.command({ editor, range })\n        },\n      },\n    }\n  },\n\n  addProseMirrorPlugins() {\n    return [\n      Suggestion({\n        editor: this.editor,\n        ...this.options.suggestion,\n      }),\n    ]\n  },\n})\n\n// Usage with command items\nconst commandItems = [\n  {\n    title: 'Heading 1',\n    command: ({ editor, range }) => {\n      editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run()\n    },\n  },\n  {\n    title: 'Bold Text',\n    command: ({ editor, range }) => {\n      editor.chain().focus().deleteRange(range).toggleBold().run()\n    },\n  },\n]</code></pre><iframe width="560" height="315" src="https://www.youtube.com/embed/tiptap-slash-commands-demo" title="Tiptap Slash Commands Demo"></iframe><h2>Performance Optimization and Best Practices</h2><p>Building performant editors requires attention to several key areas, from initial setup to ongoing maintenance and optimization strategies.</p><h3>Memory Management and Editor Lifecycle</h3><p>Proper editor lifecycle management is crucial for preventing memory leaks in single-page applications:</p><pre><code class="language-javascript">import { useEffect, useRef } from 'react'\nimport { useEditor } from '@tiptap/react'\n\nconst MyEditor = () => {\n  const editor = useEditor({\n    extensions: [StarterKit],\n    content: '&lt;p&gt;Hello World!&lt;/p&gt;',\n  })\n\n  // Cleanup on unmount\n  useEffect(() => {\n    return () => {\n      if (editor) {\n        editor.destroy()\n      }\n    }\n  }, [editor])\n\n  return &lt;EditorContent editor={editor} /&gt;\n}</code></pre><h3>Optimizing Large Documents</h3><p>For applications dealing with large documents or complex content structures, consider these optimization strategies:</p><ol><li><strong>Lazy Loading Extensions:</strong> Load extensions dynamically based on content requirements</li><li><strong>Virtual Scrolling:</strong> Implement virtual scrolling for very long documents</li><li><strong>Content Chunking:</strong> Break large documents into manageable sections</li><li><strong>Debounced Updates:</strong> Use debouncing for auto-save and live preview features</li></ol><h2>Integration with Modern Frameworks</h2><p>Tiptap seamlessly integrates with popular frameworks, making it a versatile choice for various technology stacks and development environments.</p><h3>Next.js Integration Best Practices</h3><p>When using Tiptap with Next.js, consider server-side rendering implications and dynamic imports:</p><pre><code class="language-javascript">import dynamic from 'next/dynamic'\n\n// Dynamically import to avoid SSR issues\nconst TiptapEditor = dynamic(() => import('../components/TiptapEditor'), {\n  ssr: false,\n  loading: () => &lt;div className="animate-pulse h-96 bg-gray-200 rounded"&gt;&lt;/div&gt;,\n})\n\nexport default function EditorPage() {\n  return (\n    &lt;div className="container mx-auto py-8"&gt;\n      &lt;h1 className="text-3xl font-bold mb-6"&gt;Document Editor&lt;/h1&gt;\n      &lt;TiptapEditor /&gt;\n    &lt;/div&gt;\n  )\n}</code></pre><h2>Security Considerations and Content Sanitization</h2><p>When dealing with user-generated content, security should always be a top priority. Tiptap provides built-in sanitization, but additional measures may be necessary depending on your use case.</p><ul><li>HTML sanitization to prevent XSS attacks</li><li>Content validation and schema enforcement</li><li>File upload restrictions and scanning</li><li>Rate limiting for collaborative features</li></ul><h2>Future-Proofing Your Editor Implementation</h2><p>As content editing requirements continue to evolve, building with extensibility and maintainability in mind ensures your editor can grow with your application's needs. Tiptap's architecture supports this evolution through its modular design and active ecosystem.</p><p>The combination of flexibility, performance, and developer experience makes Tiptap an excellent choice for applications ranging from simple blog editors to complex collaborative platforms. By understanding its core concepts and leveraging its powerful extension system, you can create editing experiences that truly serve your users' needs.</p>`,
  wordCount: 672,
  cover:
    "https://res.cloudinary.com/dmhzdv5kf/image/upload/v1735024108/tiptap-developer-guide.jpg",
  author: "Frontend Architect",
  createdAt: "Jan, 28 2025",
  readingTime: 4,
};

// Tiptap JSON Format
export const jsonMock = {
  title: "Building Scalable APIs with Node.js and TypeScript",
  content: {
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Introduction to API Architecture" }],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Modern web applications rely heavily on well-designed APIs. Building scalable APIs with Node.js and TypeScript provides type safety, better developer experience, and improved maintainability.",
          },
        ],
      },
      {
        type: "heading",
        attrs: { level: 3 },
        content: [
          { type: "text", text: "Why TypeScript for API Development?" },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "TypeScript brings several advantages to API development:",
          },
        ],
      },
      {
        type: "bulletList",
        content: [
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  { type: "text", text: "Compile-time error detection" },
                ],
              },
            ],
          },
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "Better IDE support and autocompletion",
                  },
                ],
              },
            ],
          },
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  { type: "text", text: "Enhanced refactoring capabilities" },
                ],
              },
            ],
          },
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "Improved code documentation through types",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        type: "figure",
        content: [
          {
            type: "image",
            attrs: {
              src: "https://res.cloudinary.com/dmhzdv5kf/image/upload/v1733364958/nodejs-typescript-api.jpg",
              alt: "Node.js TypeScript API Architecture",
              width: "75%",
              "data-width": "900",
              "data-height": "600",
            },
          },
          {
            type: "figcaption",
            content: [
              {
                type: "text",
                text: "Modern API architecture with Node.js and TypeScript",
              },
            ],
          },
        ],
      },
      {
        type: "heading",
        attrs: { level: 3 },
        content: [{ type: "text", text: "Setting Up the Project Structure" }],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "A well-organized project structure is essential for maintainable APIs:",
          },
        ],
      },
      {
        type: "codeBlock",
        attrs: { language: "bash" },
        content: [
          {
            type: "text",
            text: "src/\n├── controllers/\n├── middleware/\n├── models/\n├── routes/\n├── services/\n├── types/\n├── utils/\n└── app.ts",
          },
        ],
      },
      {
        type: "heading",
        attrs: { level: 3 },
        content: [{ type: "text", text: "Database Integration with Prisma" }],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Prisma provides excellent TypeScript support and type-safe database operations:",
          },
        ],
      },
      {
        type: "codeBlock",
        attrs: { language: "typescript" },
        content: [
          {
            type: "text",
            text: "import { PrismaClient } from '@prisma/client';\n\nconst prisma = new PrismaClient();\n\nexport class UserService {\n  async createUser(data: CreateUserDto): Promise<User> {\n    return prisma.user.create({\n      data: {\n        email: data.email,\n        name: data.name,\n        role: data.role || 'USER'\n      }\n    });\n  }\n\n  async getUserById(id: string): Promise<User | null> {\n    return prisma.user.findUnique({\n      where: { id },\n      include: { posts: true }\n    });\n  }\n}",
          },
        ],
      },
      {
        type: "blockquote",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: '"Type safety at the database layer eliminates entire classes of runtime errors and provides confidence in data operations." - Prisma Team',
              },
            ],
          },
        ],
      },
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Authentication and Authorization" }],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Implementing secure authentication is crucial for any API. Here's a robust approach using JWT tokens:",
          },
        ],
      },
      {
        type: "codeBlock",
        attrs: { language: "typescript" },
        content: [
          {
            type: "text",
            text: "interface JWTPayload {\n  userId: string;\n  email: string;\n  role: UserRole;\n}\n\nexport class AuthService {\n  private readonly JWT_SECRET = process.env.JWT_SECRET!;\n  private readonly JWT_EXPIRES_IN = '7d';\n\n  generateToken(payload: JWTPayload): string {\n    return jwt.sign(payload, this.JWT_SECRET, {\n      expiresIn: this.JWT_EXPIRES_IN\n    });\n  }\n\n  verifyToken(token: string): JWTPayload {\n    return jwt.verify(token, this.JWT_SECRET) as JWTPayload;\n  }\n}",
          },
        ],
      },
      {
        type: "table",
        content: [
          {
            type: "tableRow",
            content: [
              {
                type: "tableHeader",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "Authentication Method" }],
                  },
                ],
              },
              {
                type: "tableHeader",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "Security Level" }],
                  },
                ],
              },
              {
                type: "tableHeader",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "Complexity" }],
                  },
                ],
              },
              {
                type: "tableHeader",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "Scalability" }],
                  },
                ],
              },
            ],
          },
          {
            type: "tableRow",
            content: [
              {
                type: "tableCell",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "JWT Tokens" }],
                  },
                ],
              },
              {
                type: "tableCell",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "High" }],
                  },
                ],
              },
              {
                type: "tableCell",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "Medium" }],
                  },
                ],
              },
              {
                type: "tableCell",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "Excellent" }],
                  },
                ],
              },
            ],
          },
          {
            type: "tableRow",
            content: [
              {
                type: "tableCell",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "Session-based" }],
                  },
                ],
              },
              {
                type: "tableCell",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "Medium" }],
                  },
                ],
              },
              {
                type: "tableCell",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "Low" }],
                  },
                ],
              },
              {
                type: "tableCell",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "Limited" }],
                  },
                ],
              },
            ],
          },
          {
            type: "tableRow",
            content: [
              {
                type: "tableCell",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "OAuth 2.0" }],
                  },
                ],
              },
              {
                type: "tableCell",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "Very High" }],
                  },
                ],
              },
              {
                type: "tableCell",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "High" }],
                  },
                ],
              },
              {
                type: "tableCell",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "Excellent" }],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        type: "heading",
        attrs: { level: 3 },
        content: [{ type: "text", text: "Error Handling and Validation" }],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Robust error handling and request validation are essential for production APIs:",
          },
        ],
      },
      {
        type: "orderedList",
        content: [
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  { type: "text", text: "Input validation using " },
                  { type: "text", text: "Joi", marks: [{ type: "strong" }] },
                  { type: "text", text: " or " },
                  { type: "text", text: "Zod", marks: [{ type: "strong" }] },
                ],
              },
            ],
          },
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "Centralized error handling middleware",
                  },
                ],
              },
            ],
          },
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "Structured error responses with consistent format",
                  },
                ],
              },
            ],
          },
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  { type: "text", text: "Logging and monitoring integration" },
                ],
              },
            ],
          },
        ],
      },
      {
        type: "iframe",
        attrs: {
          width: 560,
          height: 315,
          src: "https://www.youtube.com/embed/api-best-practices",
        },
      },
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Performance and Caching Strategies" }],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Optimizing API performance involves several key strategies:",
          },
        ],
      },
      {
        type: "bulletList",
        content: [
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "Database query optimization and indexing",
                  },
                ],
              },
            ],
          },
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "Redis caching for frequently accessed data",
                  },
                ],
              },
            ],
          },
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "Response compression and minification",
                  },
                ],
              },
            ],
          },
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "Connection pooling and database optimization",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Testing and Documentation" }],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Comprehensive testing and documentation ensure API reliability and developer experience.",
          },
        ],
      },
      {
        type: "codeBlock",
        attrs: { language: "typescript" },
        content: [
          {
            type: "text",
            text: "describe('UserController', () => {\n  let app: Express;\n  let prisma: PrismaClient;\n\n  beforeEach(async () => {\n    prisma = new PrismaClient();\n    app = createTestApp();\n  });\n\n  describe('POST /users', () => {\n    it('should create a new user', async () => {\n      const userData = {\n        email: 'test@example.com',\n        name: 'Test User'\n      };\n\n      const response = await request(app)\n        .post('/users')\n        .send(userData)\n        .expect(201);\n\n      expect(response.body).toMatchObject({\n        id: expect.any(String),\n        email: userData.email,\n        name: userData.name\n      });\n    });\n  });\n});",
          },
        ],
      },
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Deployment and DevOps" }],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Modern deployment strategies ensure your API scales effectively. Consider containerization with Docker, orchestration with Kubernetes, and CI/CD pipelines for automated deployments.",
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          { type: "text", text: "Key deployment considerations include:" },
        ],
      },
      {
        type: "bulletList",
        content: [
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "Environment-specific configuration management",
                  },
                ],
              },
            ],
          },
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "Health checks and monitoring endpoints",
                  },
                ],
              },
            ],
          },
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "Graceful shutdown handling" }],
              },
            ],
          },
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "Load balancing and horizontal scaling",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Conclusion" }],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Building scalable APIs with Node.js and TypeScript requires careful consideration of architecture, security, performance, and maintainability. By following these patterns and best practices, you can create robust APIs that serve as reliable foundations for modern applications.",
          },
        ],
      },
    ],
  },
  wordCount: 720,
  cover:
    "https://res.cloudinary.com/dmhzdv5kf/image/upload/v1733364957/nodejs-api-cover.jpg",
  author: "Backend Developer",
  createdAt: "Jan, 20 2025",
  readingTime: 5,
};

// Export both formats for easy use
export const mockData = {
  html: htmlMock,
  json: jsonMock,
};
