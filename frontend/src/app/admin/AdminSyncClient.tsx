"use client";

import { useState } from "react";

type SyncResult = {
  topFinGrpNos: string[];
  pageSize: number;
  deposit: { productsUpserted: number; optionsUpserted: number; pages: number };
  saving: { productsUpserted: number; optionsUpserted: number; pages: number };
};

type DedupeResult = {
  ok: boolean;
  deleteResult?: { affectedRows?: number };
  normalizeResult?: { affectedRows?: number; info?: string };
};

export default function AdminSyncClient() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SyncResult | null>(null);
  const [dedupeLoading, setDedupeLoading] = useState(false);
  const [dedupeError, setDedupeError] = useState<string | null>(null);
  const [dedupeResult, setDedupeResult] = useState<DedupeResult | null>(null);

  const runSync = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`/api/admin/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topFinGrpNos: ["020000"], pageSize: 100 }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`${res.status} ${text}`);
      }
      const data = (await res.json()) as SyncResult;
      setResult(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const runDedupe = async () => {
    setDedupeLoading(true);
    setDedupeError(null);
    setDedupeResult(null);
    try {
      const res = await fetch(`/api/admin/dedupe-options`, { method: "POST" });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`${res.status} ${text}`);
      }
      const data = (await res.json()) as DedupeResult;
      setDedupeResult(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setDedupeError(msg);
    } finally {
      setDedupeLoading(false);
    }
  };

  return (
    <section className="rounded-3xl border border-sky-100 bg-white p-8 shadow-sm">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="inline-flex items-center rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
            Admin
          </div>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-sky-950">
            금감원 데이터 동기화
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            버튼을 누르면 백엔드가 금감원 Open API를 호출해서 MySQL에 upsert로 적재합니다.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:items-end">
          <button
            type="button"
            onClick={runSync}
            disabled={loading || dedupeLoading}
            className={`inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-semibold shadow-sm transition focus:outline-none focus:ring-4 focus:ring-sky-200 ${
              loading || dedupeLoading
                ? "cursor-not-allowed bg-sky-200 text-white"
                : "bg-sky-600 text-white hover:bg-sky-700"
            }`}
          >
            {loading ? "동기화 중..." : "지금 동기화"}
          </button>
          <button
            type="button"
            onClick={runDedupe}
            disabled={dedupeLoading || loading}
            className={`inline-flex h-10 items-center justify-center rounded-xl px-5 text-sm font-semibold ring-1 ring-sky-100 transition focus:outline-none focus:ring-4 focus:ring-sky-200 ${
              dedupeLoading || loading
                ? "cursor-not-allowed bg-white text-slate-300"
                : "bg-white text-sky-700 hover:bg-sky-50"
            }`}
          >
            {dedupeLoading ? "중복 정리 중..." : "옵션 중복 정리"}
          </button>
        </div>
      </div>

      {error ? (
        <div className="mt-6 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-800">
          <div className="font-semibold">동기화 실패</div>
          <div className="mt-1 wrap-break-word font-mono text-xs">{error}</div>
        </div>
      ) : null}

      {result ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-sky-50 p-5 ring-1 ring-sky-100">
            <div className="text-xs font-semibold text-sky-700">예금 (DEPOSIT)</div>
            <div className="mt-2 text-sm text-slate-700">
              상품 upsert:{" "}
              <span className="font-semibold text-sky-900">
                {result.deposit.productsUpserted}
              </span>
            </div>
            <div className="mt-1 text-sm text-slate-700">
              옵션 upsert:{" "}
              <span className="font-semibold text-sky-900">
                {result.deposit.optionsUpserted}
              </span>
            </div>
            <div className="mt-1 text-xs text-slate-500">페이지 처리: {result.deposit.pages}</div>
          </div>
          <div className="rounded-2xl bg-sky-50 p-5 ring-1 ring-sky-100">
            <div className="text-xs font-semibold text-sky-700">적금 (SAVING)</div>
            <div className="mt-2 text-sm text-slate-700">
              상품 upsert:{" "}
              <span className="font-semibold text-sky-900">
                {result.saving.productsUpserted}
              </span>
            </div>
            <div className="mt-1 text-sm text-slate-700">
              옵션 upsert:{" "}
              <span className="font-semibold text-sky-900">
                {result.saving.optionsUpserted}
              </span>
            </div>
            <div className="mt-1 text-xs text-slate-500">페이지 처리: {result.saving.pages}</div>
          </div>
        </div>
      ) : null}

      {dedupeError ? (
        <div className="mt-6 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-800">
          <div className="font-semibold">중복 정리 실패</div>
          <div className="mt-1 wrap-break-word font-mono text-xs">{dedupeError}</div>
        </div>
      ) : null}

      {dedupeResult ? (
        <div className="mt-6 rounded-2xl bg-sky-50 p-5 ring-1 ring-sky-100">
          <div className="text-xs font-semibold text-sky-700">옵션 중복 정리 결과</div>
          <div className="mt-2 text-sm text-slate-700">
            삭제된 옵션 수:{" "}
            <span className="font-semibold text-sky-900">
              {dedupeResult.deleteResult?.affectedRows ?? "-"}
            </span>
          </div>
          <div className="mt-1 text-sm text-slate-700">
            NULL 정규화 처리:{" "}
            <span className="font-semibold text-sky-900">
              {dedupeResult.normalizeResult?.affectedRows ?? "-"}
            </span>
          </div>
        </div>
      ) : null}
    </section>
  );
}

