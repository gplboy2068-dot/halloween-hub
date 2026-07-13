import type { ComponentType } from "react";
import {
  NameGenerator,
  CaptionGenerator,
  QuoteGenerator,
  WishGenerator,
  MessageGenerator,
  HashtagGenerator,
  AIPromptGenerator,
  PartyNameGenerator,
  CostumeGenerator,
  ScaryStoryGenerator,
} from "./text-generators";
import {
  PumpkinFaceGenerator,
  PumpkinTemplateGenerator,
  PumpkinCarvingGenerator,
  MemeGenerator,
  PartyPlanner,
} from "./interactive";

export const TOOL_REGISTRY: Record<string, ComponentType> = {
  "name-generator": NameGenerator,
  "caption-generator": CaptionGenerator,
  "quote-generator": QuoteGenerator,
  "wish-generator": WishGenerator,
  "message-generator": MessageGenerator,
  "hashtag-generator": HashtagGenerator,
  "ai-prompt-generator": AIPromptGenerator,
  "party-name-generator": PartyNameGenerator,
  "costume-generator": CostumeGenerator,
  "scary-story-generator": ScaryStoryGenerator,
  "pumpkin-face-generator": PumpkinFaceGenerator,
  "pumpkin-template-generator": PumpkinTemplateGenerator,
  "pumpkin-carving-generator": PumpkinCarvingGenerator,
  "meme-generator": MemeGenerator,
  "party-planner": PartyPlanner,
};

export function getToolComponent(slug: string): ComponentType | null {
  return TOOL_REGISTRY[slug] ?? null;
}
