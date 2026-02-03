type Props = {
  count: number;
  onClick?: () => void;
};

export default function EventCard({ count, onClick }: Props) {
  return (
    <div className="flex w-full items-center justify-between rounded-[5px] bg-white px-4 py-5 md:py-3 lg:py-4 md:px-5 lg:px-6">
      <span className="font-bold text-base text-black md:text-lg lg:text-xl">
        진행 중인 행사
      </span>

      <span className="font-bold tracking-wider">
        <span className="text-[#017F70] text-xl md:text-2xl lg:text-3xl">
          {count}
        </span>
        <span className="text-black text-lg md:text-xl lg:text-2xl">건</span>
      </span>
    </div>
  );
}
