// Keep a number glued to its unit ("440 mm", "1,7 cm", "180 RON") so a line
// never ends on the number with the unit alone on the next line (design-qa
// 2026-11-19: "— 440 / mm" in product titles). Replaces the space with a
// no-break space (U+00A0); the text itself, search and copy-paste are
// unchanged. Use on display only — never on stored or admin-edited values.
const NUMBER_UNIT = /(\d)[ \t]+(mm|cm|m|kg|g|ml|l|RON|lei)(?![\p{L}\p{N}])/gu;

export function keepUnits(text: string): string;
export function keepUnits(text: string | null | undefined): string | null | undefined;
export function keepUnits(text: string | null | undefined): string | null | undefined {
  return text ? text.replace(NUMBER_UNIT, '$1 $2') : text;
}
