import { Asset } from "@/lib/mock-data";
import { X, ExternalLink, ZoomIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AssetPreviewProps {
  asset: Asset | null;
  onClose: () => void;
}

export function AssetPreview({ asset, onClose }: AssetPreviewProps) {
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
          {/* Backdrop */}
          <div className="absolute inset-0 bg-background/90 backdrop-blur-md" />

          {/* Content */}
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
                {asset.description && (
                  <p className="text-sm text-muted-foreground mt-0.5">{asset.description}</p>
                )}
              </div>
              <div className="flex gap-2">
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

            {/* Image */}
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
