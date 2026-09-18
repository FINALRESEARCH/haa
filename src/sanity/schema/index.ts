import type { SchemaTypeDefinition } from "sanity";
import { homePage } from "./homePage";
import { navigation } from "./navigation";
import { cta, navPanel } from "./objects";
import { partner } from "./partner";
import { person } from "./person";
import {
  admissionsSection,
  heroSection,
  lifeSection,
  networkSection,
  partnersSection,
  peopleWallSection,
  programSection,
} from "./sections";
import { siteSettings } from "./siteSettings";

/** Documents an editor can create more of, as opposed to the singletons. */
export const COLLECTION_TYPES = ["person", "partner"] as const;

/** One of each, reached from the top of the structure sidebar. */
export const SINGLETON_TYPES = ["siteSettings", "navigation", "homePage"] as const;

export const schemaTypes: SchemaTypeDefinition[] = [
  // Singletons
  siteSettings,
  navigation,
  homePage,
  // Collections
  person,
  partner,
  // Objects
  cta,
  navPanel,
  heroSection,
  networkSection,
  programSection,
  admissionsSection,
  peopleWallSection,
  partnersSection,
  lifeSection,
];
