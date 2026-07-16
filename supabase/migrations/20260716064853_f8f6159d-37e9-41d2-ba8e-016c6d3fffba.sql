
CREATE TABLE public.legal_pages (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  lead TEXT,
  meta_title TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  content TEXT NOT NULL,
  published BOOLEAN NOT NULL DEFAULT true,
  version INT NOT NULL DEFAULT 1,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.legal_pages TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.legal_pages TO authenticated;
GRANT ALL ON public.legal_pages TO service_role;

ALTER TABLE public.legal_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published legal pages"
  ON public.legal_pages FOR SELECT
  USING (published = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage legal pages"
  ON public.legal_pages FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_legal_pages_updated_at
  BEFORE UPDATE ON public.legal_pages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.legal_page_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL REFERENCES public.legal_pages(slug) ON DELETE CASCADE,
  version INT NOT NULL,
  title TEXT NOT NULL,
  lead TEXT,
  meta_title TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  content TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (slug, version)
);

GRANT SELECT, INSERT ON public.legal_page_versions TO authenticated;
GRANT ALL ON public.legal_page_versions TO service_role;

ALTER TABLE public.legal_page_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read versions"
  ON public.legal_page_versions FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins create versions"
  ON public.legal_page_versions FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_legal_page_versions_slug ON public.legal_page_versions(slug, version DESC);

CREATE OR REPLACE FUNCTION public.snapshot_legal_page()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (OLD.content IS DISTINCT FROM NEW.content
      OR OLD.title IS DISTINCT FROM NEW.title
      OR OLD.meta_title IS DISTINCT FROM NEW.meta_title
      OR OLD.meta_description IS DISTINCT FROM NEW.meta_description
      OR OLD.lead IS DISTINCT FROM NEW.lead) THEN
    INSERT INTO public.legal_page_versions
      (slug, version, title, lead, meta_title, meta_description, content, created_by)
    VALUES
      (OLD.slug, OLD.version, OLD.title, OLD.lead, OLD.meta_title, OLD.meta_description, OLD.content, OLD.updated_by);
    NEW.version = OLD.version + 1;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_legal_pages_snapshot
  BEFORE UPDATE ON public.legal_pages
  FOR EACH ROW EXECUTE FUNCTION public.snapshot_legal_page();

INSERT INTO public.legal_pages (slug, title, lead, meta_title, meta_description, content) VALUES
(
  'privacy',
  'Privacy Policy',
  'How HalloweenTools.com collects, uses, and protects your information. Last updated November 2026.',
  'Privacy Policy — HalloweenTools',
  'How HalloweenTools.com collects, uses, and protects your data across our free tools, community, and AI features.',
$$<p>HalloweenTools.com ("we", "us", "our") operates halloweentools.com and provides free Halloween tools, AI generators, printables, community posts, and related content. This Privacy Policy explains what information we collect, how we use it, and the choices you have.</p>

<h2>Information We Collect</h2>
<p>We collect the minimum information needed to run the site, keep our tools working, and improve your experience.</p>

<h3>Personal Information</h3>
<p>When you create an account we collect your email address, chosen display name, handle, and (optionally) profile photo. If you sign in with a third-party provider such as Google, we receive basic profile details from that provider.</p>

<h3>Usage Data</h3>
<p>We collect standard technical information when you visit the site — pages viewed, referring URL, approximate location derived from IP, device type, browser, and timestamps.</p>

<h3>Cookies</h3>
<p>We use a small number of first-party and third-party cookies for essential functionality, analytics, and (where applicable) advertising. See our <a href="/cookies">Cookie Policy</a> for full details.</p>

<h3>Log Files</h3>
<p>Our servers automatically log IP addresses, user agents, and request paths for security, abuse prevention, and diagnostics. Logs are retained for a limited period and then rotated.</p>

<h2>Analytics</h2>
<p>We use privacy-respecting analytics to understand aggregate traffic patterns. Analytics data is aggregated and does not identify individual users.</p>

<h3>Google Analytics</h3>
<p>If Google Analytics is enabled, it may set cookies to measure page views and interactions. You can opt out using the Google Analytics browser add-on.</p>

<h2>Advertising</h2>
<p>Some pages may display advertisements from third-party ad networks.</p>

<h3>Google AdSense</h3>
<p>Google AdSense may serve ads on our site and use cookies to show ads based on prior visits. You can opt out of personalized advertising at <a href="https://adssettings.google.com" rel="nofollow noopener">Google Ads Settings</a>.</p>

<h3>Amazon Associates Disclosure</h3>
<p>HalloweenTools.com may participate in the Amazon Services LLC Associates Program, an affiliate advertising program. If you buy through certain product links we may earn a commission at no additional cost to you.</p>

<h2>Email Newsletter</h2>
<p>If you subscribe to our newsletter we store your email solely to send Halloween-related content and updates. You can unsubscribe from any email using the link in the footer.</p>

<h2>Contact Forms</h2>
<p>When you contact us we receive your name, email, and message. We use this information only to respond and, where applicable, to keep a record of the request.</p>

<h2>User Generated Content</h2>
<p>Anything you publish in our community — posts, images, captions, quotes, wishes, remixes — is public by design. Do not include personal information you do not want to share. See our <a href="/ugc-policy">User Generated Content Policy</a>.</p>

<h2>Community Posts</h2>
<p>Posts you publish are tied to your public creator profile (display name, handle, avatar) and remain visible until you delete them or we remove them under our policies.</p>

<h2>AI Generated Content</h2>
<p>Prompts you send to our AI tools are transmitted to AI providers to generate the response. We may retain prompts and outputs for abuse prevention, quality improvement, and moderation. See our <a href="/ai-content-policy">AI Content Policy</a>.</p>

<h2>Third Party Services</h2>
<p>We rely on third-party providers for hosting, authentication, email delivery, AI, analytics, and storage. Each provider processes data under its own privacy terms and only for the purposes we specify.</p>

<h2>Data Retention</h2>
<p>We retain personal information for as long as your account is active or as needed to provide the service. When you delete your account we remove or anonymize personal data, except where retention is required for legal or security reasons.</p>

<h2>User Rights</h2>
<p>You can access, correct, export, or delete your personal information at any time by contacting us via the <a href="/contact">contact page</a>. You may also withdraw consent for optional processing.</p>

<h2>Children's Privacy</h2>
<p>HalloweenTools.com is not directed to children under 13, and we do not knowingly collect personal information from children under 13. If you believe a child has provided information, contact us and we will remove it.</p>

<h2>Security</h2>
<p>We use industry-standard measures — encrypted connections, hashed credentials, access controls, and monitored infrastructure — to protect your information. No online service is 100% secure, so we cannot guarantee absolute security.</p>

<h2>International Users</h2>
<p>The site is operated from and stored on servers that may be located outside your country. By using the service you consent to the transfer of your information to those jurisdictions.</p>

<h2>California Privacy Rights (CCPA)</h2>
<p>California residents have the right to know what personal information we collect, to request deletion, to opt out of the "sale" of personal information (we do not sell it), and to be free from discrimination for exercising these rights. Submit requests via the <a href="/contact">contact page</a>.</p>

<h2>GDPR Information</h2>
<p>If you are in the European Economic Area or the UK, you have the right to access, rectify, erase, restrict, or port your personal data, and to object to processing. Our lawful bases are consent, legitimate interests, and contract performance. You may also lodge a complaint with your local supervisory authority.</p>

<h2>Changes to This Policy</h2>
<p>We may update this policy from time to time. Material changes will be announced on the site and the "last updated" date at the top will change. Continued use after an update constitutes acceptance.</p>

<h2>Contact</h2>
<p>Privacy questions? Reach us via the <a href="/contact">contact page</a> or email privacy@halloweentools.com.</p>$$
),
(
  'terms',
  'Terms and Conditions',
  'The rules that govern your use of HalloweenTools.com. Last updated November 2026.',
  'Terms and Conditions — HalloweenTools',
  'The terms that govern use of HalloweenTools.com — accounts, community content, AI tools, intellectual property, and more.',
$$<p>These Terms and Conditions ("Terms") govern your access to and use of HalloweenTools.com and all associated tools, features, and content ("Service"). By using the Service you agree to these Terms. If you disagree with any part, do not use the Service.</p>

<h2>Website Usage</h2>
<p>You may use HalloweenTools.com for personal and non-commercial purposes, and for commercial purposes where a specific tool page explicitly allows it. You are responsible for your use of the Service and for any content you submit.</p>

<h2>User Accounts</h2>
<p>Creating an account is optional but unlocks community publishing, saved items, and personalized features. You must provide accurate information, keep your credentials secure, and notify us of any unauthorized use. You are responsible for all activity under your account.</p>

<h2>Community Guidelines</h2>
<p>Community participation is governed by our <a href="/community-guidelines">Community Guidelines</a>. Violations may result in content removal, temporary suspension, or permanent account termination.</p>

<h2>User Generated Content</h2>
<p>You retain ownership of content you publish. By posting to the community you grant HalloweenTools.com a worldwide, non-exclusive, royalty-free license to host, display, distribute, and adapt that content within the Service and for promotion of the Service. See our <a href="/ugc-policy">UGC Policy</a>.</p>

<h2>AI Generated Content</h2>
<p>AI outputs generated through our tools are provided "as is". You are responsible for reviewing, editing, and confirming suitability before any public or commercial use. See our <a href="/ai-content-policy">AI Content Policy</a>.</p>

<h2>Intellectual Property</h2>
<p>The HalloweenTools.com brand, logo, code, design system, editorial content, and curated collections are owned by us and protected by intellectual property laws. Nothing in these Terms transfers those rights to you.</p>

<h2>Copyright</h2>
<p>Do not upload, post, or share content you do not own or have permission to use. We respond to valid copyright takedown notices under our <a href="/dmca">DMCA Policy</a>.</p>

<h2>DMCA</h2>
<p>If you believe your copyright has been infringed on HalloweenTools.com, submit a notice as described in our <a href="/dmca">DMCA Policy</a>.</p>

<h2>Acceptable Use</h2>
<p>You may not use the Service to engage in unlawful, harmful, deceptive, or abusive behavior. You may not attempt to disrupt the Service, bypass rate limits, scrape at scale, or reverse engineer our systems.</p>

<h2>Prohibited Activities</h2>
<p>Prohibited activities include but are not limited to: harassment, hate speech, sexual content involving minors, malware distribution, spam, phishing, impersonation, and any activity that violates applicable law.</p>

<h2>Account Suspension</h2>
<p>We may suspend accounts that violate these Terms, our Community Guidelines, or any policy referenced here. Serious or repeated violations may result in permanent termination without notice.</p>

<h2>Termination</h2>
<p>You may delete your account at any time. We may terminate or restrict access to the Service where we reasonably believe you have breached these Terms or applicable law.</p>

<h2>Payments</h2>
<p>The Service is currently free. If we introduce paid features in the future, additional terms will govern purchases and will be presented before any charge.</p>

<h2>Premium Features</h2>
<p>Premium features, if launched, may be offered on a subscription or one-time basis with clearly disclosed pricing, renewal terms, and cancellation options.</p>

<h2>Disclaimer of Warranties</h2>
<p>The Service is provided "as is" and "as available" without warranties of any kind, express or implied, including merchantability, fitness for a particular purpose, and non-infringement. See our <a href="/disclaimer">Disclaimer</a>.</p>

<h2>Limitation of Liability</h2>
<p>To the maximum extent permitted by law, HalloweenTools.com, its operators, and its contributors are not liable for indirect, incidental, special, consequential, or exemplary damages arising from your use of the Service.</p>

<h2>External Links</h2>
<p>The Service may link to external websites we do not control. We are not responsible for the content, policies, or practices of third-party sites.</p>

<h2>Third Party Services</h2>
<p>The Service integrates with third-party providers (AI, hosting, analytics, email). Your use of features that involve these providers is also subject to their terms.</p>

<h2>Changes</h2>
<p>We may update these Terms from time to time. Continued use of the Service after changes take effect constitutes acceptance of the revised Terms.</p>

<h2>Contact</h2>
<p>Questions about these Terms? Reach us via our <a href="/contact">contact page</a>.</p>$$
),
(
  'disclaimer',
  'Disclaimer',
  'Important information about the content and tools offered on HalloweenTools.com.',
  'Disclaimer — HalloweenTools',
  'General disclaimer for HalloweenTools.com content, AI outputs, community posts, affiliate links, and third-party ads.',
$$<h2>General Disclaimer</h2>
<p>HalloweenTools.com provides content, tools, and community features for entertainment and informational purposes only. We make no warranty as to the accuracy, completeness, or suitability of any information or output on the site.</p>

<h2>AI Generated Content Disclaimer</h2>
<p>Our AI tools generate text and images algorithmically. Outputs may contain factual errors, biased phrasing, or content that does not match your intent. Always review AI-generated content before publishing, sharing, or using it commercially.</p>

<h2>Entertainment Purposes</h2>
<p>Halloween wishes, quotes, story generators, costume ideas, and similar tools are intended for fun and creativity. They are not statements of fact.</p>

<h2>Accuracy Disclaimer</h2>
<p>We strive to keep information current, but we cannot guarantee that every page, template, printable, or generated output reflects the latest information, safety guidance, or best practice.</p>

<h2>No Legal Advice</h2>
<p>Nothing on HalloweenTools.com constitutes legal advice. Consult a qualified attorney for advice specific to your situation.</p>

<h2>No Medical Advice</h2>
<p>Content related to face paint, costume materials, allergens, or party food is informational only. It is not a substitute for professional medical guidance.</p>

<h2>No Professional Advice</h2>
<p>Party planning, event safety, decoration, and DIY project guidance is general in nature. Consult qualified professionals for specialized situations.</p>

<h2>No Guarantees</h2>
<p>We do not guarantee uninterrupted access to the Service, error-free tools, or specific results from any generator, template, or feature.</p>

<h2>Affiliate Disclaimer</h2>
<p>Some outbound product links on HalloweenTools.com may be affiliate links. If you purchase through such a link we may earn a small commission at no additional cost to you. Affiliate relationships never influence editorial recommendations.</p>

<h2>Advertising Disclaimer</h2>
<p>Third-party ads may appear on the site. Advertisements are served by external networks and do not represent endorsement by HalloweenTools.com.</p>

<h2>Community Content Disclaimer</h2>
<p>Community posts are created by users and represent their views, not those of HalloweenTools.com. We moderate reported content but do not pre-screen every submission.</p>$$
),
(
  'cookies',
  'Cookie Policy',
  'What cookies HalloweenTools.com uses and how you can manage them.',
  'Cookie Policy — HalloweenTools',
  'How HalloweenTools.com uses essential, analytics, and advertising cookies, and how you can manage them.',
$$<p>Cookies are small text files stored by your browser. HalloweenTools.com uses cookies to run the site, understand usage, and (where applicable) support advertising. This page explains what each type does.</p>

<h2>Essential Cookies</h2>
<p>Required for the Service to function — for example remembering your theme choice, keeping you signed in, and protecting form submissions from abuse. Essential cookies cannot be turned off from within the site.</p>

<h2>Analytics Cookies</h2>
<p>Help us understand aggregate traffic — which tools are used, which pages load slowly, where visitors come from. Analytics data is aggregated and does not identify individual users.</p>

<h2>Marketing Cookies</h2>
<p>If advertising is enabled on a given page, marketing cookies may be used by ad networks to measure ad performance and, in some cases, to personalize the ads shown to you.</p>

<h2>Third Party Cookies</h2>
<p>Some cookies are set by third-party services we integrate — analytics, embedded video, social share widgets, and ad networks. Each provider follows its own cookie policy.</p>

<h2>Google Cookies</h2>
<p>Google services (Analytics, AdSense) may set cookies for measurement and, where enabled, advertising. You can opt out of personalized advertising at <a href="https://adssettings.google.com" rel="nofollow noopener">Google Ads Settings</a>.</p>

<h2>User Preferences</h2>
<p>Cookies also remember preferences such as dark mode, saved items, and dismissed banners so you don''t have to reconfigure them on every visit.</p>

<h2>Managing Cookies</h2>
<p>You can clear existing cookies and block new ones from your browser settings. Some features (such as staying signed in or saving items) will stop working without essential cookies.</p>

<h2>Browser Settings</h2>
<p>Instructions for managing cookies are available in the help pages of Chrome, Firefox, Safari, and Edge. On mobile, cookie controls live within your device''s browser settings.</p>

<h2>Consent</h2>
<p>By using HalloweenTools.com you consent to the use of cookies as described here. Where required by law, we display a consent banner asking for your permission before setting non-essential cookies.</p>$$
),
(
  'dmca',
  'DMCA Policy',
  'How to report copyright infringement on HalloweenTools.com.',
  'DMCA Policy — HalloweenTools',
  'How to submit a DMCA takedown notice or counter-notice to HalloweenTools.com under the Digital Millennium Copyright Act.',
$$<h2>Copyright Protection</h2>
<p>HalloweenTools.com respects intellectual property rights and expects users to do the same. We respond to properly submitted takedown notices under the Digital Millennium Copyright Act ("DMCA") and equivalent laws.</p>

<h2>Reporting Copyright Infringement</h2>
<p>If you believe content on HalloweenTools.com infringes your copyright, send a DMCA notice to <strong>dmca@halloweentools.com</strong>.</p>

<h2>Submitting a DMCA Notice</h2>
<p>A valid notice must include:</p>
<ul>
<li>Your physical or electronic signature.</li>
<li>Identification of the copyrighted work you claim has been infringed.</li>
<li>The URL(s) of the specific material on our site that you believe is infringing.</li>
<li>Your name, address, phone number, and email.</li>
<li>A statement that you have a good faith belief that the use is not authorized by the copyright owner, its agent, or the law.</li>
<li>A statement, under penalty of perjury, that the information in the notice is accurate and that you are the copyright owner or authorized to act on behalf of the owner.</li>
</ul>

<h2>Counter Notice</h2>
<p>If content you posted was removed and you believe the removal was mistaken, you may submit a counter-notice containing your contact information, the material that was removed, the URL where it appeared, a statement under penalty of perjury that you have a good faith belief the removal was in error, and your consent to jurisdiction in a US federal court.</p>

<h2>Repeat Infringer Policy</h2>
<p>Accounts that repeatedly infringe intellectual property rights will be terminated. We keep records of DMCA notices and act promptly on repeat infringement.</p>

<h2>Contact</h2>
<p>DMCA notices and counter-notices: <strong>dmca@halloweentools.com</strong>. General copyright questions: <a href="/contact">contact page</a>.</p>$$
),
(
  'community-guidelines',
  'Community Guidelines',
  'The behavior we expect from everyone in the HalloweenTools.com community.',
  'Community Guidelines — HalloweenTools',
  'Community rules for HalloweenTools.com — respectful behavior, spam, harassment, adult content, and reporting.',
$$<p>The HalloweenTools.com community is a place for Halloween creators to share cards, invitations, posters, wallpapers, captions, quotes, wishes, stories, images, and ideas. These guidelines exist so that everyone can participate safely.</p>

<h2>Respectful Behavior</h2>
<p>Treat other creators with respect. Constructive feedback is welcome; personal attacks are not.</p>

<h2>No Spam</h2>
<p>Do not post repetitive content, off-topic promotion, referral bait, or automated submissions. Rate limits and duplicate detection are in place, and violating them will cause posts to be rejected or hidden.</p>

<h2>No Harassment</h2>
<p>Do not target individuals with abuse, threats, doxxing, sustained negative attention, or coordinated pile-ons.</p>

<h2>No Adult Content</h2>
<p>HalloweenTools.com is a family-friendly Halloween site. Sexual, sexually suggestive, or explicit content is not allowed anywhere in the community.</p>

<h2>No Graphic Violence</h2>
<p>Spooky and creepy Halloween themes are welcome. Gore, real-world violence, self-harm content, and shock imagery are not.</p>

<h2>No Hate Speech</h2>
<p>Content that attacks people based on race, ethnicity, national origin, religion, disability, gender, sexual orientation, or similar characteristics is prohibited.</p>

<h2>No Illegal Content</h2>
<p>Do not post content that is illegal where you live or where our service operates.</p>

<h2>Respect Copyright</h2>
<p>Only publish work you created or have permission to use. Attribution is required when a tool page or template calls for it. See our <a href="/dmca">DMCA Policy</a>.</p>

<h2>No Fake or Misleading Content</h2>
<p>Do not misrepresent AI-generated content as another person''s work, impersonate real people, or use community features to spread false information.</p>

<h2>Reporting Users and Posts</h2>
<p>Every community post has a Report button. Reports are reviewed by moderators; posts flagged multiple times are auto-hidden pending review.</p>

<h2>Moderation</h2>
<p>We combine automatic moderation (AI content review, duplicate/spam detection, rate limits) with human review. Moderation decisions aim to protect the community, not to police creativity.</p>

<h2>Account Actions</h2>
<p>Consequences scale with severity: content removal, temporary posting restrictions, temporary suspension, and — for serious or repeated violations — permanent account termination.</p>$$
),
(
  'ai-content-policy',
  'AI Content Policy',
  'How AI works on HalloweenTools.com and what we expect from users.',
  'AI Content Policy — HalloweenTools',
  'How AI-generated content works on HalloweenTools.com, user responsibilities, limitations, and acceptable use.',
$$<h2>How AI Content Is Generated</h2>
<p>Our AI tools send your prompt to a large language model or image model, then return the model''s response. We use a fallback chain across multiple AI providers to keep the tools running.</p>

<h2>User Responsibility</h2>
<p>You are responsible for the prompts you submit and for the outputs you publish, share, or use commercially. Do not prompt for content that violates our <a href="/community-guidelines">Community Guidelines</a> or applicable law.</p>

<h2>Limitations</h2>
<p>AI models can produce plausible-sounding but incorrect information, biased phrasing, or images with anatomical or textual glitches. Outputs are a starting point, not a finished deliverable.</p>

<h2>Accuracy</h2>
<p>Do not rely on AI outputs for factual claims, safety guidance, medical, legal, or professional advice. Verify anything important against authoritative sources.</p>

<h2>Review Before Publishing</h2>
<p>Read and edit AI outputs before publishing them to the community or using them publicly. You are the author of the final version.</p>

<h2>Acceptable Use</h2>
<p>Do not use AI tools to generate sexual content, sexual content involving minors, targeted harassment, hate speech, disinformation, deceptive impersonation, or content that infringes third-party rights.</p>

<h2>Ownership</h2>
<p>Subject to the model provider''s terms and applicable law, outputs you generate through our tools are yours to use. HalloweenTools.com does not claim ownership over AI outputs you generate for personal use.</p>

<h2>AI Generated Images</h2>
<p>Images produced by our AI image tools may include a subtle "AI generated" indicator in metadata. When sharing AI images publicly, label them as AI-generated where the context calls for it.</p>

<h2>AI Generated Text</h2>
<p>Captions, quotes, wishes, stories, and other text outputs are computer-generated. Human editing is recommended before publishing to the community or using in commercial materials.</p>$$
),
(
  'ugc-policy',
  'User Generated Content Policy',
  'What you can publish to the HalloweenTools.com community, and how it is licensed.',
  'User Generated Content Policy — HalloweenTools',
  'Rules for publishing community content on HalloweenTools.com — ownership, licensing, moderation, and removal.',
$$<h2>Publishing Rules</h2>
<p>Community publishing is available to signed-in accounts in good standing. Every submission passes through automatic moderation, duplicate detection, spam heuristics, and rate limits.</p>

<h2>Ownership</h2>
<p>You retain full ownership of content you publish. HalloweenTools.com does not claim your work as its own.</p>

<h2>Licensing</h2>
<p>By publishing to the community you grant HalloweenTools.com a worldwide, non-exclusive, royalty-free license to host, display, distribute, adapt (for example generating thumbnails or previews), and use your submission to operate and promote the Service. The license ends when you delete the content, except for cached copies already served.</p>

<h2>Public Visibility</h2>
<p>Community posts are public. Each post has its own URL, appears in listings and search results, and can be shared externally. Do not include personal information you do not want to share.</p>

<h2>Moderation</h2>
<p>We use a combination of automatic moderation (AI review, duplicate hashing, spam heuristics, rate limits) and human review. Posts may be hidden, unpublished, or removed for violating our <a href="/community-guidelines">Community Guidelines</a>.</p>

<h2>Reporting</h2>
<p>Every post has a Report button. Reports are reviewed by moderators; posts flagged multiple times are auto-hidden pending review.</p>

<h2>Removal Requests</h2>
<p>You may delete your own posts at any time from your creator profile. If you cannot access your account, contact us via the <a href="/contact">contact page</a>.</p>

<h2>Copyright</h2>
<p>Only publish work you created or have the right to publish. Copyright infringement is handled under our <a href="/dmca">DMCA Policy</a>.</p>

<h2>Privacy</h2>
<p>Do not publish personal information about other people without their consent. Do not use community features to identify, locate, or harass private individuals.</p>

<h2>Content Retention</h2>
<p>Published posts remain online until you delete them, we remove them under our policies, or your account is closed. Backups and logs may retain traces for a limited period after deletion.</p>$$
),
(
  'accessibility',
  'Accessibility Statement',
  'Our commitment to making HalloweenTools.com usable by everyone.',
  'Accessibility Statement — HalloweenTools',
  'How HalloweenTools.com works with screen readers, keyboards, and assistive technologies, and how to report issues.',
$$<h2>Accessibility Goals</h2>
<p>HalloweenTools.com aims to conform to WCAG 2.1 Level AA across our tools, articles, and community features. Accessibility work is ongoing, and we treat accessibility bugs as first-class issues.</p>

<h2>Screen Reader Support</h2>
<p>Pages use semantic HTML — headings, landmarks, lists, and labels — so screen readers can navigate content in a meaningful order. Images include alt text where they convey information.</p>

<h2>Keyboard Navigation</h2>
<p>All interactive elements — links, buttons, form fields, dialogs — are reachable and operable with a keyboard. Visible focus indicators are preserved.</p>

<h2>Contrast</h2>
<p>Text meets WCAG AA contrast ratios against its background. The dark Halloween palette is tuned so headings, body text, and interactive controls remain readable.</p>

<h2>Responsive Design</h2>
<p>The site adapts to mobile, tablet, and desktop viewports, and supports browser zoom up to 200% without loss of content or functionality.</p>

<h2>Reporting Accessibility Issues</h2>
<p>Found something that does not work with your assistive technology? Email <strong>accessibility@halloweentools.com</strong> or reach us via the <a href="/contact">contact page</a>. Include the page URL, the assistive tech you are using, and a short description. We take accessibility reports seriously and respond within a reasonable time.</p>$$
),
(
  'contact',
  'Contact HalloweenTools',
  'Get in touch with the HalloweenTools team.',
  'Contact — HalloweenTools',
  'Contact HalloweenTools for support, business inquiries, copyright, DMCA, and privacy requests.',
$$<p>We read everything. Use the address that matches your request so we can route it to the right person.</p>

<h2>General &amp; Support</h2>
<p>Questions about tools, bug reports, feature requests: <strong>hello@halloweentools.com</strong></p>

<h2>Business Inquiries</h2>
<p>Partnerships, sponsorships, editorial collaborations: <strong>business@halloweentools.com</strong></p>

<h2>Copyright Requests</h2>
<p>Attribution questions, licensing, permissions: <strong>copyright@halloweentools.com</strong></p>

<h2>DMCA Requests</h2>
<p>Formal DMCA takedown notices and counter-notices: <strong>dmca@halloweentools.com</strong>. See our <a href="/dmca">DMCA Policy</a> for the required contents.</p>

<h2>Privacy Requests</h2>
<p>Data access, correction, deletion, CCPA and GDPR requests: <strong>privacy@halloweentools.com</strong>. See our <a href="/privacy">Privacy Policy</a> for your rights.</p>

<h2>Accessibility</h2>
<p>Report accessibility issues: <strong>accessibility@halloweentools.com</strong>.</p>

<h2>Response Time</h2>
<p>We aim to reply within two business days. Formal legal requests are handled in the order received.</p>$$
),
(
  'about',
  'About HalloweenTools',
  'The internet''s biggest Halloween toolkit — built by Halloween people, for Halloween people.',
  'About HalloweenTools — The Internet''s Biggest Halloween Toolkit',
  'HalloweenTools.com is a free Halloween toolkit — interactive tools, AI generators, printables, and a creator community.',
$$<h2>Our Mission</h2>
<p>Halloween should be creative, playful, and accessible to everyone. HalloweenTools.com exists to give makers, parents, teachers, party hosts, and creators a single home for every Halloween idea — free forever, fast to use, and safe by default.</p>

<h2>Our Vision</h2>
<p>We want HalloweenTools.com to be the most useful Halloween resource on the internet — the first place people open in October, and the place they return to every year. That means great tools, great content, and a community of creators who make each other better.</p>

<h2>Why HalloweenTools.com Exists</h2>
<p>Halloween content online is scattered across dozens of blogs, generators, and printable sites — most of them slow, ad-heavy, or paywalled. We built HalloweenTools.com to fix that. Every tool loads fast, every printable is free, and every AI feature is one click away.</p>

<h2>What Makes It Different</h2>

<h3>Free Tools</h3>
<p>Every core tool — wish generators, quote makers, costume idea finders, pumpkin templates, party planners, banner and poster builders — is free to use. No sign-up wall for basic features.</p>

<h3>Community</h3>
<p>Creators can publish their Halloween cards, invitations, posters, banners, wallpapers, captions, quotes, wishes, pumpkin designs, costume ideas, party ideas, AI stories, and AI images to the community. Every post gets its own URL, its own SEO-friendly page, and a creator profile.</p>

<h3>AI Features</h3>
<p>Our AI generators use a fallback chain across multiple providers, so the tools keep working even when one provider is rate-limited. Prompts are moderated automatically, and every output can be edited before publishing.</p>

<h3>Safety</h3>
<p>Community submissions run through automatic content moderation, duplicate detection, and spam heuristics. Users can report anything with one click, and repeated reports auto-hide a post pending review.</p>

<h3>Privacy</h3>
<p>We collect the minimum amount of data needed to run the service. We do not sell personal information. Our <a href="/privacy">Privacy Policy</a> and <a href="/cookies">Cookie Policy</a> lay out exactly what we collect and why.</p>

<h2>Get Involved</h2>
<p>Sign in to publish to the community, save your favorite tools, and follow other creators. Have feedback or a tool idea? Reach us via our <a href="/contact">contact page</a>.</p>$$
);
