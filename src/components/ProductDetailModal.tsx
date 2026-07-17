import React, { useState, useMemo, useEffect, useRef } from "react";
import { Product } from "../types";
import { 
  X, ShoppingBag, Ribbon, Plus, Check, ArrowRight, 
  RotateCw, Video, Camera, Sliders, User, RefreshCw, 
  Download, Image as ImageIcon, Play, Pause, Volume2, VolumeX,
  Sparkles, Layers
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db } from "../lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";

interface ProductDetailModalProps {
  product: Product;
  allProducts: Product[];
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  isLoggedIn: boolean;
  onShowLogin: () => void;
  onViewProduct: (product: Product) => void;
  initialTab?: 'classic' | 'spin360' | 'video' | 'tryon';
}

// Default catwalk showcase video fallback
const DEFAULT_VIDEO = "https://assets.mixkit.co/videos/preview/mixkit-beautiful-woman-in-fashion-dress-posing-41838-large.mp4";

// High-class sample fashion models for AR Try-On fallback
const FASHION_MODELS = [
  {
    id: 1,
    name: "Dami (Classic Pose)",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop",
    style: "Petite/Standard Structure"
  },
  {
    id: 2,
    name: "Amara (Sassy Posing)",
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&auto=format&fit=crop",
    style: "Athletic/Tall Structure"
  },
  {
    id: 3,
    name: "Naa (Graceful Evening Silhouette)",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop",
    style: "Curvy/Full Silhouette"
  }
];

// Default fallback 360 rotational frames
const DEFAULT_360_FRAMES = [
  "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=500&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1618932260643-eee4a2f652a6?w=500&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=500&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&auto=format&fit=crop"
];

// Default transparent gown overlay fallback
const DEFAULT_TRYON_GARMENT = "https://pngimg.com/uploads/dress/dress_PNG20.png";

export default function ProductDetailModal({
  product,
  allProducts,
  onClose,
  onAddToCart,
  isLoggedIn,
  onShowLogin,
  onViewProduct,
  initialTab,
}: ProductDetailModalProps) {
  const isFood = product.category === 'food' || product.category === 'kitchen';

  // Tabs: 'classic' (Photo), 'spin360' (360° Spin), 'video' (Catwalk), 'tryon' (AR/VR Studio)
  const [activeMediaTab, setActiveMediaTab] = useState<'classic' | 'spin360' | 'video' | 'tryon'>('classic');

  useEffect(() => {
    if (initialTab) {
      if (initialTab === 'tryon' && isFood) {
        setActiveMediaTab('classic');
      } else {
        setActiveMediaTab(initialTab);
      }
    }
  }, [initialTab, isFood]);

  // 360 Spin State
  const spinFrames = useMemo(() => {
    return product.images360 && product.images360.length > 0 ? product.images360 : DEFAULT_360_FRAMES;
  }, [product.images360]);
  const [spinIndex, setSpinIndex] = useState(0);
  const [isSpinAuto, setIsSpinAuto] = useState(false);
  const dragStartRef = useRef<number | null>(null);

  // Video State
  const [videoPlaying, setVideoPlaying] = useState(true);
  const [videoMuted, setVideoMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // AR Try-On State (with real-time Firestore synchronization)
  const [dbModels, setDbModels] = useState<any[]>([]);
  const [dbDresses, setDbDresses] = useState<any[]>([]);
  const [selectedGarmentUrl, setSelectedGarmentUrl] = useState<string>("");

  useEffect(() => {
    const unsubModels = onSnapshot(collection(db, "ar_mannequins"), (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setDbModels(list);
    }, (error) => {
      console.error("Error reading db ar_mannequins:", error);
    });

    const unsubDresses = onSnapshot(collection(db, "ar_dresses"), (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setDbDresses(list);
    }, (error) => {
      console.error("Error reading db ar_dresses:", error);
    });

    return () => {
      unsubModels();
      unsubDresses();
    };
  }, []);

  const selectableModels = useMemo(() => {
    return dbModels.length > 0 ? dbModels : FASHION_MODELS;
  }, [dbModels]);

  const [customModels, setCustomModels] = useState<any[]>([]);

  const combinedModels = useMemo(() => {
    return [...customModels, ...selectableModels];
  }, [customModels, selectableModels]);

  const activeGarmentUrl = useMemo(() => {
    return selectedGarmentUrl || product.tryOnImage || DEFAULT_TRYON_GARMENT;
  }, [selectedGarmentUrl, product.tryOnImage]);

  const [tryOnMode, setTryOnMode] = useState<'model' | 'camera'>('model');
  const [selectedModel, setSelectedModel] = useState(FASHION_MODELS[0]);

  useEffect(() => {
    if (combinedModels && combinedModels.length > 0) {
      const exists = combinedModels.some(m => m.id === selectedModel?.id || m.name === selectedModel?.name);
      if (!exists) {
        setSelectedModel(combinedModels[0]);
      }
    }
  }, [combinedModels, selectedModel]);

  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const webcamRef = useRef<HTMLVideoElement | null>(null);

  // Try On Sizing & Placement sliders
  const [tryOnScale, setTryOnScale] = useState(100); // 50% to 180%
  const [tryOnStretch, setTryOnStretch] = useState(100); // 50% to 150% (scaleX multiplier)
  const [tryOnY, setTryOnY] = useState(0); // vertical position offset in px
  const [tryOnX, setTryOnX] = useState(0); // horizontal position offset in px
  const [tryOnRotate, setTryOnRotate] = useState(0); // degrees
  const [tryOnOpacity, setTryOnOpacity] = useState(95); // transparency percentage

  // Snapshot preview modal
  const [showSnapshotModal, setShowSnapshotModal] = useState(false);
  const [snapshotDataUrl, setSnapshotDataUrl] = useState<string | null>(null);
  const tryOnContainerRef = useRef<HTMLDivElement | null>(null);

  // Category-based recommendation engine for "Complete the Look" / "Recommended Accessories"
  const recommendationData = useMemo(() => {
    if (!product || !allProducts) return { title: "Complete the Look", subtitle: "Curated pairings for your style", items: [] };

    const cat = (product.category || '').toLowerCase();
    let targetCategories: string[] = [];
    let title = "Complete the Look";
    let subtitle = "Handpicked pairings to elevate your style";

    if (cat === "dresses") {
      targetCategories = ["accessories", "bags", "shoes"];
      title = "Recommended Accessories & Bags";
      subtitle = "Pair your elegant gown with these premium hand-crafted accents";
    } else if (cat === "shoes") {
      targetCategories = ["bags", "accessories", "dresses"];
      title = "Complete the Look";
      subtitle = "Matching accessories and luxury gowns to complete your outfit";
    } else if (cat === "bags") {
      targetCategories = ["shoes", "accessories", "dresses"];
      title = "Complete the Look";
      subtitle = "Chic shoes and traditional accents to pair with your designer bag";
    } else if (cat === "accessories") {
      targetCategories = ["dresses", "bags", "shoes"];
      title = "Style Matches";
      subtitle = "Stunning gowns and elegant leatherwear to complement your jewelry";
    } else if (cat === "food") {
      targetCategories = ["food"];
      title = "Complete the Feast";
      subtitle = "Add complementary traditional Ghanaian delicacies to perfect your meal";
    } else {
      targetCategories = [cat];
      title = "Recommended For You";
      subtitle = "You might also be interested in these items";
    }

    // Filter items belonging to target categories, excluding current product
    let items = allProducts.filter(
      (item) => item.id !== product.id && targetCategories.includes((item.category || '').toLowerCase()) && item.stock > 0
    );

    // If we don't have enough items (we need at least 3), pad with other available items from matching or other lines
    if (items.length < 3) {
      const otherItems = allProducts.filter(
        (item) => item.id !== product.id && !targetCategories.includes((item.category || '').toLowerCase()) && !(items || []).some(existing => existing.id === item.id) && item.stock > 0
      );
      items = [...items, ...otherItems];
    }

    return {
      title,
      subtitle,
      items: items.slice(0, 3)
    };
  }, [product, allProducts]);

  const suggestedProducts = useMemo(() => recommendationData.items, [recommendationData]);

  // Clean up camera stream on unmount or tab switch
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  // Auto spin effect
  useEffect(() => {
    let interval: any;
    if (isSpinAuto && activeMediaTab === 'spin360') {
      interval = setInterval(() => {
        setSpinIndex((prev) => (prev + 1) % spinFrames.length);
      }, 300);
    }
    return () => clearInterval(interval);
  }, [isSpinAuto, activeMediaTab, spinFrames.length]);

  const handleAddClick = () => {
    if (!isLoggedIn) {
      onShowLogin();
    } else {
      onAddToCart(product);
    }
  };

  // Start Camera Stream
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" }
      });
      setCameraStream(stream);
      if (webcamRef.current) {
        webcamRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error("Camera access denied or unavailable:", err);
      setCameraError("Webcam access denied. Please allow camera permissions in your browser or stick to Virtual Model mode.");
      setTryOnMode('model');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  // Capture webcam video frame and set as the active custom mannequin backdrop
  const captureWebcamAsMannequin = () => {
    if (tryOnMode === 'camera' && webcamRef.current) {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 600;
        canvas.height = 750;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          // Draw camera frame with horizontal mirror scale-x-[-1]
          ctx.save();
          ctx.translate(600, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(webcamRef.current, 0, 0, 600, 750);
          ctx.restore();
          
          const dataUrl = canvas.toDataURL("image/jpeg");
          const newModel = {
            id: `custom-${Date.now()}`,
            name: "My Personal Mannequin (Webcam Capture)",
            image: dataUrl,
            style: "User Custom Face & Body Silhouette"
          };
          
          setCustomModels(prev => [newModel, ...prev]);
          setSelectedModel(newModel);
          setTryOnMode('model');
          stopCamera();
        }
      } catch (err) {
        console.error("Failed to capture webcam for mannequin backdrop:", err);
      }
    }
  };

  // Switch try-on mode
  const toggleTryOnMode = (mode: 'model' | 'camera') => {
    setTryOnMode(mode);
    if (mode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
  };

  // Handle Drag / Swipe to spin 360°
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    dragStartRef.current = clientX;
    setIsSpinAuto(false);
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (dragStartRef.current === null) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const deltaX = clientX - dragStartRef.current;
    
    // Threshold to register a spin step
    if (Math.abs(deltaX) > 25) {
      if (deltaX > 0) {
        // Spin right
        setSpinIndex((prev) => (prev - 1 + spinFrames.length) % spinFrames.length);
      } else {
        // Spin left
        setSpinIndex((prev) => (prev + 1) % spinFrames.length);
      }
      dragStartRef.current = clientX;
    }
  };

  const handleDragEnd = () => {
    dragStartRef.current = null;
  };

  // Custom Video playback toggle
  const toggleVideoPlayback = () => {
    if (videoRef.current) {
      if (videoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(e => console.log(e));
      }
      setVideoPlaying(!videoPlaying);
    }
  };

  // Custom Video mute toggle
  const toggleVideoMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoMuted;
      setVideoMuted(!videoMuted);
    }
  };

  // Reset Sizing Fitting Sliders
  const resetSliders = () => {
    setTryOnScale(100);
    setTryOnStretch(100);
    setTryOnY(0);
    setTryOnX(0);
    setTryOnRotate(0);
    setTryOnOpacity(95);
  };

  // Capture Screenshot of Virtual Try On
  const captureSnapshot = () => {
    if (!tryOnContainerRef.current) return;
    
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 600;
      canvas.height = 750;
      const ctx = canvas.getContext("2d");
      
      if (ctx) {
        // Draw elegant gradient background
        ctx.fillStyle = "#0f172a"; // Deep slate
        ctx.fillRect(0, 0, 600, 750);
        
        const drawGarmentAndFinish = () => {
          // Draw the overlay dress with corresponding translate and scaling
          const overlayImg = new Image();
          overlayImg.crossOrigin = "anonymous";
          const isLocalGarment = activeGarmentUrl.startsWith('/') || activeGarmentUrl.startsWith('data:');
          overlayImg.src = isLocalGarment ? activeGarmentUrl : `/api/proxy-image?url=${encodeURIComponent(activeGarmentUrl)}`;
          
          overlayImg.onload = () => {
            ctx.save();
            ctx.globalAlpha = tryOnOpacity / 100;
            
            // Positioning variables
            const centerX = 300 + tryOnX * 1.5;
            const centerY = 375 + tryOnY * 1.5;
            const sizeWidth = 320 * (tryOnScale / 100) * (tryOnStretch / 100);
            const sizeHeight = 440 * (tryOnScale / 100);
            
            ctx.translate(centerX, centerY);
            ctx.rotate((tryOnRotate * Math.PI) / 180);
            ctx.drawImage(overlayImg, -sizeWidth / 2, -sizeHeight / 2, sizeWidth, sizeHeight);
            ctx.restore();
            
            // Draw Polaroid frame/Ella's watermarked header
            ctx.fillStyle = "rgba(0,0,0,0.6)";
            ctx.fillRect(0, 680, 600, 70);
            
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 16px 'Space Grotesk', sans-serif";
            ctx.fillText(`ELLA'S COUTURE FIT: ${(product.name || '').toUpperCase()}`, 30, 712);
            
            ctx.fillStyle = "#fbbf24";
            ctx.font = "bold 12px monospace";
            ctx.fillText("ACCRA FASHION STUDIO • VIRTUAL TRY-ON", 30, 732);
            
            // Export data URI
            const dataUrl = canvas.toDataURL("image/jpeg");
            setSnapshotDataUrl(dataUrl);
            setShowSnapshotModal(true);
          };
          
          overlayImg.onerror = (e) => {
            console.error("Failed to load garment overlay image:", e);
            // Export data URI even without garment if it fails
            const dataUrl = canvas.toDataURL("image/jpeg");
            setSnapshotDataUrl(dataUrl);
            setShowSnapshotModal(true);
          };
        };

        if (tryOnMode === 'camera' && webcamRef.current) {
          try {
            // Draw camera frame with horizontal mirror scale-x-[-1]
            ctx.save();
            ctx.translate(600, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(webcamRef.current, 0, 0, 600, 750);
            ctx.restore();
            
            // Proceed to garment
            drawGarmentAndFinish();
          } catch (vidErr) {
            console.error("Error drawing video to canvas:", vidErr);
            // Fallback to drawing a nice background if video fails
            const tempImg = new Image();
            tempImg.crossOrigin = "anonymous";
            const fallbackUrl = "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600";
            tempImg.src = `/api/proxy-image?url=${encodeURIComponent(fallbackUrl)}`;
            tempImg.onload = () => {
              ctx.drawImage(tempImg, 0, 0, 600, 750);
              drawGarmentAndFinish();
            };
            tempImg.onerror = () => {
              drawGarmentAndFinish();
            };
          }
        } else {
          // Draw background model
          const tempImg = new Image();
          tempImg.crossOrigin = "anonymous";
          const isLocalModel = selectedModel.image.startsWith('/') || selectedModel.image.startsWith('data:');
          tempImg.src = isLocalModel ? selectedModel.image : `/api/proxy-image?url=${encodeURIComponent(selectedModel.image)}`;
          
          tempImg.onload = () => {
            ctx.drawImage(tempImg, 0, 0, 600, 750);
            drawGarmentAndFinish();
          };
          
          tempImg.onerror = () => {
            console.error("Failed to load selected model image.");
            drawGarmentAndFinish();
          };
        }
      }
    } catch (err) {
      console.error("Failed to generate canvas snapshot:", err);
      // Fallback: use template layout if canvas triggers CORS on external images
      setSnapshotDataUrl(null);
      setShowSnapshotModal(true);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={() => {
        stopCamera();
        onClose();
      }}
      id="product-detail-modal-overlay"
    >
      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white text-slate-900 rounded-[2rem] shadow-2xl max-w-5xl w-full flex flex-col overflow-hidden border border-neutral-200/80 relative my-8"
        id="product-detail-modal-container"
      >
        {/* Accent Top Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-indigo-500 to-pink-500" />

        {/* Close Button */}
        <button
          onClick={() => {
            stopCamera();
            onClose();
          }}
          className="absolute top-5 right-5 z-40 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-black transition-all cursor-pointer border border-neutral-200/40"
          title="Close Dialog"
          id="product-detail-modal-close-btn"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Main Content Scrollable Area */}
        <div className="overflow-y-auto max-h-[85vh] p-6 md:p-10 space-y-8">
          
          {/* Top Half: Product Detail Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Interactive Media Station (5 Cols on large, 12 on mobile) */}
            <div className="lg:col-span-6 space-y-4">
              
              {/* Main Media Showcase Box */}
              <div 
                ref={tryOnContainerRef}
                className="relative aspect-square sm:aspect-[4/5] rounded-2xl overflow-hidden bg-slate-950 border border-neutral-200 shadow-inner flex flex-col items-center justify-center select-none"
                id="interactive-media-showcase-box"
              >
                
                {/* 1. CLASSIC PHOTO VIEW */}
                {activeMediaTab === 'classic' && (
                  <div className="w-full h-full relative flex items-center justify-center bg-white">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    {/* Corner category flag */}
                    <span className="absolute top-4 left-4 bg-white/95 text-indigo-600 text-[10px] px-3 py-1 rounded-full font-black tracking-widest font-mono uppercase shadow border border-indigo-200">
                      {product.category}
                    </span>
                  </div>
                )}

                {/* 2. 360° SPIN CONTROLS */}
                {activeMediaTab === 'spin360' && (
                  <div 
                    className="w-full h-full relative flex flex-col items-center justify-center bg-neutral-900 cursor-ew-resize overflow-hidden"
                    onMouseDown={handleDragStart}
                    onMouseMove={handleDragMove}
                    onMouseUp={handleDragEnd}
                    onMouseLeave={handleDragEnd}
                    onTouchStart={handleDragStart}
                    onTouchMove={handleDragMove}
                    onTouchEnd={handleDragEnd}
                  >
                    {/* Active rotating frame */}
                    <img
                      src={spinFrames[spinIndex]}
                      alt={`${product.name} spin angle ${spinIndex}`}
                      className="w-full h-full object-cover pointer-events-none"
                      referrerPolicy="no-referrer"
                    />

                    {/* Drag hint instructions overlay */}
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest px-4 py-1.5 rounded-full border border-amber-500/30 flex items-center gap-2">
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      Drag or Swipe to Spin Studio
                    </div>

                    {/* Rotational controls footer */}
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSpinIndex((prev) => (prev - 1 + spinFrames.length) % spinFrames.length)}
                          className="bg-white/10 hover:bg-white/20 text-white rounded-lg p-1.5 text-xs transition cursor-pointer"
                        >
                          ◀
                        </button>
                        <span className="text-[10px] font-mono text-white/80">Angle {spinIndex + 1}/{spinFrames.length}</span>
                        <button
                          type="button"
                          onClick={() => setSpinIndex((prev) => (prev + 1) % spinFrames.length)}
                          className="bg-white/10 hover:bg-white/20 text-white rounded-lg p-1.5 text-xs transition cursor-pointer"
                        >
                          ▶
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsSpinAuto(!isSpinAuto)}
                        className={`text-[9px] font-mono font-black uppercase px-3 py-1 rounded-lg border cursor-pointer ${
                          isSpinAuto 
                            ? 'bg-amber-400 text-neutral-900 border-amber-400' 
                            : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {isSpinAuto ? "❚❚ Auto" : "▶ Play Spin"}
                      </button>
                    </div>
                  </div>
                )}

                {/* 3. RUNWAY VIDEO VIEWER */}
                {activeMediaTab === 'video' && (
                  <div className="w-full h-full relative flex items-center justify-center bg-black">
                    <video
                      ref={videoRef}
                      src={product.videoUrl || DEFAULT_VIDEO}
                      autoPlay
                      loop
                      muted={videoMuted}
                      playsInline
                      className="w-full h-full object-cover"
                    />

                    {/* Controller bar overlay */}
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-black/60 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 z-10">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={toggleVideoPlayback}
                          className="p-1.5 bg-white text-neutral-900 rounded-lg hover:bg-amber-400 transition cursor-pointer"
                        >
                          {videoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        </button>
                        <span className="text-[10px] font-mono font-black text-amber-400 uppercase tracking-wider">Catwalk Live</span>
                      </div>

                      <button
                        type="button"
                        onClick={toggleVideoMute}
                        className="p-1.5 bg-white/10 text-white hover:bg-white/20 rounded-lg transition cursor-pointer"
                      >
                        {videoMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* 4. AR / VR TRY-ON STUDIO */}
                {activeMediaTab === 'tryon' && (
                  <div className="w-full h-full relative flex items-center justify-center bg-neutral-900 overflow-hidden">
                    
                    {/* CAMERA STREAMS OR MODEL VIEW */}
                    {tryOnMode === 'camera' ? (
                      <div className="w-full h-full relative bg-black flex items-center justify-center">
                        <video
                          ref={webcamRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover scale-x-[-1]" // mirror effect
                        />
                        
                        {!cameraError && (
                          <div className="absolute bottom-4 left-4 z-10">
                            <button
                              type="button"
                              onClick={captureWebcamAsMannequin}
                              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1.5 cursor-pointer border border-indigo-400/30 transition-transform active:scale-95 animate-pulse"
                            >
                              <Camera className="w-3.5 h-3.5" />
                              Capture My Look As Mannequin
                            </button>
                          </div>
                        )}

                        {cameraError && (
                          <div className="absolute inset-0 bg-black/95 p-6 flex flex-col items-center justify-center text-center text-rose-400 z-10 space-y-4">
                            <X className="w-8 h-8 text-rose-500 animate-bounce" />
                            <p className="text-xs font-bold leading-relaxed">{cameraError}</p>
                            <button
                              type="button"
                              onClick={() => setTryOnMode('model')}
                              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest cursor-pointer"
                            >
                              Use sample models instead
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-full relative bg-slate-900 flex items-center justify-center">
                        <img
                          src={selectedModel.image.startsWith('/') || selectedModel.image.startsWith('data:') ? selectedModel.image : `/api/proxy-image?url=${encodeURIComponent(selectedModel.image)}`}
                          alt={selectedModel.name}
                          className="w-full h-full object-cover brightness-[0.9]"
                          referrerPolicy="no-referrer"
                        />
                        {/* Mannequin Tag */}
                        <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm text-[9px] font-mono font-bold text-indigo-400 px-2.5 py-1 rounded-full border border-indigo-500/30">
                          Active Mannequin: {selectedModel.name}
                        </div>
                      </div>
                    )}

                    {/* COMPOSITED TRANSPARENT APPAREL OVERLAY */}
                    <div 
                      className="absolute pointer-events-none transition-all duration-75 flex items-center justify-center"
                      style={{
                        transform: `translate(${tryOnX}px, ${tryOnY}px) rotate(${tryOnRotate}deg) scaleX(${(tryOnScale / 100) * (tryOnStretch / 100)}) scaleY(${tryOnScale / 100})`,
                        opacity: tryOnOpacity / 100,
                        width: "280px",
                        height: "380px"
                      }}
                    >
                      <img
                        src={activeGarmentUrl.startsWith('/') || activeGarmentUrl.startsWith('data:') ? activeGarmentUrl : `/api/proxy-image?url=${encodeURIComponent(activeGarmentUrl)}`}
                        alt="Garment overlay"
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Camera snapshot button */}
                    <div className="absolute bottom-4 right-4 z-10">
                      <button
                        type="button"
                        onClick={captureSnapshot}
                        className="bg-gradient-to-r from-amber-500 to-pink-500 hover:from-amber-600 hover:to-pink-600 text-white p-3 rounded-full shadow-lg transition-transform hover:scale-110 active:scale-95 cursor-pointer border border-white/20"
                        title="Snap fitting room portrait"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Calibration Sliders Indicator floating at the top left */}
                    <div className="absolute top-4 right-4 z-10 flex gap-2">
                      <button
                        type="button"
                        onClick={resetSliders}
                        className="bg-black/60 backdrop-blur-sm hover:bg-black/80 text-white p-2 rounded-lg text-[9px] font-mono font-bold tracking-wider uppercase border border-white/10 flex items-center gap-1 cursor-pointer"
                        title="Reset Calibration Sliders"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Reset Fit
                      </button>
                    </div>

                  </div>
                )}

              </div>

              {/* Media Selection Hub Bar */}
              <div className={`grid ${isFood ? 'grid-cols-3' : 'grid-cols-4'} gap-2 bg-neutral-100 p-1.5 rounded-2xl border border-neutral-200`} id="media-selectors-bar">
                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    setActiveMediaTab('classic');
                  }}
                  className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    activeMediaTab === 'classic' 
                      ? 'bg-white text-indigo-600 shadow' 
                      : 'text-neutral-500 hover:text-indigo-600 hover:bg-neutral-50'
                  }`}
                >
                  🖼️ Photo
                </button>

                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    setActiveMediaTab('spin360');
                  }}
                  className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    activeMediaTab === 'spin360' 
                      ? 'bg-white text-indigo-600 shadow' 
                      : 'text-neutral-500 hover:text-indigo-600 hover:bg-neutral-50'
                  }`}
                >
                  🔄 360° Studio
                </button>

                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    setActiveMediaTab('video');
                  }}
                  className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    activeMediaTab === 'video' 
                      ? 'bg-white text-indigo-600 shadow' 
                      : 'text-neutral-500 hover:text-indigo-600 hover:bg-neutral-50'
                  }`}
                >
                  🎬 Runway
                </button>

                {!isFood && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveMediaTab('tryon');
                      // auto trigger camera or model setup
                      if (tryOnMode === 'camera') {
                        startCamera();
                      }
                    }}
                    className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      activeMediaTab === 'tryon' 
                        ? 'bg-gradient-to-r from-amber-500 to-pink-500 text-white shadow-md font-bold' 
                        : 'text-neutral-500 hover:text-indigo-600 hover:bg-neutral-50'
                    }`}
                  >
                    💅 Try On
                    <span className="text-[7px] bg-amber-400 text-neutral-900 px-1 rounded-sm uppercase tracking-tight font-black animate-pulse">AR</span>
                  </button>
                )}
              </div>

              {/* DYNAMIC FIT SETTINGS DRAWER FOR AR TRY-ON */}
              {activeMediaTab === 'tryon' && (
                <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4.5 space-y-4 animate-in slide-in-from-bottom duration-300">
                  
                  {/* Mode Swapper */}
                  <div className="flex justify-between items-center pb-2 border-b border-neutral-150">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider">AR Live Fitting Room</span>
                    <div className="flex bg-neutral-200 p-0.5 rounded-lg border border-neutral-300 text-[10px]">
                      <button
                        type="button"
                        onClick={() => toggleTryOnMode('model')}
                        className={`px-2.5 py-1 rounded font-bold uppercase transition-all cursor-pointer ${tryOnMode === 'model' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500'}`}
                      >
                        🧍 Virtual Model
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleTryOnMode('camera')}
                        className={`px-2.5 py-1 rounded font-bold uppercase transition-all cursor-pointer ${tryOnMode === 'camera' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500'}`}
                      >
                        📷 Webcam
                      </button>
                    </div>
                  </div>

                  {/* Model Picker (if in model mode) */}
                  {tryOnMode === 'model' && (
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-mono text-neutral-400 font-bold block uppercase tracking-wider">Select Fashion Model Backdrop:</span>
                      <div className="grid grid-cols-3 gap-2">
                        {combinedModels.map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setSelectedModel(m)}
                            className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                              selectedModel.id === m.id 
                                ? 'bg-indigo-50 border-indigo-400 shadow-sm' 
                                : 'bg-white border-neutral-200 hover:border-neutral-300'
                            }`}
                          >
                            <span className="font-bold text-[10px] text-neutral-800 block leading-tight truncate">{(m.name || "Model").split(" ")[0]}</span>
                            <span className="text-[8px] text-neutral-400 truncate block">{m.style}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Dress Picker (Select try-on gown overlay) */}
                  <div className="space-y-1.5 border-t border-neutral-150 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-mono text-neutral-400 font-bold block uppercase tracking-wider">Select Designer Dress Overlay:</span>
                      {selectedGarmentUrl && (
                        <button
                          type="button"
                          onClick={() => setSelectedGarmentUrl("")}
                          className="text-[9px] text-indigo-600 hover:text-indigo-800 font-bold uppercase tracking-wider cursor-pointer"
                        >
                          Reset to Product Gown
                        </button>
                      )}
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1 max-w-full scrollbar-thin scrollbar-thumb-neutral-200">
                      {/* Product's Default design */}
                      <button
                        type="button"
                        onClick={() => setSelectedGarmentUrl("")}
                        className={`flex items-center gap-2 p-1.5 rounded-xl border text-left shrink-0 transition-all cursor-pointer ${
                          !selectedGarmentUrl 
                            ? 'bg-indigo-50 border-indigo-400 shadow-sm' 
                            : 'bg-white border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center overflow-hidden border border-neutral-200">
                          <img src={product.tryOnImage || DEFAULT_TRYON_GARMENT} alt="Product default design" className="w-full h-full object-contain" />
                        </div>
                        <div>
                          <span className="font-bold text-[10px] text-neutral-800 block max-w-[100px] truncate font-serif">Product Design</span>
                          <span className="text-[8px] text-neutral-400 block">Default Gown</span>
                        </div>
                      </button>

                      {/* DB Dresses list */}
                      {dbDresses.map((dress) => (
                        <button
                          key={dress.id}
                          type="button"
                          onClick={() => setSelectedGarmentUrl(dress.image)}
                          className={`flex items-center gap-2 p-1.5 rounded-xl border text-left shrink-0 transition-all cursor-pointer ${
                            selectedGarmentUrl === dress.image
                              ? 'bg-indigo-50 border-indigo-400 shadow-sm' 
                              : 'bg-white border-neutral-200 hover:border-neutral-300'
                          }`}
                        >
                          <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center overflow-hidden border border-neutral-200">
                            <img src={dress.image} alt={dress.name} className="w-full h-full object-contain animate-fade-in" referrerPolicy="no-referrer" />
                          </div>
                          <div>
                            <span className="font-bold text-[10px] text-neutral-800 block max-w-[120px] truncate font-serif">{dress.name}</span>
                            <span className="text-[8px] text-neutral-400 block capitalize">{dress.category || "Dress"}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* calibration sliders */}
                  <div className="space-y-3.5 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1">
                        <Sliders className="w-3.5 h-3.5" /> Garment Placement Calibration
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      {/* Scale Size */}
                      <div className="space-y-1">
                        <div className="flex justify-between font-mono text-[9px] text-neutral-500">
                          <span>GARMENT SIZE</span>
                          <span className="font-bold text-indigo-600">{tryOnScale}%</span>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="180"
                          value={tryOnScale}
                          onChange={(e) => setTryOnScale(parseInt(e.target.value))}
                          className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-neutral-200 rounded-full appearance-none"
                        />
                      </div>

                      {/* Stretch Width */}
                      <div className="space-y-1">
                        <div className="flex justify-between font-mono text-[9px] text-neutral-500">
                          <span>GARMENT STRETCH (WIDTH)</span>
                          <span className="font-bold text-indigo-600">{tryOnStretch}%</span>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="150"
                          value={tryOnStretch}
                          onChange={(e) => setTryOnStretch(parseInt(e.target.value))}
                          className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-neutral-200 rounded-full appearance-none"
                        />
                      </div>

                      {/* Height Offset (Y) */}
                      <div className="space-y-1">
                        <div className="flex justify-between font-mono text-[9px] text-neutral-500">
                          <span>VERTICAL POSITION (HEIGHT)</span>
                          <span className="font-bold text-indigo-600">{tryOnY}px</span>
                        </div>
                        <input
                          type="range"
                          min="-150"
                          max="150"
                          value={tryOnY}
                          onChange={(e) => setTryOnY(parseInt(e.target.value))}
                          className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-neutral-200 rounded-full appearance-none"
                        />
                      </div>

                      {/* Width Offset (X) */}
                      <div className="space-y-1">
                        <div className="flex justify-between font-mono text-[9px] text-neutral-500">
                          <span>HORIZONTAL CENTER</span>
                          <span className="font-bold text-indigo-600">{tryOnX}px</span>
                        </div>
                        <input
                          type="range"
                          min="-100"
                          max="100"
                          value={tryOnX}
                          onChange={(e) => setTryOnX(parseInt(e.target.value))}
                          className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-neutral-200 rounded-full appearance-none"
                        />
                      </div>

                      {/* Rotation */}
                      <div className="space-y-1">
                        <div className="flex justify-between font-mono text-[9px] text-neutral-500">
                          <span>ROTATION ANGLE</span>
                          <span className="font-bold text-indigo-600">{tryOnRotate}°</span>
                        </div>
                        <input
                          type="range"
                          min="-45"
                          max="45"
                          value={tryOnRotate}
                          onChange={(e) => setTryOnRotate(parseInt(e.target.value))}
                          className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-neutral-200 rounded-full appearance-none"
                        />
                      </div>

                      {/* Opacity */}
                      <div className="space-y-1">
                        <div className="flex justify-between font-mono text-[9px] text-neutral-500">
                          <span>OVERLAY INTENSITY (OPACITY)</span>
                          <span className="font-bold text-indigo-600">{tryOnOpacity}%</span>
                        </div>
                        <input
                          type="range"
                          min="30"
                          max="100"
                          value={tryOnOpacity}
                          onChange={(e) => setTryOnOpacity(parseInt(e.target.value))}
                          className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-neutral-200 rounded-full appearance-none"
                        />
                      </div>
                    </div>
                  </div>

                </div>
              )}

            </div>

            {/* Right Column: Text Information & Actions (6 Cols on large) */}
            <div className="lg:col-span-6 flex flex-col justify-between h-full space-y-6 pt-2">
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest font-mono">
                      ⭐ Ella's Boutique Couture
                    </span>
                    {activeMediaTab !== 'classic' && (
                      <span className="text-[8px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded uppercase font-black font-mono">
                        {activeMediaTab} Mode Active
                      </span>
                    )}
                  </div>
                  <h2 className="font-sans text-2xl md:text-3xl text-neutral-900 font-black tracking-tight leading-tight">
                    {product.name}
                  </h2>
                </div>

                <div className="flex items-baseline gap-3">
                  <span className="text-2xl md:text-3xl font-mono font-black text-indigo-600">
                    ₵{product.price.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono font-bold uppercase">
                    Vat inclusive
                  </span>
                </div>

                <hr className="border-neutral-100" />

                <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-neutral-400 tracking-wider font-mono">
                    Overview
                  </span>
                  <p className="text-sm text-neutral-600 leading-relaxed font-sans">
                    {product.description}
                  </p>
                </div>

                <hr className="border-neutral-100" />

                {/* Additional Product Specs/Features */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                    <span className="text-[9px] font-mono text-neutral-400 block uppercase font-bold mb-0.5">Availability</span>
                    <span className="font-bold text-neutral-800">
                      {product.stock > 0 ? `In Stock (${product.stock} units)` : "Out of stock"}
                    </span>
                  </div>
                  <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                    <span className="text-[9px] font-mono text-neutral-400 block uppercase font-bold mb-0.5">Bespoke Options</span>
                    <span className="font-bold text-amber-600 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                      <Ribbon className="w-3.5 h-3.5 animate-pulse text-amber-500" /> Try-On Supported
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100 text-[11px] text-amber-800 flex items-start gap-2.5">
                  <Ribbon className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-black uppercase tracking-wider block mb-0.5">Accra Virtual Showroom Live</span>
                    Ella's Store supports 3D rotational views, inline catwalk video showcase, and custom browser webcam AR try-ons for this couture product. Choose your visualizer on the left.
                  </div>
                </div>
              </div>

              {/* CTA Purchase Button */}
              <div className="pt-4">
                <button
                  onClick={handleAddClick}
                  disabled={product.stock === 0}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-100 disabled:text-neutral-400 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/15 cursor-pointer disabled:opacity-50"
                  id="product-detail-modal-add-to-cart-btn"
                >
                  <ShoppingBag className="w-4 h-4" />
                  {product.stock === 0 ? "Out of Stock" : "Add to Shopping Bag"}
                </button>
              </div>
            </div>

          </div>

          {/* Bottom Half: Complete the Look & Recommended Accessories Section */}
          {recommendationData.items.length > 0 && (
            <div className="pt-8 border-t border-neutral-100 space-y-5" id="suggested-products-section">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100 animate-pulse">
                    {product.category === 'food' ? (
                      <Ribbon className="w-4 h-4" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      {recommendationData.title}
                    </h3>
                    <p className="text-[10px] text-neutral-400 font-mono">
                      {recommendationData.subtitle}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold font-mono uppercase tracking-widest px-2.5 py-1 rounded-full border border-indigo-100 flex items-center gap-1">
                  <Layers className="w-3 h-3" />
                  {product.category === 'food' ? "Menu Pairings" : "Complete Look"}
                </span>
              </div>

              {/* Grid of suggested items */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {suggestedProducts.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      stopCamera();
                      onViewProduct(item);
                    }}
                    className="bg-neutral-50/50 hover:bg-white rounded-2xl p-3 border border-neutral-200/60 hover:border-indigo-400 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between cursor-pointer group h-full relative"
                  >
                    <div>
                      {/* Image Preview */}
                      <div className="relative aspect-square rounded-xl overflow-hidden bg-white border border-neutral-150 mb-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute top-2 left-2 bg-white/90 text-neutral-600 text-[8px] px-2 py-0.5 rounded font-bold font-mono uppercase border border-neutral-200/50">
                          {item.category}
                        </span>
                      </div>

                      {/* Info details */}
                      <div className="space-y-1 px-1">
                        <h4 className="text-[11px] font-black text-neutral-800 leading-snug tracking-tight group-hover:text-indigo-600 transition-colors line-clamp-1 uppercase">
                          {item.name}
                        </h4>
                        <p className="text-[10px] text-neutral-500 line-clamp-1 leading-normal">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    {/* Footer price & action button */}
                    <div className="pt-3 mt-3 border-t border-neutral-100 flex items-center justify-between px-1">
                      <span className="text-xs font-mono font-black text-neutral-900">
                        ₵{item.price.toFixed(0)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // prevent opening detailed view
                          if (!isLoggedIn) {
                            onShowLogin();
                          } else {
                            onAddToCart(item);
                          }
                        }}
                        className="p-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white rounded-lg border border-indigo-100 hover:border-indigo-600 transition-all cursor-pointer shadow-sm"
                        title={`Quick Add ${item.name} to bag`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </motion.div>

      {/* SNAPSHOT PREVIEW MODAL */}
      <AnimatePresence>
        {showSnapshotModal && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-60 flex items-center justify-center p-4">
            <div className="bg-neutral-900 border border-neutral-800 text-white rounded-[2rem] p-6 max-w-lg w-full relative space-y-6">
              
              <button
                onClick={() => setShowSnapshotModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center space-y-1.5">
                <div className="p-2 bg-amber-500/10 text-amber-500 w-fit mx-auto rounded-xl border border-amber-500/20">
                  <Ribbon className="w-5 h-5 animate-bounce" />
                </div>
                <h3 className="text-sm font-black uppercase tracking-wider text-white">Your Ella's Fitting Snapshot!</h3>
                <p className="text-xs text-neutral-400">Your custom fitting composition is prepared below.</p>
              </div>

              {/* Composition Preview Display */}
              <div className="aspect-[4/5] rounded-2xl overflow-hidden border border-neutral-800 bg-black shadow-inner relative flex items-center justify-center">
                {snapshotDataUrl ? (
                  <img src={snapshotDataUrl} alt="Composite Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="p-8 text-center space-y-4">
                    <ImageIcon className="w-12 h-12 text-neutral-600 mx-auto animate-pulse" />
                    <div>
                      <span className="font-bold text-xs text-white block">Interactive Portrait Rendered</span>
                      <p className="text-[10px] text-neutral-400 max-w-xs mx-auto mt-1">Due to cross-origin resource protection, you can take a screenshot of the fitting page directly using your device's standard shortcuts or save the layout below!</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {snapshotDataUrl && (
                  <a
                    href={snapshotDataUrl}
                    download={`ellas-couture-${product.name.replace(/\s+/g, '-').toLowerCase()}-tryon.jpg`}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-neutral-950 py-3 rounded-xl text-xs font-black uppercase tracking-wider text-center transition flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                  >
                    <Download className="w-4 h-4" />
                    Download Snapshot
                  </a>
                )}
                <button
                  onClick={() => setShowSnapshotModal(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer"
                >
                  Close Preview
                </button>
              </div>

            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
