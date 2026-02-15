import type { RefObject } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import type { DragEvent, RefObject } from "react";

interface MapPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mapQuery: string;
  setMapQuery: (value: string) => void;
  mapResults: Array<{ display_name: string; lat: string; lon: string }>;
  mapSearching: boolean;
  onSearch: () => void;
  onSelect: (lat: string, lon: string) => void;
  mapRef: RefObject<HTMLDivElement>;
  onMapDragOver: (event: DragEvent<HTMLDivElement>) => void;
  onMapDrop: (event: DragEvent<HTMLDivElement>) => void;
  onPinDragStart: (event: DragEvent<HTMLDivElement>) => void;
  onConfirm: () => void;
  confirmDisabled?: boolean;
  pendingLabel?: string;
  pinEnabled?: boolean;
  validationError?: string | null;
}

const MapPickerDialog = ({
  open,
  onOpenChange,
  mapQuery,
  setMapQuery,
  mapResults,
  mapSearching,
  onSearch,
  onSelect,
  mapRef,
  onMapDragOver,
  onMapDrop,
  onPinDragStart,
  onConfirm,
  confirmDisabled,
  pendingLabel,
  pinEnabled = false,
  validationError,
}: MapPickerDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-3xl">
      <DialogHeader>
        <DialogTitle>Pick Location</DialogTitle>
        <DialogDescription>
          Search for a place or click on the map to set latitude and longitude.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={mapQuery}
              onChange={(e) => setMapQuery(e.target.value)}
              placeholder="Search location..."
              className="w-full h-9 pl-9 pr-3 text-sm rounded-md border border-input bg-background"
            />
          </div>
          <Button type="button" variant="outline" onClick={onSearch} disabled={mapSearching}>
            {mapSearching ? "Searching..." : "Search"}
          </Button>
        </div>
        {mapResults.length > 0 && (
          <div className="max-h-40 overflow-auto border rounded-md">
            {mapResults.map((item, idx) => (
              <button
                key={`${item.lat}-${item.lon}-${idx}`}
                type="button"
                onClick={() => onSelect(item.lat, item.lon)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-muted"
              >
                {item.display_name}
              </button>
            ))}
          </div>
        )}
        <div className="h-[360px] rounded-md overflow-hidden border border-border relative">
          <div className="absolute top-3 left-3 z-10 flex flex-col items-center gap-2">
            <div className="text-[11px] font-medium text-muted-foreground bg-background/90 px-2 py-1 rounded-md border border-border">
              Drag pin
            </div>
            <div
              className={`h-9 w-9 rounded-full text-[10px] font-semibold tracking-wide flex items-center justify-center shadow-md ${
                pinEnabled
                  ? "bg-foreground text-background cursor-grab active:cursor-grabbing"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
              draggable={pinEnabled}
              onDragStart={pinEnabled ? onPinDragStart : undefined}
              title={pinEnabled ? "Drag to place pin" : "Double-click map to place first pin"}
            >
              PIN
            </div>
          </div>
          <div
            ref={mapRef}
            className="w-full h-full"
            onDragOver={onMapDragOver}
            onDrop={onMapDrop}
          />
        </div>
        {pendingLabel && (
          <div className="text-xs text-muted-foreground">
            Pending location: <span className="font-medium text-foreground">{pendingLabel}</span>
          </div>
        )}
        {validationError && (
          <div className="text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">
            {validationError}
          </div>
        )}
      </div>
      <DialogFooter>
        <Button type="button" onClick={onConfirm} disabled={confirmDisabled}>
          Confirm lat/lon
        </Button>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Close
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default MapPickerDialog;
