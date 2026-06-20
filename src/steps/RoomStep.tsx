import { useStore } from '../store';
import type { RoomShape } from '../model/room';
import { Section, DimensionSlider, OptionCards, Toggle } from '../controls/fields';
import { shapeOptions } from '../controls/shared';

export default function RoomStep() {
  const room = useStore((s) => s.room);
  const setRoom = useStore((s) => s.setRoom);

  return (
    <div className="space-y-6">
      <Toggle label="Design within a room" checked={room.enabled} onChange={(v) => setRoom({ enabled: v })} />

      {!room.enabled ? (
        <p className="rounded-xl bg-ivory-50 p-4 text-sm text-ink-muted">
          No problem — we'll show your piece on its own. You can turn this on anytime to see it in
          your space.
        </p>
      ) : (
        <>
          <Section title="Room shape" subtitle="Pick the one closest to your space.">
            <OptionCards<RoomShape> value={room.shape} options={shapeOptions} onChange={(v) => setRoom({ shape: v })} columns={3} />
          </Section>

          <Section title="Measurements">
            <DimensionSlider label="Room width" value={room.width} min={48} max={360} onChange={(v) => setRoom({ width: v })} />
            <DimensionSlider label="Room depth" value={room.length} min={48} max={360} onChange={(v) => setRoom({ length: v })} />
            <DimensionSlider label="Ceiling height" value={room.height} min={84} max={156} onChange={(v) => setRoom({ height: v })} />

            {(room.shape === 'l' || room.shape === 'u') && (
              <>
                <DimensionSlider label="Notch width" value={room.notchW} min={12} max={Math.max(24, room.width - 24)} onChange={(v) => setRoom({ notchW: v })} />
                <DimensionSlider label="Notch depth" value={room.notchL} min={12} max={Math.max(24, room.length - 24)} onChange={(v) => setRoom({ notchL: v })} />
              </>
            )}
            {room.shape === 'alcove' && (
              <>
                <DimensionSlider label="Alcove width" value={room.recessW} min={18} max={Math.max(24, room.width - 24)} onChange={(v) => setRoom({ recessW: v })} />
                <DimensionSlider label="Alcove depth" value={room.recessD} min={6} max={36} onChange={(v) => setRoom({ recessD: v })} />
              </>
            )}
            {room.shape === 'corner' && (
              <DimensionSlider label="Corner cut" value={room.corner} min={12} max={Math.max(18, Math.min(room.width, room.length) - 12)} onChange={(v) => setRoom({ corner: v })} />
            )}
          </Section>
        </>
      )}
    </div>
  );
}
