export interface SM2Item {
  repetitions: number;
  easeFactor: number;
  intervalDays: number;
  dueDate: Date;
}

export type Quality = 0 | 1 | 2 | 3 | 4 | 5;
// 0-2: wrong, 3-5: correct (5 = perfect)

export function sm2(item: SM2Item, quality: Quality): SM2Item {
  let { repetitions, easeFactor, intervalDays } = item;

  if (quality >= 3) {
    if (repetitions === 0) intervalDays = 1;
    else if (repetitions === 1) intervalDays = 6;
    else intervalDays = Math.round(intervalDays * easeFactor);

    repetitions += 1;
    easeFactor = Math.max(
      1.3,
      easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
    );
  } else {
    repetitions = 0;
    intervalDays = 1;
  }

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + intervalDays);

  return { repetitions, easeFactor, intervalDays, dueDate };
}

export function getDueItems<T extends SM2Item>(items: T[]): T[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return items.filter((item) => new Date(item.dueDate) <= today);
}

export function getMaturityLabel(repetitions: number): string {
  if (repetitions === 0) return "Yeni";
  if (repetitions < 3) return "Öğreniliyor";
  if (repetitions < 6) return "Olgunlaşıyor";
  return "Olgun";
}

export function getMaturityColor(repetitions: number): string {
  if (repetitions === 0) return "#8A8578";
  if (repetitions < 3) return "#D4872A";
  if (repetitions < 6) return "#E8A84C";
  return "#4CAF50";
}
