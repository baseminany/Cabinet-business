import { useState } from 'react';

export default function Img({ name, alt, className = '', label }: { name: string; alt: string; className?: string; label?: string }) {
  const [failed, setFailed] = useState(false);
  const src = `${import.meta.env.BASE_URL}images/${name}`;

  if (failed) {
    return (
      <div className={`relative overflow-hidden bg-[linear-gradient(145deg,#efe5d5,#d8c4aa)] ${className}`}>
        <div className="absolute inset-0 opacity-80" style={{ background: 'radial-gradient(60% 60% at 20% 15%, rgba(255,255,255,.65), transparent 60%), linear-gradient(90deg, rgba(75,46,32,.14) 1px, transparent 1px)' }} />
        <div className="absolute bottom-[16%] left-[10%] right-[10%] h-[42%] rounded-t-md bg-[#b99263] shadow-xl ring-1 ring-black/10" />
        <div className="absolute bottom-[16%] left-[42%] h-[42%] w-[22%] bg-[#efece4] ring-1 ring-black/10" />
        <div className="absolute bottom-[56%] left-[10%] right-[10%] h-[16%] bg-[#f4efe7] shadow ring-1 ring-black/10" />
        <div className="absolute bottom-[9%] left-[10%] right-[10%] h-[4%] bg-[#4b2e20]/30" />
        <span className="absolute left-4 top-4 rounded-full bg-white/75 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-walnut shadow-sm backdrop-blur">{label ?? alt}</span>
      </div>
    );
  }

  return <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className={`object-cover ${className}`} />;
}
