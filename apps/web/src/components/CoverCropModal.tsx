'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';

const Cropper = dynamic(() => import('react-easy-crop'), { ssr: false });

type Area = { x: number; y: number; width: number; height: number };

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', reject);
    img.src = url;
  });
}

async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No 2d context');
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.9);
  });
}

export function CoverCropModal({
  imageSrc,
  onComplete,
  onCancel,
}: {
  imageSrc: string;
  onComplete: (blob: Blob) => void;
  onCancel: () => void;
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (!croppedAreaPixels || !imageSrc) return;
    const blob = await getCroppedImg(imageSrc, croppedAreaPixels);
    onComplete(blob);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex flex-col">
      <div className="flex-1 relative h-64 sm:h-80">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          rotation={0}
          aspect={3 / 1}
          minZoom={1}
          maxZoom={3}
          cropShape="rect"
          zoomSpeed={1}
          restrictPosition={true}
          showGrid={false}
          keyboardStep={1}
          style={{}}
          classes={{}}
          mediaProps={{}}
          cropperProps={{}}
          onCropChange={setCrop}
          onCropComplete={onCropComplete}
          onCropAreaChange={onCropComplete}
          onZoomChange={setZoom}
        />
      </div>
      <div className="p-4 bg-stone-900 flex flex-col gap-3">
        <label className="text-white text-sm font-medium">Zoom</label>
        <input
          type="range"
          min={1}
          max={3}
          step={0.1}
          value={zoom}
          onChange={(e) => setZoom(parseFloat(e.target.value))}
          className="w-full"
        />
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl border border-stone-600 text-stone-300 font-medium hover:bg-stone-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-3 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
