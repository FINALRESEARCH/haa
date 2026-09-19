import type { SchemaTypeDefinition } from "sanity";
import { aboutChapter, aboutPage } from "./aboutPage";
import { applicant } from "./applicant";
import { course, coursesPage } from "./course";
import {
  curriculumChapter,
  curriculumDay,
  curriculumEntry,
  curriculumPage,
  curriculumPoint,
} from "./curriculumPage";
import { homePage } from "./homePage";
import { navigation } from "./navigation";
import { cta, navPanel } from "./objects";
import { partner } from "./partner";
import { person } from "./person";
import {
  admissionsSection,
  closingSection,
  heroSection,
  lifeSection,
  networkSection,
  partnersSection,
  programSection,
} from "./sections";
import { siteSettings } from "./siteSettings";

/** Documents an editor can create more of, as opposed to the singletons. */
export const COLLECTION_TYPES = [
  "person",
  "partner",
  "applicant",
  "course",
] as const;

/** One of each, reached from the top of the structure sidebar. */
export const SINGLETON_TYPES = [
  "siteSettings",
  "navigation",
  "homePage",
  "aboutPage",
  "curriculumPage",
  "coursesPage",
] as const;

export const schemaTypes: SchemaTypeDefinition[] = [
  // Singletons
  siteSettings,
  navigation,
  homePage,
  aboutPage,
  curriculumPage,
  coursesPage,
  // Collections
  person,
  partner,
  applicant,
  course,
  // Objects
  cta,
  navPanel,
  aboutChapter,
  curriculumChapter,
  curriculumPoint,
  curriculumDay,
  curriculumEntry,
  heroSection,
  networkSection,
  programSection,
  admissionsSection,
  partnersSection,
  lifeSection,
  closingSection,
];
