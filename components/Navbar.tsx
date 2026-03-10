import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="border-b border-pink-100 bg-white/80 backdrop-blur-sm px-6 py-4 sticky top-0 z-10">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <Link href="/dashboard" className="text-xl font-black tracking-tight bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
          StudyPack ✦
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/upload"
            className="rounded-full bg-gradient-to-r from-pink-400 to-violet-400 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
          >
            + New Study Set
          </Link>
          <form action="/api/auth/signout" method="post">
            <button type="submit" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
              Sign out
            </button>
          </form>
        </div>
      </div>
    </nav>
  )
}
