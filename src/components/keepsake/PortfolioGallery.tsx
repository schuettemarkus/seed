import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Heart, Image, Mic, FileText, Star, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PortfolioEntry, PortfolioEntryType } from '@/types'

const TYPE_ICONS: Record<PortfolioEntryType, typeof Image> = {
  drawing: Image,
  voice: Mic,
  text: FileText,
  milestone: Trophy,
  parent_favorite: Star,
}

const TYPE_LABELS: Record<PortfolioEntryType, string> = {
  drawing: 'Drawing',
  voice: 'Voice',
  text: 'Writing',
  milestone: 'Milestone',
  parent_favorite: 'Favorite',
}

interface Props {
  childId: string
  childName: string
  parentView?: boolean
}

export function PortfolioGallery({ childId, childName, parentView = true }: Props) {
  const [entries, setEntries] = useState<PortfolioEntry[]>([])
  const [filter, setFilter] = useState<PortfolioEntryType | 'all'>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('portfolio_entries')
      .select('*')
      .eq('child_id', childId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setEntries((data as PortfolioEntry[]) ?? [])
        setLoading(false)
      })
  }, [childId])

  async function toggleFavorite(entryId: string, current: boolean) {
    await supabase
      .from('portfolio_entries')
      .update({ is_parent_favorite: !current })
      .eq('id', entryId)
    setEntries((prev) =>
      prev.map((e) => (e.id === entryId ? { ...e, is_parent_favorite: !current } : e)),
    )
  }

  const filtered = filter === 'all' ? entries : entries.filter((e) => e.entry_type === filter)
  const favorites = entries.filter((e) => e.is_parent_favorite)

  return (
    <div className="space-y-6">
      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setFilter('all')}
          className={cn(
            'rounded-full px-4 py-1.5 text-xs font-medium whitespace-nowrap transition-colors',
            filter === 'all' ? 'bg-sage text-white' : 'bg-surface border border-border text-muted hover:border-sage/50',
          )}
        >
          All ({entries.length})
        </button>
        {(Object.keys(TYPE_LABELS) as PortfolioEntryType[]).map((type) => {
          const count = entries.filter((e) => e.entry_type === type).length
          if (count === 0) return null
          return (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={cn(
                'rounded-full px-4 py-1.5 text-xs font-medium whitespace-nowrap transition-colors',
                filter === type ? 'bg-sage text-white' : 'bg-surface border border-border text-muted hover:border-sage/50',
              )}
            >
              {TYPE_LABELS[type]} ({count})
            </button>
          )
        })}
      </div>

      {/* Favorites section */}
      {parentView && favorites.length > 0 && filter === 'all' && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-terracotta fill-terracotta" />
              <CardTitle>Favorites</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {favorites.slice(0, 6).map((entry) => (
                <PortfolioCard key={entry.id} entry={entry} onToggleFavorite={parentView ? toggleFavorite : undefined} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gallery grid */}
      {loading ? (
        <div className="text-muted text-center py-12">Loading portfolio...</div>
      ) : filtered.length === 0 ? (
        <Card className="text-center py-12">
          <Image className="h-10 w-10 text-muted mx-auto mb-4" />
          <h2 className="font-display text-lg font-semibold mb-2">No entries yet</h2>
          <p className="text-sm text-muted max-w-sm mx-auto">
            As {childName} completes lessons, their drawings, voice recordings,
            writing, and milestones will appear here.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filtered.map((entry) => (
            <PortfolioCard key={entry.id} entry={entry} onToggleFavorite={parentView ? toggleFavorite : undefined} />
          ))}
        </div>
      )}
    </div>
  )
}

function PortfolioCard({
  entry,
  onToggleFavorite,
}: {
  entry: PortfolioEntry
  onToggleFavorite?: (id: string, current: boolean) => void
}) {
  const Icon = TYPE_ICONS[entry.entry_type] ?? FileText

  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden group">
      {/* Preview area */}
      <div className="aspect-square bg-background flex items-center justify-center relative">
        {entry.storage_path ? (
          <img
            src={entry.storage_path}
            alt={entry.title ?? 'Portfolio entry'}
            className="w-full h-full object-cover"
          />
        ) : (
          <Icon className="h-10 w-10 text-border" />
        )}

        {/* Favorite button */}
        {onToggleFavorite && (
          <button
            onClick={() => onToggleFavorite(entry.id, entry.is_parent_favorite)}
            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity touch-target"
          >
            <Heart
              className={cn(
                'h-4 w-4',
                entry.is_parent_favorite ? 'text-terracotta fill-terracotta' : 'text-muted',
              )}
            />
          </button>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-xs font-medium truncate">{entry.title ?? TYPE_LABELS[entry.entry_type]}</p>
        {entry.caption && <p className="text-xs text-muted truncate mt-0.5">{entry.caption}</p>}
        <p className="text-[10px] text-muted mt-1">
          {new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </p>
      </div>
    </div>
  )
}
