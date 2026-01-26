import type { DropdownItem } from '@/components/common/Dropdown';
import type { eventhost_role } from '@/lib/generated/prisma/client/enums';

// 장례식: 대표(상주) = CHIEF_MOURNER / 추가 = MOURNER
export const FUNERAL_REP_ROLE: DropdownItem[] = [
  { value: 'CHIEF_MOURNER' satisfies eventhost_role, label: '상주(대표)' },
];

export const FUNERAL_EXTRA_ROLE: DropdownItem[] = [
  { value: 'MOURNER' satisfies eventhost_role, label: '상주' },
];

// 결혼식: step2 신랑=GROOM, 추가=GROOM_FATHER/GROOM_MOTHER
export const WEDDING_GROOM_SIDE_REP_ROLE: DropdownItem[] = [
  { value: 'GROOM' satisfies eventhost_role, label: '신랑(대표)' },
];

export const WEDDING_GROOM_SIDE_EXTRA_ROLE: DropdownItem[] = [
  { value: 'GROOM_FATHER' satisfies eventhost_role, label: '신랑 아버지' },
  { value: 'GROOM_MOTHER' satisfies eventhost_role, label: '신랑 어머니' },
];

// step3 신부=BRIDE, 추가=BRIDE_FATHER/BRIDE_MOTHER
export const WEDDING_BRIDE_SIDE_REP_ROLE: DropdownItem[] = [
  { value: 'BRIDE' satisfies eventhost_role, label: '신부(대표)' },
];

export const WEDDING_BRIDE_SIDE_EXTRA_ROLE: DropdownItem[] = [
  { value: 'BRIDE_FATHER' satisfies eventhost_role, label: '신부 아버지' },
  { value: 'BRIDE_MOTHER' satisfies eventhost_role, label: '신부 어머니' },
];
