import { Asset } from "@/lib/mock-data";
import { Upload, Send, Map, FileText, Search as SearchIcon, Eye } from "lucide-react";

interface AssetLibraryProps {
  assets: Asset[];
  onUpload?: () => void;
  onSendAsset?: (assetId: string) => void;
}

const typeIcons = {
  map: Map,
  letter: FileText,
  clue: SearchIcon,
  handout: Eye,
};

const typeColors: Record<string, string> = {
  map: 'bg-blue-500/20 text-blue-400',
  letter: 'bg-amber-500/20 text-amber-400',
  clue: 'bg-emerald-500/20 text-emerald-400',
  handout: 'bg-purple-500/20 text-purple-400',
};

export function AssetLibrary({ assets, onUpload, onSendAsset }: AssetLibraryProps) {
  return (
    <div className="card-surface p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wider">Assets</h3>
        {onUpload && (
          <button onClick={onUpload} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-hover text-foreground text-xs font-medium card-hover btn-press">
            <Upload className="w-3 h-3" /> Upload
          </button>
        )}
      </div>

      {assets.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground text-sm">No assets stored. Upload maps, letters, or artifacts.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {assets.map(asset => {
            const Icon = typeIcons[asset.type];
            return (
              <div
                key={asset.id}
                className="group relative aspect-video rounded-lg bg-surface overflow-hidden card-hover cursor-pointer"
              >
                {asset.imageUrl ? (
                  <img src={asset.imageUrl} alt={asset.title} className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-surface-hover to-surface flex items-center justify-center">
                    <Icon className="w-8 h-8 text-muted-foreground/30" />
                  </div>
                )}
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-2.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={`h-5 px-1.5 rounded-full text-[10px] font-medium inline-flex items-center ${typeColors[asset.type]}`}>
                      {asset.type}
                    </span>
                  </div>
                  <h4 className="font-display text-xs font-semibold truncate">{asset.title}</h4>
                </div>
                {/* Send button on hover */}
                {onSendAsset && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onSendAsset(asset.id); }}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-primary text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity btn-press"
                  >
                    <Send className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
