/**
 * Shared guest/couple helpers used by both the invitation (App) and the
 * link generator (Admin), so links and on-page names always agree.
 */

export const brideName = "Akila";
export const groomName = "Shiwantha";
export const coupleNames = `${brideName} & ${groomName}`;

export const guestPrefixes = ["Mr.", "Mrs.", "Miss", "Mr. & Mrs.", "Family", "Dear"] as const;
export type GuestPrefix = (typeof guestPrefixes)[number];

/** Combines prefix + name. "Dear" is a greeting style, so it never appears in the name itself. */
export function buildDisplayName(prefix: string, name: string): string {
  const cleanName = name.trim().replace(/\s+/g, " ");
  if (!cleanName) return "";
  switch (prefix.trim().toLowerCase()) {
    case "dear":
      return cleanName;
    case "family":
      return `${cleanName} and Family`;
    default:
      return `${prefix.trim()} ${cleanName}`;
  }
}

/** {baseURL}/{displayName}, safely encoded (spaces, &, /, etc.). */
export function buildInviteLink(baseUrl: string, displayName: string): string {
  return `${baseUrl.replace(/\/+$/, "")}/${encodeURIComponent(displayName)}`;
}

export function buildInviteMessage(displayName: string, link: string): string {
  return `Dear ${displayName} ❤️

With joyful hearts, we warmly invite you to celebrate one of the most special days of our lives as we begin our journey together.

Please view our wedding invitation and all the event details through the link below 🌐:

${link}

Your presence would truly mean the world to us, and we would be honored to celebrate this beautiful moment together.

With love,
❤️ ${coupleNames}`;
}

/** Reads the guest display name from /{name}, falling back to the older ?p=&n= links. */
export function readGuestFromUrl(location: Location = window.location): string {
  const segment = location.pathname.replace(/^\/+|\/+$/g, "");
  if (segment && segment.toLowerCase() !== "admin") {
    try {
      const decoded = decodeURIComponent(segment).trim();
      if (decoded) return decoded;
    } catch {
      // Malformed encoding: ignore and fall through.
    }
  }

  const params = new URLSearchParams(location.search);
  const name = params.get("n");
  return name ? buildDisplayName(params.get("p") || "Dear", name) : "";
}
