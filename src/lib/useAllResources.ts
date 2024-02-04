import { useLdo } from "@ldo/solid-react";
import { useState } from "react";

// This hook ensures that all given URIs have been loaded
// (regardless of the result of the read: error, absent or read).
export function useEnsureAllLoaded(uris: string[]): boolean {
  console.debug("useEnsureAllLoaded");
  const [allLoaded, setAllLoaded] = useState(false)
  const { getResource } = useLdo();

  if (!allLoaded) {
    Promise.all(
      uris.map(uri=> getResource(uri).readIfUnfetched())
    ).then(() => {
      setAllLoaded(true);
    });
  }

  return allLoaded;
}
