'use client'

import Link from 'next/link'

interface StudySet {
  id: string
  title: string
  created_at: string
}

interface StudySetListProps {
  studySets: StudySet[]
}

const CARD_GRADIENTS = [
  'from-pink-300 to-rose-300',
  'from-violet-300 to-purple-300',
  'from-rose-300 to-pink-300',
  'from-fuchsia-300 to-violet-300',
  'from-pink-300 to-fuchsia-300',
  'from-purple-300 to-pink-300',
]

export default function StudySetList({ studySets }: StudySetListProps) {
  if (studySets.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">📚</div>
        <p className="text-gray-600 text-lg font-medium mb-2">No study sets yet</p>
        <p className="text-gray-400 text-sm mb-6">Upload a PDF or DOCX to get started</p>
        <Link
          href="/upload"
          className="inline-block rounded-full bg-gradient-to-r from-pink-500 to-violet-500 px-6 py-3 text-sm font-semibold text-white shadow hover:opacity-90 transition-opacity"
        >
          Upload your first file
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {studySets.map((set, i) => {
        const gradient = CARD_GRADIENTS[i % CARD_GRADIENTS.length]
        return (
          <Link
            key={set.id}
            href={`/study-sets/${set.id}`}
            className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
            <div className="relative p-6">
              <div className="text-3xl mb-3">📖</div>
              <h3 className="font-bold text-gray-800 text-base leading-snug line-clamp-2">{set.title}</h3>
              <p className="mt-2 text-xs text-gray-600">
                {new Date(set.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
