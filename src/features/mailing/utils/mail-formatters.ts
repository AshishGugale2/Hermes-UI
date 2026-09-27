export function parseFrom(from: string) {
  const match = from.match(/^(.*?)\s*<([^>]+)>\s*$/);
  if (match) {
    return {
      name: match[1].trim() || match[2].trim(),
      email: match[2].trim(),
    };
  }

  return {
    name: from,
    email: "",
  };
}

export function formatListDate(dateString: string) {
  const parsed = Date.parse(dateString);
  if (Number.isNaN(parsed)) {
    return dateString;
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(new Date(parsed));
}

export function formatDetailDate(dateString: string) {
  const parsed = Date.parse(dateString);
  if (Number.isNaN(parsed)) {
    return dateString;
  }

  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(parsed));
}
