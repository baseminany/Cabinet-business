import { useState } from 'react';

// Image slot. Loads /images/<name> (drop real photos into public/images/). Until
// the file exists it shows a clean, intentional placeholder — never beige.
export default function Img({ name, alt, className = '', label }: { name: string; alt: string; className?: string; label?: string }) {
  const [failed, setFailed] = useState(false);
  const src = `${import.meta.env.BASE_URL}images/${name}`;
  if (failed) {
    return (
      <div className={`flex items-center justify-center bg-neutral-100 ${className}`}>
        <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-neutral-400">{label ?? 'Image'}</span>
      </div>
    );
  }
  return <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className={`object-cover ${className}`} />;
}
