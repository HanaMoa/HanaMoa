import { Button } from '../ui/button';

type Props = {
  label: string; // 버튼에 들어갈 텍스트
  formAction?: (formData: FormData) => Promise<void>;
  onClick?: () => void;
  redirectTo?: string;
};

export function SingleButton({
  label,
  formAction,
  onClick,
  redirectTo,
}: Props) {
  if (onClick) {
    return (
      <Button
        type="button"
        onClick={onClick}
        className="h-[49px] w-[285px] rounded-[10px] bg-[#00A998] text-[#F6F7F9] text-[16px] hover:bg-[#017F70]"
      >
        {label}
      </Button>
    );
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <Button
        type="submit"
        className="h-[49px] w-[285px] rounded-[10px] bg-[#00A998] text-[#F6F7F9] text-[16px] hover:bg-[#017F70]"
      >
        {label}
      </Button>
    </form>
  );
}
