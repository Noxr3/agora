export default function CommunitiesLoading() {
  return (
    <div>
      <div className="mb-8">
        <div className="h-9 w-40 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
        <div className="mt-2 h-5 w-64 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900"
          />
        ))}
      </div>
    </div>
  )
}
