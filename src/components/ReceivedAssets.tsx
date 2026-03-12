import { useState, useEffect, useCallback, useRef } from "react";
import { Asset } from "@/lib/mock-data";
import { Map, FileText, Search as SearchIcon, Eye, Sparkles } from "lucide-react";
import { AssetPreview } from "@/components/AssetPreview";

interface ReceivedAssetsProps {
  assets: Asset[];
}

const typeIcons: Record<string, React.ElementType> = {
  map: Map,
  letter: FileText,
  clue: SearchIcon,
  handout: Eye,
};

const SEEN_KEY = 'arcane-table-seen-assets';

function getSeenAssets(): Set<string> {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function markAsSeen(assetId: string) {
  const seen = getSeenAssets();
  seen.add(assetId);
  localStorage.setItem(SEEN_KEY, JSON.stringify([...seen]));
}

export function ReceivedAssets({ assets }: ReceivedAssetsProps) {
  const [previewAsset, setPreviewAsset] = useState<Asset | null>(null);
  const [seenIds, setSeenIds] = useState<Set<string>>(getSeenAssets);
  const prevAssetIds = useRef<Set<string>>(new Set(assets.map(a => a.id)));
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Play notification sound when new assets arrive
  useEffect(() => {
    const currentIds = new Set(assets.map(a => a.id));
    const newIds = assets.filter(a => !prevAssetIds.current.has(a.id) && !seenIds.has(a.id));
    prevAssetIds.current = currentIds;

    if (newIds.length > 0) {
      playAssetChime();
    }
  }, [assets]);

  function playAssetChime() {
    try {
      const ctx = audioCtxRef.current || new AudioContext();
      audioCtxRef.current = ctx;
      const now = ctx.currentTime;

      // Mystical three-note descending chime
      const notes = [880, 659.25, 523.25]; // A5, E5, C5
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, now + i * 0.12);
        gain.gain.linearRampToValueAtTime(0.25, now + i * 0.12 + 0.03);
        gain.gain.linearRampToValueAtTime(0, now + i * 0.12 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 0.4);
      });
    } catch {
      // Audio not available
    }
  }

  const handleOpen = useCallback((asset: Asset) => {
    setPreviewAsset(asset);
    if (!seenIds.has(asset.id)) {
      markAsSeen(asset.id);
      setSeenIds(prev => new Set([...prev, asset.id]));
    }
  }, [seenIds]);

  const unseenCount = assets.filter(a => !seenIds.has(a.id)).length;

  if (assets.length === 0) {
    return (
      <div className="card-surface p-6 text-center">
        <p className="text-muted-foreground text-sm">No assets received yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="card-surface p-4">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wider">Received Assets</h3>
          {unseenCount > 0 && (
            <span className="h-5 px-2 rounded-full bg-primary/20 text-primary text-[10px] font-bold inline-flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" /> {unseenCount} new
            </span>
          )}
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
          {assets.map(asset => {
            const Icon = typeIcons[asset.type] || Eye;
            const isNew = !seenIds.has(asset.id);
            return (
              <div
                key={asset.id}
                onClick={() => handleOpen(asset)}
                className={`flex-shrink-0 w-52 aspect-video rounded-lg bg-surface overflow-hidden relative cursor-pointer snap-start card-hover ${
                  isNew ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''
                }`}
              >
                {asset.imageUrl ? (
                  <img src={asset.imageUrl} alt={asset.title} className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-surface-hover to-surface flex items-center justify-center">
                    <Icon className="w-10 h-10 text-muted-foreground/20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
                {isNew && (
                  <div className="absolute top-2 right-2">
                    <span className="h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold inline-flex items-center gap-0.5">
                      <Sparkles className="w-2.5 h-2.5" /> NEW
                    </span>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h4 className="font-display text-sm font-semibold">{asset.title}</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{asset.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <AssetPreview asset={previewAsset} onClose={() => setPreviewAsset(null)} />
    </>
  );
}
