export function InfoTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mt-7 text-center font-bold text-3xl">
      <div>{title}</div>
      <div className="mt-1">{subtitle}</div>
    </div>
  );
}
