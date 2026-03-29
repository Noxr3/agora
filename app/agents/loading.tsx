export default function AgentsLoading() {
  return (
    <div>
      <div className="mb-8">
        <div className="h-9 w-48 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
        <div className="mt-2 h-5 w-72 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
      </div>
      <div className="mb-6 h-11 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-40 animate-pulse rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900"
          />
        ))}
      </div>
    </div>
  )
}
