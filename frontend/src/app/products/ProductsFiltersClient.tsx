"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type ProductType = "DEPOSIT" | "SAVING";
type Bank = { finCoNo: string; korCoNm: string };

export default function ProductsFiltersClient(props: {
  banks: Bank[];
  initial: {
    type: ProductType | "ALL";
    finCoNo: string;
    q: string;
    limit: number;
    page: number;
  };
  summary: { total: number; page: number; limit: number };
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [type, setType] = useState(props.initial.type);
  const [finCoNo, setFinCoNo] = useState(props.initial.finCoNo);
  const [q, setQ] = useState(props.initial.q);
  const [limit, setLimit] = useState(String(props.initial.limit));

  // keep state in sync if user navigates via back/forward or pagination
  useEffect(() => {
    setType(props.initial.type);
    setFinCoNo(props.initial.finCoNo);
    setQ(props.initial.q);
    setLimit(String(props.initial.limit));
  }, [props.initial.finCoNo, props.initial.limit, props.initial.q, props.initial.type]);

  const pushParams = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams();
    next.set("page", "1"); // reset page on filter changes

    // start from current controlled state (not from useSearchParams to avoid hydration mismatch)
    const currentType = type;
    const currentFinCoNo = finCoNo;
    const currentQ = q.trim();
    const currentLimit = limit;

    if (currentType && currentType !== "ALL") next.set("type", currentType);
    if (currentFinCoNo) next.set("finCoNo", currentFinCoNo);
    if (currentQ) next.set("q", currentQ);
    if (currentLimit) next.set("limit", currentLimit);

    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === "") next.delete(k);
      else next.set(k, v);
    }

    router.push(`${pathname}?${next.toString()}`);
  };

  // q: debounce to avoid refetch on every keystroke
  useEffect(() => {
    const t = setTimeout(() => {
      pushParams({ q: q.trim() || null });
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const from = props.summary.total
    ? Math.min((props.summary.page - 1) * props.summary.limit + 1, props.summary.total)
    : 0;
  const to = props.summary.total
    ? Math.min(props.summary.page * props.summary.limit, props.summary.total)
    : 0;

  return (
    <div className="mt-6 grid gap-3">
      <div className="grid gap-3 sm:grid-cols-[160px_200px_1fr_160px]">
        <select
          value={type}
          onChange={(e) => {
            const v = e.target.value as ProductType | "ALL";
            setType(v);
            pushParams({ type: v === "ALL" ? null : v });
          }}
          className="h-11 rounded-xl border border-sky-100 bg-white px-3 text-sm outline-none ring-sky-200 focus:ring-4"
        >
          <option value="ALL">전체</option>
          <option value="DEPOSIT">예금</option>
          <option value="SAVING">적금</option>
        </select>

        <select
          value={finCoNo}
          onChange={(e) => {
            const v = e.target.value;
            setFinCoNo(v);
            pushParams({ finCoNo: v || null });
          }}
          className="h-11 rounded-xl border border-sky-100 bg-white px-3 text-sm outline-none ring-sky-200 focus:ring-4"
        >
          <option value="">전체 은행</option>
          {props.banks.map((b) => (
            <option key={b.finCoNo} value={b.finCoNo}>
              {b.korCoNm}
            </option>
          ))}
        </select>

        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="은행/상품명 검색"
          className="h-11 rounded-xl border border-sky-100 bg-white px-3 text-sm outline-none ring-sky-200 focus:ring-4"
        />

        <select
          value={limit}
          onChange={(e) => {
            const v = e.target.value;
            setLimit(v);
            pushParams({ limit: v });
          }}
          className="h-11 rounded-xl border border-sky-100 bg-white px-3 text-sm outline-none ring-sky-200 focus:ring-4"
        >
          {[10, 20, 50, 100].map((n) => (
            <option key={n} value={String(n)}>
              {n}개씩
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-slate-500">
          {props.summary.total === 0 ? (
            <>검색 결과가 없어요.</>
          ) : (
            <>
              {from}-{to} / {props.summary.total}
            </>
          )}
        </div>
        <button
          type="button"
          onClick={() => pushParams({ q: null, finCoNo: null, type: null, limit: "20" })}
          className="rounded-xl px-4 py-2 text-sm font-semibold text-sky-700 ring-1 ring-sky-100 transition hover:bg-sky-50"
        >
          필터 초기화
        </button>
      </div>
    </div>
  );
}

