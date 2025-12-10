import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-black">
      <main className="flex flex-col items-center gap-8 text-center">
        <h1 className="text-4xl font-bold text-black dark:text-white">
          Panhandle Pathway
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Welcome to your application
        </p>
        <div className="flex gap-4">
          <Link
            href="/store"
            className="rounded-full bg-black px-6 py-3 text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Visit Store
          </Link>
          <Link
            href="/auth/login"
            className="rounded-full border border-black px-6 py-3 text-black transition-colors hover:bg-black hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black"
          >
            Sign In
          </Link>
        </div>
      </main>
    </div>
  );
}
