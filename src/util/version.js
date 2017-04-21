/* @flow */

export function explodeHashedUrl(url: string): { url: string, hash: string } {
  const parts = url.split('#');

  return {
    url: parts[0],
    hash: parts[1] || '',
  };
}
