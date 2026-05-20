# shadcn/ui — componente disponibile
> Source: https://ui.shadcn.com/docs/components
> Fetched: 2026-05-16
> Use for: ce avem deja în `components/ui/` — reuse, nu reinventa

În proiect sunt deja instalate ~47 componente shadcn în `components/ui/` (vezi `ls components/ui`): accordion, alert(-dialog), aspect-ratio, avatar, badge, breadcrumb, button, calendar, card, carousel, chart, checkbox, collapsible, command, context-menu, dialog, drawer, dropdown-menu, form, hover-card, input(-otp), label, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, skeleton, slider, sonner, switch, table, tabs, textarea, toast, toaster, toggle(-group), tooltip.

Upstream are 70+ (în plus: combobox, date-picker, sidebar, typography, empty, spinner, kbd, field, item, native-select, input-group).

**Adăugare componentă nouă (dacă lipsește):** `npx shadcn@latest add <nume>` — dar **întreabă fondatorul întâi** (regula #9: nu instala fără confirmare). Stilul shadcn e deja mapat pe paleta brand prin HSL vars în `globals.css` + `tailwind.config.ts`.
