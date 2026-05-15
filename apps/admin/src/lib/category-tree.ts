import type { Category } from "./types";

export type CategoryNode = Category & { depth: number; pathLabel: string };

export function flattenCategoryTree(categories: Category[]): CategoryNode[] {
  const byParent = new Map<string | null, Category[]>();
  for (const c of categories) {
    const key = c.parentId;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push(c);
  }
  for (const list of byParent.values()) {
    list.sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "uk"));
  }

  const result: CategoryNode[] = [];
  const walk = (parentId: string | null, depth: number, prefix: string) => {
    for (const c of byParent.get(parentId) ?? []) {
      const pathLabel = prefix ? `${prefix} › ${c.name}` : c.name;
      result.push({ ...c, depth, pathLabel });
      walk(c.id, depth + 1, pathLabel);
    }
  };
  walk(null, 0, "");
  return result;
}

export function categorySelectOptions(categories: Category[], excludeId?: string) {
  return [
    { value: "", label: "— Без батьківської —" },
    ...flattenCategoryTree(categories)
      .filter((c) => c.id !== excludeId)
      .map((c) => ({
        value: c.id,
        label: `${c.depth > 0 ? `${"  ".repeat(c.depth)}↳ ` : ""}${c.name}`,
      })),
  ];
}
