import type { ComponentType } from "react";
import { PartyPlanner, MemeGenerator, PumpkinFaceGenerator } from "./interactive";
import {
  AICostumeGenerator,
  AIScaryStoryGenerator,
  AICaptionGenerator,
  AIMessageGenerator,
  AIWishGenerator,
  AIQuoteGenerator,
  AIPromptGenerator,
  AIHashtagGenerator,
  AIPartyNameGenerator,
  AIPumpkinCarvingGenerator,
  AIWallpaperGenerator,
  AIStickerGenerator,
  AIProfilePictureGenerator,
  AIAvatarGenerator,
  AIColoringPagesGenerator,
  AIMemeImageGenerator,
  AILogoMaker,
  AIPosterMaker,
  AICardMaker,
  AIInvitationMaker,
  AIBannerMaker,
  AIFlyerMaker,
  AIPumpkinTemplateAI,
} from "./ai-tools";
import { NameGenerator } from "./text-generators";
import {
  PrintableBanner, PrintableCupcakeTopper, PrintableGiftTag,
  PrintableLabel, PrintableTreatBag, PrintablePartySign,
  PrintableCandyBarWrapper, PrintableEnvelopeLiner, PrintableTicket, PrintableAwardCertificate,
  PrintableBingoCard, PrintableCountdownCalendar, PrintableTrickOrTreatSign,
  PrintablePumpkinGuess, PrintableScavengerHunt,
} from "@/printables/tools";

export const TOOL_REGISTRY: Record<string, ComponentType> = {
  // AI-powered text tools
  "costume-generator": AICostumeGenerator,
  "scary-story-generator": AIScaryStoryGenerator,
  "caption-generator": AICaptionGenerator,
  "message-generator": AIMessageGenerator,
  "wish-generator": AIWishGenerator,
  "quote-generator": AIQuoteGenerator,
  "ai-prompt-generator": AIPromptGenerator,
  "hashtag-generator": AIHashtagGenerator,
  "party-name-generator": AIPartyNameGenerator,

  // Client-side (no API cost)
  "name-generator": NameGenerator,
  "party-planner": PartyPlanner,

  // AI image tools
  "pumpkin-carving-generator": AIPumpkinCarvingGenerator,
  "pumpkin-template-generator": AIPumpkinTemplateAI,
  "pumpkin-face-generator": PumpkinFaceGenerator, // interactive SVG editor kept
  "wallpaper-generator": AIWallpaperGenerator,
  "sticker-generator": AIStickerGenerator,
  "profile-picture-generator": AIProfilePictureGenerator,
  "avatar-generator": AIAvatarGenerator,
  "coloring-pages-generator": AIColoringPagesGenerator,
  "meme-generator": MemeGenerator, // canvas editor kept
  "ai-meme-image-generator": AIMemeImageGenerator,
  "logo-maker": AILogoMaker,
  "poster-maker": AIPosterMaker,
  "halloween-card-maker": AICardMaker,
  "invitation-maker": AIInvitationMaker,
  "banner-maker": AIBannerMaker,
  "flyer-maker": AIFlyerMaker,

  // Printable design tools
  "printable-banner-generator": PrintableBanner,
  "cupcake-topper-generator": PrintableCupcakeTopper,
  "gift-tag-generator": PrintableGiftTag,
  "label-generator": PrintableLabel,
  "treat-bag-generator": PrintableTreatBag,
  "party-sign-generator": PrintablePartySign,
  "candy-bar-wrapper-generator": PrintableCandyBarWrapper,
  "envelope-liner-generator": PrintableEnvelopeLiner,
  "halloween-ticket-generator": PrintableTicket,
  "award-certificate-generator": PrintableAwardCertificate,
};

export function getToolComponent(slug: string): ComponentType | null {
  return TOOL_REGISTRY[slug] ?? null;
}
