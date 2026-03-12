import { useState, useRef } from "react";
import { Asset } from "@/lib/mock-data";
import { Upload, Send, Map, FileText, Search as SearchIcon, Eye, Users, User, Folder, ArrowLeft, Trash2 } from "lucide-react";
import { AssetPreview } from "@/components/AssetPreview";

interface AssetLibraryProps {
  assets: Asset[];
  onUpload?: () => void;
  onSendAsset?: (assetId: string) => void;
  onUpdateType?: (assetId: string, type: Asset['type']) => void;
  onDeleteAsset?: (assetId: string) => void;
  onMoveToFolder?: (assetId: string, folder: string | null) => void;
  onUpdateDescription?: (assetId: string, description: string) => void;
}

const typeIcons: Record<string, React.ElementType> = {
  map: Map,
  letter: FileText,
  clue: SearchIcon,
  handout: Eye,
  artefact: Eye,
};

const typeColors: Record<string, string> = {
  map: 'bg-blue-500/20 text-blue-400',
  letter: 'bg-amber-500/20 text-amber-400',
  clue: 'bg-emerald-500/20 text-emerald-400',
  handout: 'bg-purple-500/20 text-purple-400',
  artefact: 'bg-rose-500/20 text-rose-400',
};

const DEFAULT_FOLDERS = [
  { name: 'Maps', type: 'map' as const },
  { name: 'Letters', type: 'letter' as const },
  { name: 'Artefacts', type: 'artefact' as const },
  { name: 'Clues', type: 'clue' as const },
];

export function AssetLibrary({ assets, onUpload, onSendAsset, onUpdateType, onDeleteAsset, onMoveToFolder, onUpdateDescription }: AssetLibraryProps) {
  const [previewAsset, setPreviewAsset] = useState<Asset | null>(null);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Root shows only handouts (uncategorized). Folder views show assets of that type.
  const currentFolderDef = DEFAULT_FOLDERS.find(f => f.name === currentFolder);
  const visibleAssets = currentFolderDef
    ? assets.filter(a => a.type === currentFolderDef.type)
    : assets.filter(a => a.type === 'handout');

  const handleDeleteAsset = (assetId: string) => {
    onDeleteAsset?.(assetId);
    setConfirmDeleteId(null);
    if (previewAsset?.id === assetId) setPreviewAsset(null);
  };

  // When type changes, asset auto-moves to its folder (or root if handout)
  const handleUpdateType = (assetId: string, type: Asset['type']) => {
    onUpdateType?.(assetId, type);
    // Update preview in-place
    if (previewAsset?.id === assetId) setPreviewAsset({ ...previewAsset, type });
  };

  return (
    <>
      <div className="card-surface p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {currentFolder && (
              <button onClick={() => setCurrentFolder(null)} className="p-1 rounded-lg card-hover btn-press">
                <ArrowLeft className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
            <h3 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {currentFolder || 'Assets'}
            </h3>
          </div>
          {onUpload && !currentFolder && (
            <button onClick={onUpload} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-hover text-foreground text-xs font-medium card-hover btn-press">
              <Upload className="w-3 h-3" /> Upload
            </button>
          )}
        </div>

        {/* Folder grid (only at root level) */}
        {!currentFolder && (
          <div className="grid grid-cols-2 gap-2 mb-2">
            {DEFAULT_FOLDERS.map(folder => {
              const count = assets.filter(a => a.type === folder.type).length;
              const FolderIcon = typeIcons[folder.type] || Folder;
              return (
                <button
                  key={folder.name}
                  onClick={() => setCurrentFolder(folder.name)}
                  className="flex items-center gap-2 p-3 rounded-lg bg-surface card-hover btn-press text-left"
                >
                  <Folder className="w-5 h-5 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="font-display text-xs font-semibold truncate">{folder.name}</p>
                    <p className="text-[10px] text-muted-foreground">{count} asset{count !== 1 ? 's' : ''}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Asset grid */}
        {visibleAssets.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground text-sm">
              {currentFolder ? 'No assets in this folder.' : 'No uncategorized assets. Upload to add handouts.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {visibleAssets.map(asset => {
              const Icon = typeIcons[asset.type] || Eye;
              const sharedCount = asset.sharedWith.includes('all') ? 'All' : asset.sharedWith.length;
              const isConfirmingDelete = confirmDeleteId === asset.id;
              return (
                <div
                  key={asset.id}
                  onClick={() => !isConfirmingDelete && setPreviewAsset(asset)}
                  className="group relative aspect-video rounded-lg bg-surface overflow-hidden card-hover cursor-pointer"
                >
                  {asset.imageUrl ? (
                    <img src={asset.imageUrl} alt={asset.title} className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-surface-hover to-surface flex items-center justify-center">
                      <Icon className="w-8 h-8 text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-2.5">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`h-5 px-1.5 rounded-full text-[10px] font-medium inline-flex items-center ${typeColors[asset.type] || typeColors.handout}`}>
                        {asset.type}
                      </span>
                      <span className={`h-5 px-1.5 rounded-full text-[10px] font-medium inline-flex items-center gap-0.5 ${
                        sharedCount === 0 ? 'bg-muted/20 text-muted-foreground' : 'bg-primary/20 text-primary'
                      }`}>
                        {sharedCount === 'All' ? <><Users className="w-2.5 h-2.5" /> All</> : <><User className="w-2.5 h-2.5" /> {sharedCount}</>}
                      </span>
                    </div>
                    <h4 className="font-display text-xs font-semibold truncate">{asset.title}</h4>
                  </div>

                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {onDeleteAsset && !isConfirmingDelete && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(asset.id); }}
                        className="p-1.5 rounded-lg bg-destructive/80 text-destructive-foreground btn-press"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                    {onSendAsset && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onSendAsset(asset.id); }}
                        className="p-1.5 rounded-lg bg-primary text-primary-foreground btn-press"
                      >
                        <Send className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {isConfirmingDelete && (
                    <div
                      className="absolute inset-0 bg-background/90 flex flex-col items-center justify-center gap-2 z-10"
                      onClick={e => e.stopPropagation()}
                    >
                      <p className="text-xs text-foreground font-medium">Delete this asset?</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDeleteAsset(asset.id)}
                          className="px-3 py-1 rounded-lg bg-destructive text-destructive-foreground text-xs font-medium btn-press"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-3 py-1 rounded-lg bg-surface text-muted-foreground text-xs btn-press"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AssetPreview
        asset={previewAsset}
        onClose={() => setPreviewAsset(null)}
        onUpdateType={onUpdateType ? handleUpdateType : undefined}
        onDeleteAsset={onDeleteAsset ? handleDeleteAsset : undefined}
        onUpdateDescription={onUpdateDescription ? (assetId, desc) => {
          onUpdateDescription(assetId, desc);
          if (previewAsset?.id === assetId) setPreviewAsset({ ...previewAsset!, description: desc });
        } : undefined}
      />
    </>
  );
}
