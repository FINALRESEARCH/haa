/**
 * The shape the directory shell renders. Deliberately not "person": the
 * course directory behind "Explore Courses" is the same table — a picture
 * pinned on the left, rows scrolling past it on the right — so nothing in
 * here is allowed to know what a row actually is. The page supplies the
 * nouns, the columns, and the filters.
 */

/** One column of the table. `id` is the key its text lives under on a row. */
export type DirectoryColumn = {
  id: string;
  /** The mono header: "NAME", "FIELD". */
  label: string;
  /** A CSS grid track: "minmax(0,2fr)", "120px". */
  width: string;
};

export type DirectoryEntry = {
  /** Stable across filtering — React keys and the picture panel both use it. */
  id: string;
  /** The first column's text, and the thing that links out. */
  title: string;
  /**
   * Where the title links. Empty is a real state, not an oversight: an entry
   * with no profile yet prints its name as plain text rather than a dead link.
   */
  href: string;
  /** Column id -> the text in that cell. Missing or empty prints an em dash. */
  cells: Record<string, string>;
  /**
   * The row thumbnail and the full picture it pins on the left. Optional
   * because a directory is allowed to outrun its photography: an entry
   * without one draws a monogram of its title instead, in both places.
   */
  image?: { src: string; thumb: string; alt: string };
  /** What the filter row matches against; not rendered directly. */
  tags: DirectoryTag[];
};

/** `group` ties the tag back to the filter it answers. */
export type DirectoryTag = { group: string; value: string };

/**
 * One filter control. `id` matches the `group` on the tags it filters, and a
 * group with fewer than two options is dropped by the page — a filter that
 * can only ever return everything is just a row of noise.
 */
export type DirectoryFilterGroup = {
  id: string;
  /** The mono label in front of the buttons: "Relationship", "Field". */
  label: string;
  /** The "any" button's label: "All", "Every field". */
  allLabel: string;
  options: { value: string; label: string }[];
};

/**
 * Where the filters live.
 *
 * `headers` hangs them off the column headings, so the control sits on the
 * column it narrows. `pills` puts them in a bar above the table instead and
 * leaves the headings as headings — the arrangement the phone layout has
 * always used, since below `lg` there are no column headings to hang off.
 */
export type DirectoryVariant = "headers" | "pills";

/**
 * How the line over the heading is set. `label` is the site's mono eyebrow,
 * small and lettered out; `heading` sets it in the display face instead, as a
 * second, quieter line of the title.
 */
export type DirectoryEyebrow = "label" | "heading";
