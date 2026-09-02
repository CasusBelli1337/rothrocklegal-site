/**
 * Card grids that run two columns on small screens and three at `until`
 * (`lg` or `xl`). With an odd count, the last card spans both small-screen
 * columns so the grid never ends on a half-empty row; at three columns the
 * count is a multiple of three (9 practice cards = 3 × 3).
 */

const SPAN = {
  lg: 'sm:col-span-2 lg:col-span-1',
  xl: 'sm:col-span-2 xl:col-span-1',
} as const;

export function oddLastSpan(index: number, count: number, until: keyof typeof SPAN): string {
  return count % 2 === 1 && index === count - 1 ? SPAN[until] : '';
}
