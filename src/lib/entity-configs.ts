import type { Field } from "@/components/admin/EntityForm";
import { CATEGORIES } from "@/lib/site";

const catOptions = CATEGORIES.map((c) => ({ value: c.name, label: c.name }));

export type EntityConfig = {
  name: string;
  singular: string;
  columns: { key: string; label: string; className?: string }[];
  fields: Field[];
  primaryKey: string;
};

export const ENTITY_CONFIGS: Record<string, EntityConfig> = {
  tools: {
    name: "tools",
    singular: "tool",
    primaryKey: "title",
    columns: [
      { key: "title", label: "Tool" },
      { key: "category", label: "Category" },
      { key: "slug", label: "Slug" },
    ],
    fields: [
      { key: "title", label: "Title", type: "text", required: true },
      { key: "slug", label: "Slug", type: "slug", required: true, help: "URL segment, e.g. halloween-card-maker" },
      { key: "emoji", label: "Emoji", type: "text", placeholder: "🎃" },
      { key: "description", label: "Short description", type: "textarea", required: true },
      { key: "category", label: "Category", type: "select", options: catOptions, required: true },
      { key: "featured", label: "Featured", type: "checkbox", placeholder: "Show on homepage" },
      { key: "popular", label: "Popular", type: "checkbox", placeholder: "Mark as trending" },
      { key: "isNew", label: "New", type: "checkbox", placeholder: "Show 'New' badge" },
      { key: "seoTitle", label: "SEO title", type: "text" },
      { key: "seoDescription", label: "SEO description", type: "textarea" },
    ],
  },
  articles: {
    name: "articles",
    singular: "article",
    primaryKey: "title",
    columns: [
      { key: "title", label: "Article" },
      { key: "category", label: "Category" },
      { key: "readingTime", label: "Read (min)" },
    ],
    fields: [
      { key: "title", label: "Title", type: "text", required: true },
      { key: "slug", label: "Slug", type: "slug", required: true },
      { key: "excerpt", label: "Excerpt", type: "textarea", required: true },
      { key: "content", label: "Content (Markdown)", type: "textarea" },
      { key: "category", label: "Category", type: "text" },
      { key: "readingTime", label: "Reading time (min)", type: "number" },
    ],
  },
  categories: {
    name: "categories",
    singular: "category",
    primaryKey: "name",
    columns: [
      { key: "name", label: "Category" },
      { key: "slug", label: "Slug" },
      { key: "emoji", label: "Emoji" },
    ],
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      { key: "slug", label: "Slug", type: "slug", required: true },
      { key: "emoji", label: "Emoji", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
    ],
  },
  tags: {
    name: "tags",
    singular: "tag",
    primaryKey: "name",
    columns: [
      { key: "name", label: "Tag" },
      { key: "slug", label: "Slug" },
      { key: "count", label: "Uses" },
    ],
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      { key: "slug", label: "Slug", type: "slug", required: true },
    ],
  },
  faqs: {
    name: "faqs",
    singular: "FAQ",
    primaryKey: "question",
    columns: [
      { key: "question", label: "Question" },
      { key: "category", label: "Category" },
    ],
    fields: [
      { key: "question", label: "Question", type: "text", required: true },
      { key: "answer", label: "Answer", type: "textarea", required: true },
      { key: "category", label: "Category", type: "text" },
    ],
  },
  redirects: {
    name: "redirects",
    singular: "redirect",
    primaryKey: "from",
    columns: [
      { key: "from", label: "From" },
      { key: "to", label: "To" },
      { key: "code", label: "Code" },
    ],
    fields: [
      { key: "from", label: "From path", type: "text", required: true, placeholder: "/old-url" },
      { key: "to", label: "To path", type: "text", required: true, placeholder: "/new-url" },
      { key: "code", label: "HTTP code", type: "select", options: [{ value: "301", label: "301 (Permanent)" }, { value: "302", label: "302 (Temporary)" }] },
    ],
  },
  users: {
    name: "users",
    singular: "user",
    primaryKey: "name",
    columns: [
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "role", label: "Role" },
    ],
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      { key: "email", label: "Email", type: "text", required: true },
      { key: "role", label: "Role", type: "select", options: [
        { value: "admin", label: "Admin" },
        { value: "editor", label: "Editor" },
        { value: "viewer", label: "Viewer" },
      ], required: true },
    ],
  },
};
