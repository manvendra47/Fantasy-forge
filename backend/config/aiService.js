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
};

const LENGTH_TOKENS = {
  short: { max: 400, words: '250–350 words', chars: '1,500–2,100 characters' },
  medium: { max: 800, words: '500–700 words', chars: '3,000–4,200 characters' },
  long: { max: 1400, words: '900–1200 words', chars: '5,400–7,200 characters' },
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
  const lengthDesc = LENGTH_TOKENS[length]?.words || '500–700 words';
  const charDesc = LENGTH_TOKENS[length]?.chars || '3,000–4,200 characters';

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
  const normalized = text.replace(/\r/g, '');
  const titleMatch = normalized.match(/TITLE:\s*(.+?)(?:\n\n|$)/i);
  const storyMatch = normalized.match(/STORY:\s*([\s\S]+)/i);

  if (titleMatch && storyMatch) {
    return {
      title: titleMatch[1].trim().slice(0, 120),
      content: storyMatch[1].trim(),
    };
  }

  const lines = normalized.trim().split('\n');
  return {
    title: lines[0]?.trim().slice(0, 120) || fallbackTitle,
    content: lines.slice(1).join('\n').trim() || normalized.trim(),
  };
}

// ─── Ollama (local, free) ───────────────────────────────────────────────────
async function generateWithOllama(params) {
  const model = process.env.OLLAMA_MODEL || 'llama3';
  const baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

  const response = await fetch(`${baseUrl}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      system: buildSystemPrompt(),
      prompt: buildUserPrompt(params),
      stream: false,
      options: {
        temperature: 0.85,
        top_p: 0.9,
        num_predict: LENGTH_TOKENS[params.length]?.max || 800,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Ollama error: ${err}`);
  }

  const data = await response.json();
  return { text: data.response, model: `ollama/${model}` };
}

// ─── HuggingFace Inference API (free tier) ─────────────────────────────────
async function generateWithHuggingFace(params) {
  const model = process.env.HUGGINGFACE_MODEL || 'mistralai/Mistral-7B-Instruct-v0.2';
  const apiKey = process.env.HUGGINGFACE_API_KEY;

  if (!apiKey) throw new Error('HUGGINGFACE_API_KEY not set');

  const fullPrompt = `<s>[INST] ${buildSystemPrompt()}\n\n${buildUserPrompt(params)} [/INST]`;

  const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: fullPrompt,
      parameters: {
        max_new_tokens: LENGTH_TOKENS[params.length]?.max || 800,
        temperature: 0.85,
        top_p: 0.9,
        do_sample: true,
        return_full_text: false,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`HuggingFace error: ${err}`);
  }

  const data = await response.json();
  const text = Array.isArray(data) ? data[0]?.generated_text : data?.generated_text;
  if (!text) throw new Error('No text returned from HuggingFace');

  return { text: text.trim(), model: `huggingface/${model.split('/').pop()}` };
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

// ─── Auto-generate title ────────────────────────────────────────────────────
// ─── Main export ────────────────────────────────────────────────────────────
export async function generateStory(params) {
  const provider = process.env.AI_PROVIDER || 'ollama';

  let result;
  if (provider === 'huggingface') {
    result = await generateWithHuggingFace(params);
  } else if (provider === 'groq') {
    result = await generateWithGroq(params);
  } else {
    result = await generateWithOllama(params);
  }

  const fallbackTitle = `A ${params.genre.charAt(0).toUpperCase() + params.genre.slice(1)} Tale`;
  const story = parseGeneratedStory(result.text, fallbackTitle);

  return {
    content: story.content,
    title: story.title,
    aiModel: result.model,
  };
}
