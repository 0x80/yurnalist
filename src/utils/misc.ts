export function removeSuffix(pattern: string, suffix: string): string {
  if (pattern.endsWith(suffix)) {
    return pattern.slice(0, -suffix.length);
  }

  return pattern;
}
