export interface ChallengeTodoItem {
  id: string;
  text: string;
}

export type ChallengeTodoPayloadItem =
  | ChallengeTodoItem
  | string
  | {
      id?: string;
      text: string;
    };

export interface ChallengeTodoPayload {
  type: typeof CHALLENGE_TODO_TYPE;
  version: number;
  description?: string | null;
  name?: string | null;
  items: ChallengeTodoPayloadItem[];
}

type ExtractedTodoPayload = {
  description?: string | null;
  name?: string | null;
  items: ChallengeTodoItem[];
} | null;

export interface ParsedChallengeContent {
  isTodoFormat: boolean;
  description: string | null;
  name: string | null;
  items: ChallengeTodoItem[];
  raw: string | null;
}

export const CHALLENGE_TODO_TYPE = "unplug.challenge.todo";
const CURRENT_VERSION = 1;

export const encodeChallengeTodoContent = (
  items: ChallengeTodoItem[],
  metadata: {
    description?: string | null;
    name?: string | null;
  } = {}
): string => {
  const sanitizedName = metadata.name?.trim() || null;
  const sanitizedDescription = metadata.description?.trim() || null;

  const sanitizedItems = items
    .map((item, index) => {
      const text = String(item.text ?? "").trim();
      if (!text) {
        return null;
      }

      return {
        id: String(item.id || index),
        text,
      };
    })
    .filter(Boolean) as ChallengeTodoItem[];

  const payload: ChallengeTodoPayload = {
    type: CHALLENGE_TODO_TYPE,
    version: CURRENT_VERSION,
    description: sanitizedDescription,
    name: sanitizedName,
    items: sanitizedItems,
  };

  return JSON.stringify(payload);
};

export const parseChallengeContent = (
  raw: string | null | undefined
): ParsedChallengeContent => {
  if (!raw) {
    return {
      isTodoFormat: false,
      description: null,
      name: null,
      items: [],
      raw: raw ?? null,
    };
  }

  try {
    const parsed = JSON.parse(raw) as Partial<ChallengeTodoPayload> | unknown;

    const extracted = extractTodoPayload(parsed);
    if (extracted && extracted.items.length > 0) {
      return {
        isTodoFormat: true,
        description: extracted.description ?? null,
        name: extracted.name ?? null,
        items: extracted.items,
        raw,
      };
    }
  } catch {
    // Treat as plain text below
  }

  const trimmed = raw.trim();
  return {
    isTodoFormat: false,
    description: trimmed || null,
    name: null,
    items: [],
    raw,
  };
};

export const getChallengeContentSummary = (
  parsed: ParsedChallengeContent
): string | null => {
  if (parsed.description) {
    return parsed.description;
  }

  if (parsed.items.length > 0) {
    const [first, second] = parsed.items;
    if (!second) {
      return first.text;
    }

    const remaining = parsed.items.length - 2;
    const suffix = remaining > 0 ? ` 외 ${remaining}개` : "";
    return `${first.text}, ${second.text}${suffix}`;
  }

  return null;
};

const CANDIDATE_ITEM_KEYS = ["items", "todos", "todoList", "tasks", "checklist"];
const CANDIDATE_DESCRIPTION_KEYS = [
  "description",
  "intro",
  "introduction",
  "summary",
  "note",
];
const CANDIDATE_NAME_KEYS = ["name", "title", "challengeName"];
const CANDIDATE_TEXT_KEYS = [
  "text",
  "title",
  "name",
  "label",
  "content",
  "value",
  "task",
  "todo",
  "description",
  "body",
];

const extractTodoPayload = (value: unknown): ExtractedTodoPayload => {
  if (Array.isArray(value)) {
    const items = sanitizeTodoItems(value);
    return items.length > 0 ? { items } : null;
  }

  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;

  if (
    typeof record.type === "string" &&
    record.type === CHALLENGE_TODO_TYPE &&
    Array.isArray(record.items)
  ) {
    return {
      description: extractDescription(record),
      name: extractName(record),
      items: sanitizeTodoItems(record.items as unknown[]),
    };
  }

  const candidateKey = CANDIDATE_ITEM_KEYS.find(
    (key) => Array.isArray(record[key])
  );

  if (candidateKey) {
    const items = sanitizeTodoItems(record[candidateKey] as unknown[]);
    if (items.length > 0) {
      return {
        description: extractDescription(record),
        name: extractName(record),
        items,
      };
    }
  }

  return null;
};

const sanitizeTodoItems = (items: unknown[]): ChallengeTodoItem[] =>
  items
    .map((item, index) => {
      if (item == null) {
        return null;
      }

      if (typeof item === "string" || typeof item === "number") {
        const text = String(item).trim();
        return text ? { id: `${index}`, text } : null;
      }

      if (typeof item === "object") {
        const candidate = item as Record<string, unknown>;
        const textValue = extractTextValue(candidate);
        if (!textValue) {
          return null;
        }

        const rawId = candidate.id;
        const id =
          typeof rawId === "string" && rawId.trim()
            ? rawId.trim()
            : typeof rawId === "number"
            ? String(rawId)
            : `${index}`;

        return { id, text: textValue };
      }

      return null;
    })
    .filter(Boolean) as ChallengeTodoItem[];

const extractDescription = (record: Record<string, unknown>): string | null => {
  for (const key of CANDIDATE_DESCRIPTION_KEYS) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
};

const extractName = (record: Record<string, unknown>): string | null => {
  for (const key of CANDIDATE_NAME_KEYS) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return null;
};

const extractTextValue = (record: Record<string, unknown>): string | null => {
  for (const key of CANDIDATE_TEXT_KEYS) {
    if (!(key in record)) {
      continue;
    }
    const value = record[key];
    if (value == null) {
      continue;
    }

    const text = String(value).trim();
    if (text) {
      return text;
    }
  }

  return null;
};
