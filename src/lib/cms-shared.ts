/**
 * Client-safe CMS shared types and entity definitions.
 * DO NOT import server-only modules here.
 */

export const ENTITY_KINDS = [
  "tools",
  "articles",
  "categories",
  "tags",
  "faqs",
  "redirects",
  "newsletter_subscribers",
] as const;
export type EntityKind = (typeof ENTITY_KINDS)[number];

export type Status = "draft" | "scheduled" | "published" | "archived";

export type BaseEntity = {
  id: string;
  status: Status;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
  scheduledFor?: string | null;
  author?: string;
};

export type ToolEntity = BaseEntity & {
  slug: string;
  title: string;
  description: string;
  emoji: string;
  category: string; // resolved name
  categoryId?: string | null;
  featured: boolean;
  popular: boolean;
  isNew: boolean;
  seoTitle?: string;
  seoDescription?: string;
};

export type ArticleEntity = BaseEntity & {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string | null;
  category: string;
  categoryId?: string | null;
  readingTime: number;
  tags: string[];
};

export type CategoryEntity = BaseEntity & {
  slug: string;
  name: string;
  emoji: string;
  description: string;
};

export type TagEntity = BaseEntity & {
  slug: string;
  name: string;
  description?: string;
  count: number;
};

export type FaqEntity = BaseEntity & {
  question: string;
  answer: string;
  category: string;
  categoryId?: string | null;
};

export type RedirectEntity = BaseEntity & {
  from: string;
  to: string;
  code: number;
};

export type NewsletterSubscriberEntity = BaseEntity & {
  email: string;
  source: string;
  confirmed: boolean;
};

export type AnyEntity =
  | ToolEntity
  | ArticleEntity
  | CategoryEntity
  | TagEntity
  | FaqEntity
  | RedirectEntity
  | NewsletterSubscriberEntity;
