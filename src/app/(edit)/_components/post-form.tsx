"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useForm, Controller } from "react-hook-form";
import { LuSave, LuImage, LuX } from "react-icons/lu";

import TiptapEditor, { type TiptapEditorRef } from "@/components/tiptap-editor";
import { loadInitialContent } from "@/components/tiptap-editor/helpers/tiptap";
import MediaLibrary from "@/components/media-library";
import Dialog from "@/components/tiptap-editor/components/ui/dialog";
import { Post } from "@/services/post";
import { useCategories } from "@/hooks/use-categories";
import categoryService from "@/lib/supabase/category";

type PostForm = Pick<Post, "title" | "html" | "readingTime" | "metaTitle" | "metaDescription" | "slug">;

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
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const { categories, isLoading: categoriesLoading, refetch: refetchCategories } = useCategories();
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  
  const form = useForm<PostForm>({
    defaultValues: {
      title: "",
      html: "",
      readingTime: undefined,
      metaTitle: "",
      metaDescription: "",
      slug: "",
    },
  });

  const calculateReadingTime = useCallback(() => {
    const editor = editorRef.current;
    const wordCount = editor?.storage.characterCount.words() ?? 0;
    return Math.max(1, Math.ceil(wordCount / 150));
  }, []);

  // Generate slug from title
  const generateSlug = useCallback((title: string): string => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }, []);

  // Format slug: replace spaces with hyphens and clean up
  const formatSlug = useCallback((value: string): string => {
    return value
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/[^\w-]/g, '') // Remove special characters (keep only word chars and hyphens)
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }, []);

  useEffect(() => {
    if (post) {
      form.reset({ 
        title: post.title,
        html: post.html,
        readingTime: post.readingTime,
        metaTitle: post.metaTitle || "",
        metaDescription: post.metaDescription || "",
        slug: post.slug || "",
      });
      setCoverImage(post.cover || "");
      setSelectedCategoryIds(post.categoryIds || []);
      setIsPublished(post.published ?? false);
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
        metaTitle: "",
        metaDescription: "",
        slug: "",
      });
      setCoverImage("");
      setSelectedCategoryIds([]);
      setIsPublished(true); // New posts default to published
      // Clear editor content when creating new post
      if (editorRef.current) {
        loadInitialContent(editorRef.current, "");
      }
    }
  }, [post, form]);

  // Auto-generate slug when title changes (only for new posts)
  const title = form.watch("title");
  useEffect(() => {
    if (!post?.id && title) {
      const autoSlug = generateSlug(title);
      const currentSlug = form.getValues("slug");
      // Only auto-generate if slug is empty or matches the previous auto-generated slug
      if (!currentSlug || currentSlug === generateSlug(form.getValues("title") || "")) {
        form.setValue("slug", autoSlug);
      }
    }
  }, [title, post?.id, generateSlug, form]);

  // Auto-save removed - only save when button is clicked

  const handleRemoveCoverImage = useCallback(() => {
    setCoverImage("");
  }, []);

  const handleSelectFromLibrary = useCallback((image: { url: string }) => {
    setCoverImage(image.url);
    setShowMediaLibrary(false);
  }, []);

  const handleCreateCategory = useCallback(async () => {
    if (!newCategoryName.trim()) {
      alert('Please enter a category name');
      return;
    }

    setCreatingCategory(true);
    try {
      const newCategory = await categoryService.create({
        name: newCategoryName.trim(),
        description: newCategoryDescription.trim() || undefined,
      });
      
      // Refresh categories list
      await refetchCategories();
      
      // Auto-select the newly created category
      setSelectedCategoryIds(prev => [...prev, newCategory.id]);
      
      // Reset form and close dialog
      setNewCategoryName("");
      setNewCategoryDescription("");
      setShowCreateCategory(false);
    } catch (error) {
      console.error('Error creating category:', error);
      alert(error instanceof Error ? error.message : 'Failed to create category. It may already exist.');
    } finally {
      setCreatingCategory(false);
    }
  }, [newCategoryName, newCategoryDescription, refetchCategories]);

  const handleSaveClick = useCallback(async () => {
    const editor = editorRef.current;
    if (!editor) {
      console.error('Editor not available');
      return;
    }

    // TypeScript type narrowing: editor is now guaranteed to be Editor (not null)
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
      
      const metaTitle = form.getValues("metaTitle");
      const metaDescription = form.getValues("metaDescription");
      let slug = form.getValues("slug");
      
      // Validate categories - at least one required
      if (selectedCategoryIds.length === 0) {
        alert('Please select at least one category');
        return;
      }

      // Format slug: replace spaces with hyphens and clean up
      slug = slug ? formatSlug(slug) : '';
      
      // Generate slug if empty (slug is required for SEO-friendly URLs)
      const finalSlug = slug || generateSlug(title);
      if (!finalSlug) {
        alert('Please enter a slug or ensure the title is valid');
        return;
      }
      
      // Call onSave with current data including cover image, meta fields, categories, published status, and slug
      await onSave({ 
        title, 
        html, 
        json, 
        readingTime, 
        cover: coverImage || undefined,
        metaTitle: metaTitle || undefined,
        metaDescription: metaDescription || undefined,
        categoryIds: selectedCategoryIds,
        published: isPublished,
        slug: finalSlug || undefined,
      }, createNew);
    } catch (error) {
      console.error('Error in handleSaveClick:', error);
    }
  }, [form, onSave, post, coverImage, selectedCategoryIds, isPublished, generateSlug, formatSlug]);

  return (
    <div className="flex flex-col gap-6">
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

      {/* Slug Section */}
      <div>
        <label className="font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
          <div className="w-1 h-5 bg-indigo-500 rounded-full" />
          Slug (URL)
        </label>
        <Controller
          control={form.control}
          name="slug"
          render={({ field }) => (
            <input
              {...field}
              type="text"
              className="w-full px-4 py-2.5 shadow border border-[#d1d9e0] rounded-md bg-white dark:bg-[#0d1017] dark:text-white dark:border-[#3d444d] outline-none"
              placeholder="post-url-slug"
              disabled={!editable}
              onChange={(e) => {
                // Automatically format slug: replace spaces with hyphens
                const formatted = formatSlug(e.target.value);
                field.onChange(formatted);
              }}
            />
          )}
        />
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          URL-friendly version of the title. Auto-generated from title, but you can customize it. Spaces are automatically converted to hyphens. Used in post URLs (e.g., /posts/your-slug-here)
        </p>
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
            {editable && (
              <label className="flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  disabled={saveStatus === "saving" || !editable}
                  className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 disabled:opacity-50"
                />
                <span className="text-sm">Publish</span>
              </label>
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
                  : isPublished
                  ? (post?.id ? "Update & Publish" : "Create & Publish")
                  : (post?.id ? "Save Draft" : "Save as Draft")}
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
        </div>
      </div>

      {/* Meta Title Section */}
      <div>
        <label className="font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
          <div className="w-1 h-5 bg-indigo-500 rounded-full" />
          Meta Title
        </label>
        <Controller
          control={form.control}
          name="metaTitle"
          render={({ field }) => (
            <input
              {...field}
              type="text"
              className="w-full px-4 py-2.5 shadow border border-[#d1d9e0] rounded-md bg-white dark:bg-[#0d1017] dark:text-white dark:border-[#3d444d] outline-none"
              placeholder="Enter meta title for SEO (optional)..."
              disabled={!editable}
            />
          )}
        />
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          This will be used as the page title in search engines and browser tabs
        </p>
      </div>

      {/* Meta Description Section */}
      <div>
        <label className="font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
          <div className="w-1 h-5 bg-indigo-500 rounded-full" />
          Meta Description
        </label>
        <Controller
          control={form.control}
          name="metaDescription"
          render={({ field }) => (
            <textarea
              {...field}
              rows={3}
              className="w-full px-4 py-2.5 shadow border border-[#d1d9e0] rounded-md bg-white dark:bg-[#0d1017] dark:text-white dark:border-[#3d444d] outline-none resize-none"
              placeholder="Enter meta description for SEO (optional)..."
              disabled={!editable}
            />
          )}
        />
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          This will be used as the description in search engine results
        </p>
      </div>

      {/* Publish Status Section */}
      {editable && (
        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-1">
                <div className="w-1 h-5 bg-indigo-500 rounded-full" />
                Publication Status
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isPublished 
                  ? "This post will be published and visible to everyone"
                  : "This post will be saved as a draft (not visible to public)"}
              </p>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <span className={`text-sm font-medium ${isPublished ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'}`}>
                {isPublished ? 'Published' : 'Draft'}
              </span>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  disabled={saveStatus === "saving" || !editable}
                  className="sr-only"
                  id="publish-toggle"
                />
                <label
                  htmlFor="publish-toggle"
                  className={`flex items-center w-14 h-7 rounded-full transition-colors cursor-pointer ${
                    isPublished
                      ? 'bg-indigo-600'
                      : 'bg-slate-300 dark:bg-slate-600'
                  } ${saveStatus === "saving" || !editable ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span
                    className={`inline-block w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                      isPublished ? 'translate-x-8' : 'translate-x-1'
                    }`}
                  />
                </label>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* Categories Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <div className="w-1 h-5 bg-indigo-500 rounded-full" />
            Categories <span className="text-red-500">*</span>
          </label>
          {editable && (
            <button
              type="button"
              onClick={() => setShowCreateCategory(true)}
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
            >
              + Create New Category
            </button>
          )}
        </div>
        {categoriesLoading ? (
          <div className="text-sm text-slate-500 dark:text-slate-400">Loading categories...</div>
        ) : (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const isSelected = selectedCategoryIds.includes(category.id);
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => {
                      if (!editable) return;
                      if (isSelected) {
                        setSelectedCategoryIds(prev => prev.filter(id => id !== category.id));
                      } else {
                        setSelectedCategoryIds(prev => [...prev, category.id]);
                      }
                    }}
                    disabled={!editable}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      isSelected
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {category.name}
                  </button>
                );
              })}
            </div>
            {selectedCategoryIds.length === 0 && (
              <p className="text-xs text-red-500 dark:text-red-400">
                Please select at least one category (required for SEO)
              </p>
            )}
            {selectedCategoryIds.length > 0 && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {selectedCategoryIds.length} {selectedCategoryIds.length === 1 ? 'category' : 'categories'} selected
              </p>
            )}
          </div>
        )}
      </div>

      {/* Media Library Dialog */}
      <Dialog open={showMediaLibrary} onOpenChange={setShowMediaLibrary}>
        <MediaLibrary
          onClose={() => setShowMediaLibrary(false)}
          onInsert={handleSelectFromLibrary}
        />
      </Dialog>

      {/* Create Category Dialog */}
      <Dialog open={showCreateCategory} onOpenChange={setShowCreateCategory}>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
            Create New Category
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Category Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="e.g., Web Development"
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={creatingCategory}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !creatingCategory) {
                    handleCreateCategory();
                  }
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={newCategoryDescription}
                onChange={(e) => setNewCategoryDescription(e.target.value)}
                placeholder="Brief description of this category..."
                rows={3}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                disabled={creatingCategory}
              />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleCreateCategory}
                disabled={creatingCategory || !newCategoryName.trim()}
                className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creatingCategory ? 'Creating...' : 'Create Category'}
              </button>
              <button
                onClick={() => {
                  setShowCreateCategory(false);
                  setNewCategoryName("");
                  setNewCategoryDescription("");
                }}
                disabled={creatingCategory}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
