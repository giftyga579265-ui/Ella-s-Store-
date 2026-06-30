import React, { useState, useEffect } from "react";
import { MediaFile } from "../types";
import { X, Image as ImageIcon, Video as VideoIcon, Music, ChevronLeft, ChevronRight, Calendar } from "lucide-react";

interface MediaGalleryProps {
  mediaFiles: MediaFile[];
  isOpen: boolean;
  onClose: () => void;
  onLogActivity: (activity: string, type: 'login' | 'cart_addition' | 'purchase' | 'product_view' | 'inquiry' | 'admin_action' | 'user_action') => void;
  username: string;
}

export default function MediaGallery({ mediaFiles, isOpen, onClose, onLogActivity, username }: MediaGalleryProps) {
  const [filter, setFilter] = useState<'all' | 'image' | 'video' | 'audio'>('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      onLogActivity("Opened media gallery", "user_action");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredMedia = filter === 'all' 
    ? mediaFiles 
    : mediaFiles.filter(item => item.type === filter);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    onLogActivity(`Viewed media item: ${filteredMedia[index].title}`, "product_view");
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null && lightboxIndex < filteredMedia.length - 1) {
      setLightboxIndex(lightboxIndex + 1);
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null && lightboxIndex > 0) {
      setLightboxIndex(lightboxIndex - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-neutral-950/95 z-50 overflow-y-auto flex flex-col animate-in fade-in duration-300" id="media-gallery">
      {/* Header */}
      <header className="sticky top-0 bg-neutral-900 border-b border-neutral-800 text-white px-6 py-4 flex justify-between items-center z-10 shadow-lg">
        <h2 className="font-serif text-2xl text-amber-500 tracking-wide flex items-center gap-2">
          <ImageIcon className="w-6 h-6 text-amber-500" />
          Ella's Store Media Gallery
        </h2>
        <button 
          onClick={onClose} 
          className="w-10 h-10 bg-neutral-800 hover:bg-amber-500 hover:text-neutral-900 rounded-full flex items-center justify-center text-white transition-all duration-300"
          id="close-gallery-btn"
        >
          <X className="w-5 h-5" />
        </button>
      </header>

      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 justify-center mb-10">
          {(['all', 'image', 'video', 'audio'] as const).map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 tracking-wider capitalize ${
                filter === type
                  ? "bg-amber-500 text-neutral-900 font-semibold shadow-md shadow-amber-500/20"
                  : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white border border-neutral-700"
              }`}
            >
              {type === 'all' ? 'All Media' : `${type}s`}
            </button>
          ))}
        </div>

        {/* Media Grid */}
        {filteredMedia.length === 0 ? (
          <div className="text-center py-20 text-neutral-400">
            <ImageIcon className="w-16 h-16 mx-auto text-neutral-600 mb-4" />
            <h3 className="text-lg font-serif text-neutral-300 mb-1">No Media Files Found</h3>
            <p className="text-sm text-neutral-500">Check back later for updates and catalogs!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredMedia.map((item, index) => (
              <div
                key={item.id}
                onClick={() => openLightbox(index)}
                className="group bg-neutral-900 rounded-xl overflow-hidden shadow-lg border border-neutral-800 hover:border-amber-500/50 transition-all duration-500 hover:-translate-y-2 cursor-pointer flex flex-col"
              >
                {/* Media Content Box */}
                <div className="relative aspect-video w-full overflow-hidden bg-neutral-950 flex items-center justify-center">
                  {item.type === 'image' && (
                    <img 
                      src={item.url} 
                      alt={item.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                  )}
                  {item.type === 'video' && (
                    <div className="w-full h-full relative flex items-center justify-center">
                      <video src={item.url} className="w-full h-full object-cover" muted />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <VideoIcon className="w-12 h-12 text-white bg-amber-500/80 p-3 rounded-full" />
                      </div>
                    </div>
                  )}
                  {item.type === 'audio' && (
                    <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-amber-500 p-6">
                      <Music className="w-16 h-16 p-4 bg-neutral-900 rounded-full border border-neutral-700" />
                    </div>
                  )}
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-neutral-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                    <span className="text-xs tracking-widest text-amber-500 font-semibold uppercase border border-amber-500 px-4 py-2 rounded-lg bg-neutral-900/80 shadow-lg">
                      View Media
                    </span>
                  </div>
                </div>

                {/* Media Details */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif text-lg text-white group-hover:text-amber-500 transition-colors duration-300 mb-1">{item.title}</h3>
                    <p className="text-neutral-400 text-xs line-clamp-2 mb-4 leading-relaxed">{item.description}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-amber-500 font-medium tracking-wider">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{item.uploadDate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && (
        <div 
          onClick={() => setLightboxIndex(null)}
          className="fixed inset-0 bg-black/98 z-50 flex flex-col items-center justify-center p-4 animate-in fade-in duration-250"
        >
          {/* Top Tools */}
          <div className="absolute top-4 right-4 flex gap-2">
            <button 
              onClick={() => setLightboxIndex(null)}
              className="w-12 h-12 bg-neutral-900/80 hover:bg-amber-500 hover:text-neutral-900 text-white rounded-full flex items-center justify-center transition-all duration-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Previous Button */}
          {lightboxIndex > 0 && (
            <button
              onClick={handlePrev}
              className="absolute left-4 w-12 h-12 bg-neutral-900/60 hover:bg-amber-500 hover:text-neutral-900 text-white rounded-full flex items-center justify-center transition-all duration-300"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Next Button */}
          {lightboxIndex < filteredMedia.length - 1 && (
            <button
              onClick={handleNext}
              className="absolute right-4 w-12 h-12 bg-neutral-900/60 hover:bg-amber-500 hover:text-neutral-900 text-white rounded-full flex items-center justify-center transition-all duration-300"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Media Player/Renderer */}
          <div className="max-w-4xl max-h-[75vh] w-full h-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
            {filteredMedia[lightboxIndex].type === 'image' && (
              <img 
                src={filteredMedia[lightboxIndex].url} 
                alt={filteredMedia[lightboxIndex].title}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl border border-neutral-800" 
              />
            )}
            {filteredMedia[lightboxIndex].type === 'video' && (
              <video 
                src={filteredMedia[lightboxIndex].url} 
                className="max-w-full max-h-full rounded-lg" 
                controls 
                autoPlay 
              />
            )}
            {filteredMedia[lightboxIndex].type === 'audio' && (
              <div className="bg-neutral-900 p-8 rounded-2xl w-full max-w-md border border-neutral-800 flex flex-col items-center text-center">
                <Music className="w-20 h-20 text-amber-500 mb-6 bg-neutral-850 p-4 rounded-full border border-neutral-700" />
                <h4 className="text-white font-serif text-xl mb-1">{filteredMedia[lightboxIndex].title}</h4>
                <p className="text-neutral-400 text-xs mb-6">{filteredMedia[lightboxIndex].description}</p>
                <audio 
                  src={filteredMedia[lightboxIndex].url} 
                  className="w-full" 
                  controls 
                  autoPlay 
                />
              </div>
            )}
          </div>

          {/* Caption */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center text-white p-4 max-w-xl w-full" onClick={e => e.stopPropagation()}>
            <h3 className="font-serif text-xl text-amber-500 mb-1">{filteredMedia[lightboxIndex].title}</h3>
            <p className="text-neutral-400 text-xs leading-relaxed">{filteredMedia[lightboxIndex].description}</p>
            <div className="text-[10px] text-neutral-500 mt-2 tracking-wider uppercase font-mono">
              Item {lightboxIndex + 1} of {filteredMedia.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
