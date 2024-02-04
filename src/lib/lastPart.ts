// return the last non-empty path-part of the URI.
// (assuming it does not have a query part nor a fragment part)
export function lastPart(uri: string): string {
  const netUri = uri.endsWith('/') ? uri.substring(0, uri.length-1) : uri;
  return netUri.split("/").at(-1) as string;
}
