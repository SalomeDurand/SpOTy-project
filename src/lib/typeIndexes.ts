// A set of function for accessing type index entries.

import { ContainerUri, LeafUri } from "@ldo/solid";
import { useLdo } from "@ldo/solid-react";
import { SolidProfileShape } from "../.ldo/solidProfile.typings";
import { TypeRegistrationShapeType } from "../.ldo/typeIndex.shapeTypes";
import { TypeRegistration } from "../.ldo/typeIndex.typings";
import { solid } from "./ns";
import { useEnsureAllLoaded } from "./useAllResources";

// List all registered instances of the given type.
//
// Will return undefined if `profile` is undefined or the type indexes are nor loaded yet.
export function useAllRegisteredInstances(profile: SolidProfileShape | undefined, typeUri: string): LeafUri[] | undefined {
  return useAllRegistrations(profile, typeUri)
    ?.flatMap(typereg => typereg.instance || [])
    .map(x => x['@id'] as LeafUri);
}

// List all containers that are registered as containing instances of the given type.
//
// Will return undefined if `profile` is undefined or the type indexes are nor loaded yet.
export function useAllRegisteredContainers(profile: SolidProfileShape | undefined, typeUri: string): ContainerUri[] | undefined {
  return useAllRegistrations(profile, typeUri)
    ?.flatMap(typereg => typereg.instanceContainer || [])
    .map(x => x['@id'] as ContainerUri);
}

// List all registrations for the given type.
//
// Will return undefined if `profile` is undefined or the type indexes are nor loaded yet.
export function useAllRegistrations(profile: SolidProfileShape | undefined, typeUri: string): TypeRegistration[] | undefined {
  const { dataset } = useLdo();
  if (!useAllTypeIndexes(profile)) return undefined;
  return dataset
    .usingType(TypeRegistrationShapeType)
    .matchSubject(solid.forClass, typeUri)
}

// Return true when all type indexes (public and private) listed in `profile` have been loaded.
export function useAllTypeIndexes(profile?: SolidProfileShape): boolean {
  const allTypeIndexes = [
    ...(profile?.privateTypeIndex || []),
    ...(profile?.publicTypeIndex || []),
  ].map(obj => obj['@id']);
  const allLoaded = useEnsureAllLoaded(allTypeIndexes);

  return profile !== undefined && allLoaded;
}
