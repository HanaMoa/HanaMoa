import Link from 'next/link';

type Props = {
  title: string;
  desc: string;
  href: string;
  icon?: React.ReactNode;
};

export default function QuickMenuCard({ title, desc, href, icon }: Props) {
  return (
    <Link
      href={href}
      className="rounded-2xl border bg-white p-4 shadow-sm transition active:scale-[0.98]"
    >
      <div className="mb-3 text-2xl">{icon}</div>
      <div className="font-semibold text-gray-900 text-sm">{title}</div>
      <div className="mt-1 text-gray-500 text-xs">{desc}</div>
    </Link>
  );
}
