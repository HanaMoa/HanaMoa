export function InfoTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mt-16 text-center font-bold text-3xl">
      <div>{title}</div>
      <div className="mt-1">{subtitle}</div>
    </div>
  );
}
