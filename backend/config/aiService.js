import fetch from 'node-fetch';

const GENRE_PROMPTS = {
  epic: 'an epic high-fantasy tale with grand battles, legendary heroes, and ancient magic',
  dark: 'a dark fantasy story with grim atmosphere, morally complex characters, and ominous threats',
  whimsical: 'a whimsical fairy-tale adventure with talking animals, magical quirks, and wonder',
  mythological: 'a myth inspired by ancient gods, prophecies, and the clash of divine powers',
  steampunk: 'a steampunk fantasy world of clockwork dragons, airships, and arcane technology',
  cosmic: 'a cosmic horror fantasy where mortals glimpse incomprehensible eldritch truths',
  romance: 'a romantic fantasy with fated lovers, enchanted realms, and heartfelt emotion',
  adventure: 'a classic adventure quest with brave companions, hidden dungeons, and lost treasures',
  necromance: 'a dark fantasy story involving necromancy, forbidden magic, and the consequences of raising the dead',
};

const LENGTH_TOKENS = {
  short: { max: 600, words: '450–550 words', chars: '2,000–2,600 characters' },
  medium: { max: 800, words: '600–900 words', chars: '4,000–5,200 characters' },
  long: { max: 1400, words: '1200–1500 words', chars: '6,400–8,200 characters' },
};

function buildSystemPrompt() {
  return `You are FantasyForge, a master storyteller specializing in imaginative fantasy fiction. 
Your stories are rich in atmosphere, vivid imagery, and memorable characters. 
You write in a literary style with strong narrative arcs, compelling dialogue, and world-building details.
Always give the story a satisfying structure: opening, rising tension, climax, and resolution.
Write a complete story and do not stop mid-way. When possible, deliver a full narrative within the requested length.
Return only the title and story in the exact format shown below, with no other commentary.

TITLE: <title>

STORY: <story>`;
}

function buildUserPrompt(params) {
  const { prompt, genre, tone, length, characters, setting } = params;
  const genreDesc = GENRE_PROMPTS[genre] || GENRE_PROMPTS.epic;
  const lengthDesc = LENGTH_TOKENS[length]?.words || '600–900 words';
  const charDesc = LENGTH_TOKENS[length]?.chars || '4,000–5,200 characters';

  let characterPart = '';
  if (characters && characters.length > 0) {
    characterPart = `\nFeatured characters: ${characters.join(', ')}.`;
  }

  let settingPart = '';
  if (setting && setting.trim()) {
    settingPart = `\nSetting: ${setting}.`;
  }

  return `Write ${genreDesc} with a ${tone} tone. The story should be approximately ${lengthDesc} long and around ${charDesc} in length.
${characterPart}${settingPart}

Story premise: ${prompt}

Return the result exactly in the format below.

TITLE: <title>

STORY: <story>`;
}

function parseGeneratedStory(text, fallbackTitle) {
  const normalized = text.replace(/\r/g, '').trim();

  const compactMatch = normalized.match(/^TITLE:\s*(.+?)STORY:\s*([\s\S]+)$/im);
  if (compactMatch) {
    const title = compactMatch[1].trim().replace(/\s+/g, ' ').slice(0, 120);
    const content = compactMatch[2].trim();
    return { title, content };
  }

  const titleMatch = normalized.match(/^TITLE:\s*(.+?)(?=\n\n|\nSTORY:|$)/im);
  const storyMatch = normalized.match(/^STORY:\s*([\s\S]+)$/im);

  if (titleMatch && storyMatch) {
    const title = titleMatch[1].trim().replace(/\s+/g, ' ').slice(0, 120);
    const content = storyMatch[1].trim();
    return { title, content };
  }

  const lines = normalized.split('\n').map((line) => line.trim()).filter(Boolean);
  return {
    title: lines[0]?.replace(/^TITLE:\s*/i, '').slice(0, 120) || fallbackTitle,
    content: lines.slice(1).join('\n').trim() || normalized,
  };
}

// ─── HuggingFace Inference API (free tier) ─────────────────────────────────
async function generateWithHuggingFace(params) {
  const model =
    process.env.HUGGINGFACE_MODEL || "mistralai/Mistral-7B-Instruct-v0.2";
  const apiKey = process.env.HUGGINGFACE_API_KEY;

  if (!apiKey) throw new Error("HUGGINGFACE_API_KEY not set");

  const fullPrompt = `<s>[INST] ${buildSystemPrompt()}\n\n${buildUserPrompt(params)} [/INST]`;

  // FIX: Directed to the modernized global routing endpoint to avoid ENOTFOUND failures
  const response = await fetch("https://huggingface.co", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: model, // Target repository goes inside the payload
      messages: [{ role: "user", content: fullPrompt }],
      max_tokens: LENGTH_TOKENS[params.length]?.max || 800,
      temperature: 0.85,
      top_p: 0.9,
      stream: false,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`HuggingFace error: ${err}`);
  }

  const data = await response.json();

  // FIX: Read content directly from the standardized choices response matrix
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error("No text returned from HuggingFace");

  return {
    text: text.trim(),
    model: `huggingface/${model.split("/").pop()}`,
  };
}

// ─── Groq (free tier, fast) ────────────────────────────────────────────────
async function generateWithGroq(params) {
  const model = process.env.GROQ_MODEL || 'llama3-8b-8192';
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) throw new Error('GROQ_API_KEY not set');

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: buildSystemPrompt() },
        { role: 'user', content: buildUserPrompt(params) },
      ],
      temperature: 0.85,
      max_tokens: LENGTH_TOKENS[params.length]?.max || 800,
      top_p: 0.9,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq error: ${err}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('No text returned from Groq');

  return { text: text.trim(), model: `groq/${model}` };
}

// ─── Main export ────────────────────────────────────────────────────────────
const PROVIDERS = {
  groq: {
    fn: generateWithGroq,
    label: "Groq",
    isAvailable: () => !!process.env.GROQ_API_KEY,
  },
  huggingface: {
    fn: generateWithHuggingFace,
    label: "HuggingFace",
    isAvailable: () => !!process.env.HUGGINGFACE_API_KEY,
  },
};

// ─── Fallback chain ───────────────────────────────────────────────────────────
// Tries providers in order:  primary (from AI_PROVIDER env)  →  the other two
// Emits progress via onProgress(message) so the route can SSE/log status to the client.
// Throws a structured error only when every provider has failed.

export async function generateStory(params, onProgress = () => {}) {
  const primary = process.env.AI_PROVIDER || 'groq';  // default to Groq if not set

  // Build the ordered list: primary first, then the remaining in a fixed order
  const fallbackOrder = [ 'groq', 'huggingface'];
  const orderedProviders = [
    primary,
    ...fallbackOrder.filter((p) => p !== primary),
  ];

  const errors = [];   // collect failures for the final error message

  for (const name of orderedProviders) {
    const provider = PROVIDERS[name];

    if (!provider) {
      errors.push({ provider: name, reason: 'Unknown provider name in AI_PROVIDER env' });
      continue;
    }

    if (!provider.isAvailable()) {
      // No key configured — skip silently without telling the user
      errors.push({ provider: name, reason: 'Not configured (missing API key)' });
      continue;
    }

    if (errors.length > 0) {
      // We're past the primary — notify the client we're switching
      onProgress(`Switching to ${provider.label}…`);
    }

    try {
      console.log(`[AI] Trying ${provider.label}…`);
      const result = await provider.fn(params);
      console.log(`[AI] Success with ${provider.label}`);

      const parsedStory = parseGeneratedStory(result.text, `A ${params.genre.charAt(0).toUpperCase() + params.genre.slice(1)} Tale`);

      return { content: parsedStory.content, title: parsedStory.title, aiModel: result.model };

    } catch (err) {
      console.warn(`[AI] ${provider.label} failed: ${err.message}`);
      errors.push({ provider: name, reason: err.message });
      // Loop continues → tries next provider
    }
  }

  // Every provider failed — build a readable summary for the client
  const summary = errors
    .map((e) => `${e.provider}: ${e.reason}`)
    .join(' | ');

  throw new Error(`All AI providers failed. ${summary}`);
}


