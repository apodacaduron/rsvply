export function slugify(input: string) {
  return input
    .replace(/[^a-zA-Z0-9]+/g, '-') // Replace non-alphanumeric with -
    .replace(/^-+|-+$/g, '')        // Trim leading/trailing dashes
    .toLowerCase();                 // Convert to lowercase
}