import { Asset } from "@/lib/mock-data";
import { X, ExternalLink, Tag, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ASSET_TYPES: { value: Asset['type']; label: string }[] = [
  { value: 'handout', label: 'Handout' },
  { value: 'map', label: 'Map' },
  { value: 'letter', label: 'Letter' },
  { value: 'artefact', label: 'Artefact' },
  { value: 'clue', label: 'Clue' },
];

const typeColors: Record<string, string> = {
  map: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  letter: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  clue: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  handout: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  artefact: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
};

interface AssetPreviewProps {
  asset: Asset | null;
  onClose: () => void;
  onUpdateType?: (assetId: string, type: Asset['type']) => void;
  onDeleteAsset?: (assetId: string) => void;
}

export function AssetPreview({ asset, onClose, onUpdateType, onDeleteAsset }: AssetPreviewProps) {
  if (!asset) return null;

  const openInNewTab = () => {
    if (asset.imageUrl) {
      window.open(asset.imageUrl, '_blank');
    }
  };

  return (
    <AnimatePresence>
      {asset && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-background/90 backdrop-blur-md" />

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative max-w-4xl w-full max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-display text-xl font-bold">{asset.title}</h2>
                {asset.description && (
                  <p className="text-sm text-muted-foreground mt-0.5">{asset.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                {onDeleteAsset && (
                  <button
                    onClick={() => onDeleteAsset(asset.id)}
                    className="p-2 rounded-lg bg-destructive/20 hover:bg-destructive/40 transition-colors btn-press"
                    title="Delete asset"
                  >
                    <Trash2 className="w-5 h-5 text-destructive" />
                  </button>
                )}
                {asset.imageUrl && (
                  <button
                    onClick={openInNewTab}
                    className="p-2 rounded-lg bg-surface card-hover btn-press"
                    title="Open in new tab"
                  >
                    <ExternalLink className="w-5 h-5 text-muted-foreground" />
                  </button>
                )}
                <button onClick={onClose} className="p-2 rounded-lg bg-surface card-hover btn-press">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </div>

            {onUpdateType && (
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-4 h-4 text-muted-foreground" />
                <div className="flex flex-wrap gap-1.5">
                  {ASSET_TYPES.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => onUpdateType(asset.id, value)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-all btn-press ${
                        asset.type === value
                          ? typeColors[value]
                          : 'bg-surface border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {asset.imageUrl ? (
              <div className="flex-1 min-h-0 rounded-2xl overflow-hidden bg-surface">
                <img
                  src={asset.imageUrl}
                  alt={asset.title}
                  className="w-full h-full object-contain max-h-[75vh] cursor-zoom-in"
                  onClick={openInNewTab}
                />
              </div>
            ) : (
              <div className="flex-1 min-h-[300px] rounded-2xl bg-surface flex items-center justify-center">
                <p className="text-muted-foreground">No image available</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
