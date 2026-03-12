import { useState } from "react";
import { Asset } from "@/lib/mock-data";
import { Map, FileText, Search as SearchIcon, Eye } from "lucide-react";
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

export function ReceivedAssets({ assets }: ReceivedAssetsProps) {
  const [previewAsset, setPreviewAsset] = useState<Asset | null>(null);

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
        <h3 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Received Assets</h3>
        <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
          {assets.map(asset => {
            const Icon = typeIcons[asset.type] || Eye;
            return (
              <div
                key={asset.id}
                onClick={() => setPreviewAsset(asset)}
                className="flex-shrink-0 w-52 aspect-video rounded-lg bg-surface overflow-hidden relative cursor-pointer snap-start card-hover"
              >
                {asset.imageUrl ? (
                  <img src={asset.imageUrl} alt={asset.title} className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-surface-hover to-surface flex items-center justify-center">
                    <Icon className="w-10 h-10 text-muted-foreground/20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
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
