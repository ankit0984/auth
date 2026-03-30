export const normalizeAuthors = (authorInput) => {
  if (Array.isArray(authorInput)) {
    return authorInput
      .map((author) => author?.toString().trim().toLowerCase())
      .filter(Boolean);
  }

  if (typeof authorInput === "string") {
    const trimmed = authorInput.trim();

    if (!trimmed) {
      return [];
    }

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed
          .map((author) => author?.toString().trim().toLowerCase())
          .filter(Boolean);
      }
    } catch {
      return trimmed
        .split(",")
        .map((author) => author.trim().toLowerCase())
        .filter(Boolean);
    }

    return [trimmed.toLowerCase()];
  }

  return [];
};
