import { Asset } from "@/lib/mock-data";
import { Map, FileText, Search as SearchIcon, Eye } from "lucide-react";

interface ReceivedAssetsProps {
  assets: Asset[];
}

const typeIcons = {
  map: Map,
  letter: FileText,
  clue: SearchIcon,
  handout: Eye,
};

export function ReceivedAssets({ assets }: ReceivedAssetsProps) {
  if (assets.length === 0) {
    return (
      <div className="card-surface p-6 text-center">
        <p className="text-muted-foreground text-sm">No assets received yet.</p>
      </div>
    );
  }

  return (
    <div className="card-surface p-4">
      <h3 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Received Assets</h3>
      <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
        {assets.map(asset => {
          const Icon = typeIcons[asset.type];
          return (
            <div
              key={asset.id}
              className="flex-shrink-0 w-52 aspect-video rounded-lg bg-surface overflow-hidden relative cursor-pointer snap-start card-hover"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-surface-hover to-surface flex items-center justify-center">
                <Icon className="w-10 h-10 text-muted-foreground/20" />
              </div>
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
  );
}
