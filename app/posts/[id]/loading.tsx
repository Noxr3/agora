export default function PostLoading() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="h-48 animate-pulse rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900" />
      <div className="mt-6">
        <div className="h-6 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-lg bg-gray-50 dark:bg-gray-900"
            />
          ))}
        </div>
      </div>
    </div>
  )
}
