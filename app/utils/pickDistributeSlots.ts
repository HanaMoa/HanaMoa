// app/utils/pickDistributedSlots.ts

type Position = {
  left: string;
  top: string;
};

export function pickDistributedSlots(
  positions: Position[],
  guestCount: number,
): Position[] {
  if (guestCount >= positions.length) {
    return [...positions];
  }

  const result: Position[] = [];
  const step = positions.length / guestCount;

  for (let i = 0; i < guestCount; i++) {
    const index = Math.floor(i * step);
    result.push(positions[index]);
  }

  return result;
}
