import { useStore } from '../store';
import type { RoomShape } from '../model/room';
import { Section, DimensionSlider, OptionCards, Toggle } from '../controls/fields';
import { shapeOptions } from '../controls/shared';

export default function RoomStep() {
  const room = useStore((s) => s.room);
  const setRoom = useStore((s) => s.setRoom);
  const startBlankRoom = useStore((s) => s.startBlankRoom);
  const startDemoRoom = useStore((s) => s.startDemoRoom);

  return (
    <div className="space-y-6">
      <div className="rounded-[24px] border border-champagne/30 bg-warmWhite/85 p-4 shadow-soft">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div><h3 className="text-sm font-black text-ink">Planning mode</h3><p className="mt-1 text-xs leading-5 text-ink-muted">Most House of Nook products start with one wall. Use a full room only when openings or returns matter.</p></div>
        </div>
        <div className="space-y-3"><Toggle label="Show the surrounding wall / room" checked={room.enabled} onChange={(v) => setRoom({ enabled: v })} /><div className="flex flex-wrap gap-2"><button onClick={startBlankRoom} className="rounded-full bg-walnut px-4 py-2 text-xs font-bold text-porcelain shadow-soft">Start blank</button><button onClick={startDemoRoom} className="rounded-full border border-brass/40 bg-warmWhite px-4 py-2 text-xs font-bold text-walnut">Load sample</button></div></div>
      </div>

      {!room.enabled ? (
        <p className="rounded-2xl border border-champagne/30 bg-porcelain p-4 text-sm leading-6 text-ink-muted">Room preview is off. Your nook will show as a standalone shippable module, which is often best for product planning.</p>
      ) : (
        <>
          <Section title="Space shape" subtitle="Choose a simple shape. For most shippable modules, Rectangle is enough.">
            <OptionCards<RoomShape> value={room.shape} options={shapeOptions} onChange={(v) => setRoom({ shape: v, openings: [] })} columns={3} />
          </Section>

          <Section title="Finished dimensions" subtitle="These are planning dimensions only; final production still needs confirmation.">
            <DimensionSlider label="Wall / room width" value={room.width} min={48} max={240} onChange={(v) => setRoom({ width: v })} />
            <DimensionSlider label="Depth" value={room.length} min={24} max={180} onChange={(v) => setRoom({ length: v })} />
            <DimensionSlider label="Ceiling height" value={room.height} min={84} max={120} onChange={(v) => setRoom({ height: v })} />
            {(room.shape === 'l' || room.shape === 'u') && <><DimensionSlider label="Return / notch width" value={room.notchW} min={12} max={Math.max(24, room.width - 24)} onChange={(v) => setRoom({ notchW: v })} /><DimensionSlider label="Return / notch depth" value={room.notchL} min={12} max={Math.max(24, room.length - 24)} onChange={(v) => setRoom({ notchL: v })} /></>}
            {room.shape === 'alcove' && <><DimensionSlider label="Alcove width" value={room.recessW} min={18} max={Math.max(24, room.width - 24)} onChange={(v) => setRoom({ recessW: v })} /><DimensionSlider label="Alcove depth" value={room.recessD} min={6} max={36} onChange={(v) => setRoom({ recessD: v })} /></>}
            {room.shape === 'corner' && <DimensionSlider label="Corner cut" value={room.corner} min={12} max={Math.max(18, Math.min(room.width, room.length) - 12)} onChange={(v) => setRoom({ corner: v })} />}
          </Section>
        </>
      )}
    </div>
  );
}
