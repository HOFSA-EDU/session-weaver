import { useState, useRef } from "react";
import { Asset } from "@/lib/mock-data";
import { Upload, Send, Map, FileText, Search as SearchIcon, Eye, Users, User, FolderPlus, Folder, ArrowLeft, Trash2 } from "lucide-react";
import { AssetPreview } from "@/components/AssetPreview";

interface AssetLibraryProps {
  assets: Asset[];
  onUpload?: () => void;
  onSendAsset?: (assetId: string) => void;
  onUpdateType?: (assetId: string, type: Asset['type']) => void;
  onDeleteAsset?: (assetId: string) => void;
  onMoveToFolder?: (assetId: string, folder: string | null) => void;
  onCreateFolder?: (folderName: string) => void;
}

const typeIcons: Record<string, React.ElementType> = {
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
  artefact: 'bg-rose-500/20 text-rose-400',
};

export function AssetLibrary({ assets, onUpload, onSendAsset, onUpdateType, onDeleteAsset, onMoveToFolder, onCreateFolder }: AssetLibraryProps) {
  const [previewAsset, setPreviewAsset] = useState<Asset | null>(null);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [dragOverFolder, setDragOverFolder] = useState<string | null | undefined>(undefined);
  const dragAssetId = useRef<string | null>(null);

  const folders = [...new Set(assets.map(a => a.folder).filter((f): f is string => !!f))];

  const visibleAssets = currentFolder
    ? assets.filter(a => a.folder === currentFolder)
    : assets.filter(a => !a.folder);

  const handleCreateFolder = () => {
    const name = newFolderName.trim();
    if (!name) return;
    onCreateFolder?.(name);
    setNewFolderName("");
    setShowNewFolder(false);
  };

  const handleDeleteAsset = (assetId: string) => {
    onDeleteAsset?.(assetId);
    setConfirmDeleteId(null);
    if (previewAsset?.id === assetId) setPreviewAsset(null);
  };

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, assetId: string) => {
    dragAssetId.current = assetId;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', assetId);
  };

  const handleFolderDragOver = (e: React.DragEvent, folder: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverFolder(folder);
  };

  const handleRootDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverFolder(null);
  };

  const handleFolderDrop = (e: React.DragEvent, folder: string) => {
    e.preventDefault();
    setDragOverFolder(undefined);
    const assetId = dragAssetId.current;
    if (assetId && onMoveToFolder) {
      onMoveToFolder(assetId, folder);
    }
    dragAssetId.current = null;
  };

  const handleRootDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverFolder(undefined);
    const assetId = dragAssetId.current;
    if (assetId && onMoveToFolder) {
      onMoveToFolder(assetId, null);
    }
    dragAssetId.current = null;
  };

  const handleDragLeave = () => {
    setDragOverFolder(undefined);
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
          <div className="flex items-center gap-1.5">
            {onCreateFolder && !currentFolder && (
              <button onClick={() => setShowNewFolder(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-hover text-foreground text-xs font-medium card-hover btn-press">
                <FolderPlus className="w-3 h-3" />
              </button>
            )}
            {onUpload && (
              <button onClick={onUpload} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-hover text-foreground text-xs font-medium card-hover btn-press">
                <Upload className="w-3 h-3" /> Upload
              </button>
            )}
          </div>
        </div>

        {/* New folder input */}
        {showNewFolder && (
          <div className="flex items-center gap-2 mb-3">
            <input
              autoFocus
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreateFolder()}
              placeholder="Folder name..."
              className="flex-1 px-3 py-1.5 rounded-lg bg-surface text-sm text-foreground border border-border/30 focus:outline-none focus:border-primary/50"
            />
            <button onClick={handleCreateFolder} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium btn-press">
              Create
            </button>
            <button onClick={() => { setShowNewFolder(false); setNewFolderName(""); }} className="px-2 py-1.5 rounded-lg bg-surface text-muted-foreground text-xs btn-press">
              ✕
            </button>
          </div>
        )}

        {/* Folder grid (only at root level) */}
        {!currentFolder && folders.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-2">
            {folders.map(folder => {
              const count = assets.filter(a => a.folder === folder).length;
              const isDragOver = dragOverFolder === folder;
              return (
                <button
                  key={folder}
                  onClick={() => setCurrentFolder(folder)}
                  onDragOver={(e) => handleFolderDragOver(e, folder)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleFolderDrop(e, folder)}
                  className={`flex items-center gap-2 p-3 rounded-lg bg-surface card-hover btn-press text-left transition-all ${
                    isDragOver ? 'ring-2 ring-primary bg-primary/10 scale-105' : ''
                  }`}
                >
                  <Folder className={`w-5 h-5 shrink-0 transition-colors ${isDragOver ? 'text-primary' : 'text-primary'}`} />
                  <div className="min-w-0">
                    <p className="font-display text-xs font-semibold truncate">{folder}</p>
                    <p className="text-[10px] text-muted-foreground">{count} asset{count !== 1 ? 's' : ''}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Drop zone to move back to root when inside a folder */}
        {currentFolder && onMoveToFolder && (
          <div
            onDragOver={handleRootDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleRootDrop}
            className={`mb-2 p-2.5 rounded-lg border-2 border-dashed text-center text-xs text-muted-foreground transition-all ${
              dragOverFolder === null ? 'border-primary bg-primary/10 text-primary' : 'border-border/30'
            }`}
          >
            Drop here to move to root
          </div>
        )}

        {/* Asset grid */}
        {visibleAssets.length === 0 && folders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground text-sm">No assets stored. Upload maps, letters, or artifacts.</p>
          </div>
        ) : visibleAssets.length === 0 && currentFolder ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground text-sm">This folder is empty.</p>
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
                  draggable={!!onMoveToFolder}
                  onDragStart={(e) => handleDragStart(e, asset.id)}
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

                  {/* Action buttons */}
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

                  {/* Delete confirmation overlay */}
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
        onUpdateType={onUpdateType ? (assetId, type) => {
          onUpdateType(assetId, type);
          if (previewAsset) setPreviewAsset({ ...previewAsset, type });
        } : undefined}
        onDeleteAsset={onDeleteAsset ? (assetId) => {
          handleDeleteAsset(assetId);
        } : undefined}
        folders={folders}
        currentFolder={currentFolder}
        onMoveToFolder={onMoveToFolder}
      />
    </>
  );
}
