// lib/validators/name.ts
export const KOR_ENG_NAME_REGEX = /^[A-Za-z가-힣]+$/;
export const ONLY_NUMBER_REGEX = /^\d+$/;

export function validateKorEngNameNoSpace(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return '이름을 입력해주세요.';
  if (!KOR_ENG_NAME_REGEX.test(trimmed))
    return '공백 없이 한글 또는 영문만 입력해주세요.';
  return null;
}

export function validateOnlyNumber(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return '계좌번호를 입력해주세요.';
  if (!ONLY_NUMBER_REGEX.test(trimmed)) return '숫자만 입력해주세요.';
  return null;
}
