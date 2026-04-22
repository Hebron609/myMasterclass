interface StatsCardProps {
  label: string;
  value: number;
}

export default function StatsCard({ label, value }: StatsCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 text-center shadow-sm">
      <div className="text-[24px] font-bold text-[#333333] font-dm-sans">{value}</div>
      <div className="text-[12px] text-[#003F3A] mt-2 font-rubik font-regular">{label}</div>
    </div>
  );
}
