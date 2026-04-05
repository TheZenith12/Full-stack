"use client";

import { useSearchParams, useRouter } from "next/navigation";

interface Props {
  defaultSort: string;
}

export default function SortSelect({ defaultSort }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    params.set("page", "1"); // сорт солигдоход эхний хуудас руу
    router.push(`?${params.toString()}`);
  }

  return (
    <select
      defaultValue={defaultSort}
      onChange={(e) => handleChange(e.target.value)}
      className="input-field w-auto text-sm py-2"
    >
      <option value="created_at">Шинэ эхэнд</option>
      <option value="rating_avg">Үнэлгээгээр</option>
      <option value="view_count">Үзэлтээр</option>
      <option value="price_per_night">Үнээр</option>
    </select>
  );
}