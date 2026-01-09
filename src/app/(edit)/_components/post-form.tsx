"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useForm, Controller } from "react-hook-form";
import { LuSave, LuImage, LuX } from "react-icons/lu";

import TiptapEditor, { type TiptapEditorRef } from "@/components/tiptap-editor";
import { loadInitialContent } from "@/components/tiptap-editor/helpers/tiptap";
import MediaLibrary from "@/components/media-library";
import Dialog from "@/components/tiptap-editor/components/ui/dialog";
import { Post } from "@/services/post";

type PostForm = Pick<Post, "title" | "html" | "readingTime">;

interface PostFormProps {
  post: Post | null;
  editable: boolean;
  onSave: (values: Partial<Post>, createNew?: boolean) => Promise<void>;
  saveStatus?: "idle" | "saving" | "saved" | "error";
  onCreateNew?: () => void;
}

export default function PostForm({ post, editable, onSave, saveStatus = "idle", onCreateNew }: PostFormProps) {
  const editorRef = useRef<TiptapEditorRef>(null);
  const [coverImage, setCoverImage] = useState<string>("");
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  
  const form = useForm<PostForm>({
    defaultValues: {
      title: "",
      html: "",
      readingTime: undefined,
    },
  });

  const calculateReadingTime = useCallback(() => {
    const editor = editorRef.current;
    const wordCount = editor?.storage.characterCount.words() ?? 0;
    return Math.max(1, Math.ceil(wordCount / 150));
  }, []);

  useEffect(() => {
    if (post) {
      form.reset({ 
        title: post.title,
        html: post.html,
        readingTime: post.readingTime,
      });
      setCoverImage(post.cover || "");
      // Update editor content when post is loaded
      if (editorRef.current && post.html) {
        loadInitialContent(editorRef.current, post.html);
      }
    } else {
      // Clear form when post is null (new post)
      form.reset({
        title: "",
        html: "",
        readingTime: undefined,
      });
      setCoverImage("");
      // Clear editor content when creating new post
      if (editorRef.current) {
        loadInitialContent(editorRef.current, "");
      }
    }
  }, [post, form]);

  // Auto-save removed - only save when button is clicked

  const handleRemoveCoverImage = useCallback(() => {
    setCoverImage("");
  }, []);

  const handleSelectFromLibrary = useCallback((image: { url: string }) => {
    setCoverImage(image.url);
    setShowMediaLibrary(false);
  }, []);

  const handleSaveClick = useCallback(async () => {
    const editor = editorRef.current;
    if (!editor) {
      console.error('Editor not available');
      return;
    }

    try {
      const wordCount = editor.storage.characterCount.words() ?? 0;
      const readingTime = Math.max(1, Math.ceil(wordCount / 150));
      const json = editor.getJSON();
      const html = editor.getHTML();
      const title = form.getValues("title");

      // Validate
      if (!title?.trim()) {
        alert('Please enter a title');
        return;
      }
      if (!html.trim()) {
        alert('Please enter some content');
        return;
      }

      // Determine if we're creating a new post or updating existing
      // If post has an ID, we're updating; otherwise creating new
      const createNew = !post?.id;
      
      // Call onSave with current data including cover image
      await onSave({ title, html, json, readingTime, cover: coverImage || undefined }, createNew);
    } catch (error) {
      console.error('Error in handleSaveClick:', error);
    }
  }, [form, onSave, post, coverImage]);

  return (
    <div className="flex flex-col gap-6">
      {/* Cover Image Section */}
      <div>
        <label className="font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
          <div className="w-1 h-5 bg-indigo-500 rounded-full" />
          Cover Image
        </label>
        <div className="space-y-3">
          {coverImage ? (
            <div className="relative group">
              <div className="w-full h-64 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                <img
                  src={coverImage}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              </div>
              {editable && (
                <button
                  onClick={handleRemoveCoverImage}
                  className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove cover image"
                >
                  <LuX className="size-4" />
                </button>
              )}
            </div>
          ) : (
            <div 
              onClick={() => editable && setShowMediaLibrary(true)}
              className={`w-full h-64 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 flex items-center justify-center ${
                editable ? 'cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors' : ''
              }`}
            >
              <div className="text-center">
                <LuImage className="size-12 mx-auto text-slate-400 dark:text-slate-600 mb-2" />
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                  No cover image
                </p>
                {editable && (
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Click to choose from library
                  </p>
                )}
              </div>
            </div>
          )}
          {editable && (
            <div>
              <button
                onClick={() => setShowMediaLibrary(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
              >
                <LuImage className="size-4" />
                <span>Choose from Library</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
          <div className="w-1 h-5 bg-indigo-500 rounded-full" />
          Title
        </label>
        <Controller
          control={form.control}
          name="title"
          render={({ field }) => (
            <input
              {...field}
              type="text"
              className="w-full px-4 py-2.5 shadow border border-[#d1d9e0] rounded-md bg-white dark:bg-[#0d1017] dark:text-white dark:border-[#3d444d] outline-none"
              placeholder="Enter post title..."
            />
          )}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <div className="w-1 h-5 bg-indigo-500 rounded-full" />
            Content
          </label>
          <div className="flex items-center gap-2">
            {onCreateNew && (
              <button
                onClick={onCreateNew}
                disabled={saveStatus === "saving" || !editable}
                className="flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                New Post
              </button>
            )}
            <button
              onClick={handleSaveClick}
              disabled={saveStatus === "saving" || !editable}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-colors ${
                saveStatus === "saving"
                  ? "bg-slate-400 cursor-not-allowed text-white"
                  : saveStatus === "saved"
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : saveStatus === "error"
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }`}
            >
              <LuSave className="size-4" />
              <span>
                {saveStatus === "saving"
                  ? "Saving..."
                  : saveStatus === "saved"
                  ? "Saved!"
                  : saveStatus === "error"
                  ? "Error"
                  : post?.id
                  ? "Update Post"
                  : "Create Post"}
              </span>
            </button>
          </div>
        </div>
        <Controller
          control={form.control}
          name="html"
          render={({ field }) => (
            <TiptapEditor
              ref={editorRef}
              readonly={!editable}
              output="html"
              content={post?.html}
              minHeight={320}
              maxHeight={640}
              maxWidth={700}
              onChange={field.onChange}
              placeholder={{
                paragraph: "Type your content here...",
                imageCaption: "Type caption for image (optional)",
              }}
            />
          )}
        />
      </div>

      {/* Media Library Dialog */}
      <Dialog open={showMediaLibrary} onOpenChange={setShowMediaLibrary}>
        <MediaLibrary
          onClose={() => setShowMediaLibrary(false)}
          onInsert={handleSelectFromLibrary}
        />
      </Dialog>
    </div>
  );
}
