import { useState, useEffect } from "react";
import { Asset } from "@/lib/mock-data";
import { X, ExternalLink, Tag, Trash2, FileText } from "lucide-react";
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
  onUpdateDescription?: (assetId: string, description: string) => void;
}

export function AssetPreview({ asset, onClose, onUpdateType, onDeleteAsset, onUpdateDescription }: AssetPreviewProps) {
  const [editingDesc, setEditingDesc] = useState(false);
  const [descDraft, setDescDraft] = useState("");

  // Sync draft when asset changes
  useEffect(() => {
    if (asset) {
      setDescDraft(asset.description || "");
      setEditingDesc(false);
    }
  }, [asset?.id, asset?.description]);

  if (!asset) return null;

  const openInNewTab = () => {
    if (asset.imageUrl) window.open(asset.imageUrl, '_blank');
  };

  const handleSaveDesc = () => {
    if (onUpdateDescription && descDraft !== (asset.description || "")) {
      onUpdateDescription(asset.id, descDraft);
    }
    setEditingDesc(false);
  };

  const isDM = !!onUpdateDescription;

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
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-display text-xl font-bold">{asset.title}</h2>
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

            {/* Type Labels (DM only) */}
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

            {/* Information field */}
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-1.5">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Information</span>
              </div>
              {isDM && editingDesc ? (
                <div className="space-y-2">
                  <textarea
                    autoFocus
                    value={descDraft}
                    onChange={e => setDescDraft(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Escape') setEditingDesc(false); }}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg bg-surface text-sm text-foreground border border-border/30 focus:outline-none focus:border-primary/50 resize-none"
                    placeholder="Add information about this asset..."
                  />
                  <div className="flex gap-2">
                    <button onClick={handleSaveDesc} className="px-3 py-1 rounded-lg bg-primary text-primary-foreground text-xs font-medium btn-press">
                      Save
                    </button>
                    <button onClick={() => { setEditingDesc(false); setDescDraft(asset.description || ""); }} className="px-3 py-1 rounded-lg bg-surface text-muted-foreground text-xs btn-press">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : isDM ? (
                <div
                  onClick={() => setEditingDesc(true)}
                  className="px-3 py-2 rounded-lg bg-surface text-sm cursor-pointer card-hover min-h-[2.5rem]"
                >
                  {asset.description ? (
                    <p className="text-foreground whitespace-pre-wrap">{asset.description}</p>
                  ) : (
                    <p className="text-muted-foreground italic">Click to add information...</p>
                  )}
                </div>
              ) : asset.description ? (
                <div className="px-3 py-2 rounded-lg bg-surface text-sm">
                  <p className="text-foreground whitespace-pre-wrap">{asset.description}</p>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm italic px-3">No information provided.</p>
              )}
            </div>

            {/* Image */}
            {asset.imageUrl ? (
              <div className="flex-1 min-h-0 rounded-2xl overflow-hidden bg-surface">
                <img
                  src={asset.imageUrl}
                  alt={asset.title}
                  className="w-full h-full object-contain max-h-[65vh] cursor-zoom-in"
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
