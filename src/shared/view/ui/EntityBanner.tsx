import { useRef, useState } from 'react';
import { X } from 'lucide-react';

type EntityBannerProps = {
  imageUrl: string | null;
  name: string;
  mode: 'create' | 'edit' | 'view';
  canGenerate: boolean;
  onUpload: (file: File) => void;
  onRemove: () => void;
  onGenerate: () => void;
};

export function EntityBanner({
  imageUrl,
  name,
  mode,
  canGenerate,
  onUpload,
  onRemove,
  onGenerate,
}: EntityBannerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const isEditable = mode === 'create' || mode === 'edit';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
      e.target.value = '';
    }
  };

  return (
    <>
      <div className="group relative w-full h-56 overflow-hidden rounded-md bg-zinc-900">
        {imageUrl && (
          <img
            src={imageUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        )}

        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent px-6 py-4">
          <span className="text-3xl font-bold text-white">{name || '\u00A0'}</span>
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/0 opacity-0 transition-all group-hover:bg-black/50 group-hover:opacity-100">
          {imageUrl && (
            <button
              type="button"
              className="text-sm font-medium text-white hover:underline"
              onClick={() => setLightboxOpen(true)}>
              View image
            </button>
          )}

          {isEditable && (
            <>
              <button
                type="button"
                className="text-sm font-medium text-white hover:underline"
                onClick={() => inputRef.current?.click()}>
                Upload new image
              </button>

              {imageUrl && (
                <button
                  type="button"
                  className="text-sm font-medium text-white hover:underline"
                  onClick={onRemove}>
                  Remove image
                </button>
              )}

              {canGenerate && (
                <button
                  type="button"
                  className="text-sm font-medium text-white hover:underline"
                  onClick={onGenerate}>
                  Generate image
                </button>
              )}
            </>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png"
          className="sr-only"
          onChange={handleFileChange}
        />
      </div>

      {lightboxOpen && imageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setLightboxOpen(false)}>
          <button
            type="button"
            className="absolute top-4 right-4 text-white hover:text-white/70"
            onClick={() => setLightboxOpen(false)}>
            <X className="h-6 w-6" />
          </button>
          <img
            src={imageUrl}
            alt=""
            className="max-h-[90vh] max-w-[90vw] rounded-md object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
