/**
 * AI crawlers and AI-training tokens named in robots.txt (SEO-SPEC §6). Arthur wants
 * the site readable by AI answer engines, so each is allowed explicitly; the named
 * group carries the same private paths as `*`, because a crawler that finds its own
 * group in robots.txt obeys that group alone and ignores the `*` rules.
 * Add a new agent here, never in src/app/robots.ts.
 */
export const AI_CRAWLERS = [
  // OpenAI: ChatGPT search results, user-triggered visits, model training.
  'OAI-SearchBot',
  'ChatGPT-User',
  'GPTBot',
  // Anthropic: Claude search results, user-triggered visits, model training.
  'Claude-SearchBot',
  'Claude-User',
  'ClaudeBot',
  // Perplexity: answer-engine index and user-triggered visits.
  'PerplexityBot',
  'Perplexity-User',
  // Google Gemini and AI training (a robots token; Google Search crawls as Googlebot).
  'Google-Extended',
  // Apple Intelligence training (a robots token; Apple search crawls as Applebot).
  'Applebot-Extended',
  // Microsoft Copilot answers come from Bing's index (bingbot, covered by `*`).
  // DuckDuckGo's AI answers, Meta AI, Amazon (Alexa, Rufus), Mistral's Le Chat.
  'DuckAssistBot',
  'Meta-ExternalAgent',
  'Meta-ExternalFetcher',
  'Amazonbot',
  'MistralAI-User',
  // Common Crawl, the open corpus most AI models are trained on.
  'CCBot',
] as const;
