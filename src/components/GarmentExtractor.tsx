import React, { useState, useRef, useEffect } from "react";
import { Upload, Wand2, Eraser, RefreshCw, Undo, Sliders, Check, Trash2, Image as ImageIcon } from "lucide-react";

interface GarmentExtractorProps {
  value: string; // Base64 data URL or empty
  onChange: (value: string) => void;
  onShowToast: (title: string, message: string, type: "success" | "error" | "info") => void;
}

export default function GarmentExtractor({ value, onChange, onShowToast }: GarmentExtractorProps) {
  const [rawImage, setRawImage] = useState<string | null>(null);
  const [tool, setTool] = useState<"wand" | "eraser">("wand");
  const [tolerance, setTolerance] = useState<number>(35);
  const [brushSize, setBrushSize] = useState<number>(20);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  // History stack for Undo operations
  const [undoStack, setUndoStack] = useState<ImageData[]>([]);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  
  // Keep original image dimensions
  const originalImgRef = useRef<HTMLImageElement | null>(null);

  // Load initial value if it exists and we haven't set rawImage yet
  useEffect(() => {
    if (value && !rawImage) {
      setRawImage(value);
    }
  }, [value, rawImage]);

  // Handle file select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith("image/")) {
      onShowToast("Invalid File", "Please upload a valid image file.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setRawImage(dataUrl);
      setUndoStack([]); // Clear history
      setImageLoaded(false);
    };
    reader.readAsDataURL(file);
  };

  // Initialize canvas with loaded image
  useEffect(() => {
    if (!rawImage) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      originalImgRef.current = img;
      
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Fit inside 450x550 bounding box while preserving aspect ratio
      const maxW = 450;
      const maxH = 550;
      let w = img.width;
      let h = img.height;
      
      if (w > maxW || h > maxH) {
        const ratio = Math.min(maxW / w, maxH / h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
      }

      canvas.width = w;
      canvas.height = h;
      
      // Draw pristine original image
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      
      // Save initial state to undo stack
      const initialData = ctx.getImageData(0, 0, w, h);
      setUndoStack([initialData]);
      setImageLoaded(true);
      
      onShowToast("Image Loaded", "Ready to extract garment. Tap 'Auto-Extract' or click to erase background.", "info");
    };
    img.src = rawImage;
  }, [rawImage]);

  // Helper to save current canvas state to undo stack
  const saveToUndo = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setUndoStack(prev => [...prev.slice(-9), currentState]); // limit history to last 10 states
  };

  // Perform Undo
  const handleUndo = () => {
    if (undoStack.length <= 1) {
      onShowToast("Nothing to Undo", "This is the original state.", "info");
      return;
    }
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const newStack = [...undoStack];
    newStack.pop(); // discard current state
    const prevState = newStack[newStack.length - 1];
    
    ctx.putImageData(prevState, 0, 0);
    setUndoStack(newStack);
    
    // Save live state to parent
    onChange(canvas.toDataURL("image/png"));
    onShowToast("Undo Successful", "Reverted to previous step.", "success");
  };

  // Euclidean color distance in RGB space
  const colorDistance = (r1: number, g1: number, b1: number, r2: number, g2: number, b2: number) => {
    return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
  };

  // Automatic extraction by sampling corners
  const handleAutoExtract = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imageLoaded) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsProcessing(true);
    saveToUndo(); // Save prior state
    
    setTimeout(() => {
      try {
        const w = canvas.width;
        const h = canvas.height;
        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;

        // Sample background colors from 4 corners
        const corners = [
          getPixelColor(data, 0, 0, w),
          getPixelColor(data, w - 1, 0, w),
          getPixelColor(data, 0, h - 1, w),
          getPixelColor(data, w - 1, h - 1, w)
        ];

        // Find the dominant/average corner color
        let avgR = 0, avgG = 0, avgB = 0;
        corners.forEach(c => {
          avgR += c.r;
          avgG += c.g;
          avgB += c.b;
        });
        avgR = Math.round(avgR / corners.length);
        avgG = Math.round(avgG / corners.length);
        avgB = Math.round(avgB / corners.length);

        // Run smart flood-fill mask starting from all borders
        // Using a BFS to find all connected background pixels
        const visited = new Uint8Array(w * h);
        const queue: number[] = [];

        // Seed boundary coordinates
        for (let x = 0; x < w; x++) {
          queue.push(x, 0);       // top border
          queue.push(x, h - 1);   // bottom border
          visited[x] = 1;
          visited[x + (h - 1) * w] = 1;
        }
        for (let y = 1; y < h - 1; y++) {
          queue.push(0, y);       // left border
          queue.push(w - 1, y);   // right border
          visited[y * w] = 1;
          visited[w - 1 + y * w] = 1;
        }

        let head = 0;
        while (head < queue.length) {
          const cx = queue[head++];
          const cy = queue[head++];
          const idx = (cy * w + cx) * 4;
          
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const a = data[idx + 3];

          if (a === 0) continue; // already cleared/transparent

          const dist = colorDistance(r, g, b, avgR, avgG, avgB);
          
          // If close enough to target background color, clear it and propagate
          if (dist <= tolerance) {
            data[idx + 3] = 0; // set alpha to 0 (make transparent)

            // Add 4-way neighbors
            const neighbors = [
              [cx + 1, cy],
              [cx - 1, cy],
              [cx, cy + 1],
              [cx, cy - 1]
            ];

            for (const [nx, ny] of neighbors) {
              if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
                const nIdx = ny * w + nx;
                if (visited[nIdx] === 0) {
                  visited[nIdx] = 1;
                  queue.push(nx, ny);
                }
              }
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);
        
        // Propagate result
        onChange(canvas.toDataURL("image/png"));
        onShowToast("Auto-Extraction Done", "Garment isolated based on corner colors! Adjust tolerance or click to erase extra background.", "success");
      } catch (err) {
        console.error(err);
        onShowToast("Extraction Error", "Failed to analyze background colors.", "error");
      } finally {
        setIsProcessing(false);
      }
    }, 100);
  };

  // Helper to extract pixel colors
  const getPixelColor = (data: Uint8ClampedArray, x: number, y: number, width: number) => {
    const idx = (y * width + x) * 4;
    return {
      r: data[idx],
      g: data[idx + 1],
      b: data[idx + 2],
      a: data[idx + 3]
    };
  };

  // Magic Wand click to clear specific clicked color region
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool !== "wand" || isProcessing || !imageLoaded) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Get click coords relative to canvas
    const rect = canvas.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * canvas.width);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * canvas.height);

    if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) return;

    setIsProcessing(true);
    saveToUndo(); // Save prior state

    setTimeout(() => {
      try {
        const w = canvas.width;
        const h = canvas.height;
        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;

        // Clicked target color
        const targetIdx = (y * w + x) * 4;
        const targetR = data[targetIdx];
        const targetG = data[targetIdx + 1];
        const targetB = data[targetIdx + 2];
        const targetA = data[targetIdx + 3];

        if (targetA === 0) {
          onShowToast("Already Transparent", "You clicked an already cleared area.", "info");
          setIsProcessing(false);
          return;
        }

        // BFS flood fill starting from clicked pixel
        const visited = new Uint8Array(w * h);
        const queue: number[] = [x, y];
        visited[y * w + x] = 1;

        let head = 0;
        while (head < queue.length) {
          const cx = queue[head++];
          const cy = queue[head++];
          const idx = (cy * w + cx) * 4;

          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const a = data[idx + 3];

          if (a === 0) continue;

          const dist = colorDistance(r, g, b, targetR, targetG, targetB);

          if (dist <= tolerance) {
            data[idx + 3] = 0; // Transparent

            // Add 4-neighbors
            const neighbors = [
              [cx + 1, cy],
              [cx - 1, cy],
              [cx, cy + 1],
              [cx, cy - 1]
            ];

            for (const [nx, ny] of neighbors) {
              if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
                const nIdx = ny * w + nx;
                if (visited[nIdx] === 0) {
                  visited[nIdx] = 1;
                  queue.push(nx, ny);
                }
              }
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);
        
        // Save base64
        onChange(canvas.toDataURL("image/png"));
        onShowToast("Region Cleared", "Clicked background region removed successfully.", "success");
      } catch (err) {
        console.error(err);
      } finally {
        setIsProcessing(false);
      }
    }, 50);
  };

  // Manual Eraser Brush event handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool !== "eraser" || !imageLoaded) return;
    saveToUndo(); // Save state before starting erase brush stroke
    setIsDrawing(true);
    eraseAtCoords(e);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || tool !== "eraser") return;
    eraseAtCoords(e);
  };

  const handleMouseUpOrLeave = () => {
    if (isDrawing) {
      setIsDrawing(false);
      // Save resulting canvas to parent on release
      const canvas = canvasRef.current;
      if (canvas) {
        onChange(canvas.toDataURL("image/png"));
      }
    }
  };

  const eraseAtCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    ctx.save();
    ctx.globalCompositeOperation = "destination-out"; // Clear pixels under path
    ctx.beginPath();
    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  // Reset to original uploaded image
  const handleReset = () => {
    if (!originalImgRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    saveToUndo(); // Save prior state so they can undo the reset if desired

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(originalImgRef.current, 0, 0, canvas.width, canvas.height);
    
    onChange(canvas.toDataURL("image/png"));
    onShowToast("Reset Complete", "Reverted to pristine original image.", "success");
  };

  // Clear current garment and return to upload mode
  const handleClearAll = () => {
    setRawImage(null);
    setUndoStack([]);
    setImageLoaded(false);
    onChange("");
  };

  return (
    <div className="space-y-4 border border-neutral-200/80 rounded-2xl p-4 bg-neutral-50/50" id="garment-extractor-workbench">
      {!rawImage ? (
        // Dropzone Mode
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="group relative border-2 border-dashed border-neutral-300 hover:border-indigo-500 rounded-2xl p-8 text-center cursor-pointer bg-white dark:bg-slate-900 transition duration-300 shadow-sm flex flex-col items-center justify-center min-h-[220px]"
          id="garment-upload-dropzone"
        >
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <div className="w-12 h-12 rounded-full bg-neutral-50 dark:bg-slate-950 group-hover:bg-indigo-50 flex items-center justify-center text-neutral-400 group-hover:text-indigo-600 transition duration-300 mb-3 border border-neutral-100 dark:border-slate-800">
            <Upload className="w-5 h-5 animate-pulse" />
          </div>
          <p className="text-xs font-bold text-neutral-800 dark:text-slate-200 uppercase tracking-wide">Select Garment Photo</p>
          <p className="text-[11px] text-neutral-500 dark:text-slate-400 max-w-[280px] mt-1.5 leading-relaxed">
            Upload a solid background photo (flat lay or mannequin). The software will extract just the dress/clothing.
          </p>
          <span className="mt-4 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100/80 text-indigo-700 text-[10px] font-black uppercase tracking-wider rounded-lg border border-indigo-200/50 transition duration-200">
            Browse Files from Device
          </span>
        </div>
      ) : (
        // Workbench Editor Mode
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Canvas Preview Column */}
          <div className="md:col-span-7 flex flex-col items-center justify-center bg-white dark:bg-slate-900 p-4 border border-neutral-200 dark:border-slate-700 rounded-2xl relative shadow-inner min-h-[350px]">
            {isProcessing && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
                <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-600 dark:text-slate-400 mt-2">Extracting Garment...</span>
              </div>
            )}
            
            {/* Checkerboard Backdrop wrapper */}
            <div 
              ref={containerRef}
              className="max-h-[480px] max-w-full overflow-auto rounded-xl border border-neutral-200 dark:border-slate-700 shadow-sm relative bg-[radial-gradient(#d1d5db_1px,transparent_1px)] [background-size:12px_12px] bg-neutral-50 dark:bg-slate-950"
              style={{
                cursor: tool === "wand" ? "crosshair" : "none"
              }}
            >
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUpOrLeave}
                onMouseLeave={handleMouseUpOrLeave}
                className="block select-none max-w-full"
              />
              
              {/* Eraser visual cursor overlay */}
              {tool === "eraser" && !isProcessing && (
                <div 
                  className="pointer-events-none fixed border border-rose-500 rounded-full bg-rose-500/20 z-50 transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    width: `${brushSize}px`,
                    height: `${brushSize}px`,
                    display: "none" // We will toggle in CSS or standard hovering can handle
                  }}
                />
              )}
            </div>
            
            <p className="text-[10px] text-neutral-400 mt-2 font-mono flex items-center gap-1">
              <ImageIcon className="w-3 h-3" />
              Transparent overlay preview checkerboard
            </p>
          </div>

          {/* Workbench Controls Column */}
          <div className="md:col-span-5 bg-neutral-100/60 rounded-2xl p-4 border border-neutral-200/80 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-black text-neutral-800 dark:text-slate-200 uppercase tracking-wider">Garment Extraction Toolkit</h4>
                <p className="text-[10px] text-neutral-500 dark:text-slate-400 mt-0.5">Remove shadows, hangers, and backdrops instantly.</p>
              </div>

              {/* Auto Action */}
              <button
                type="button"
                onClick={handleAutoExtract}
                disabled={isProcessing || !imageLoaded}
                className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition transform active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer border border-indigo-400/25 disabled:opacity-50"
              >
                <Wand2 className="w-4 h-4 animate-bounce" />
                ✨ Auto-Extract Background
              </button>

              <div className="border-t border-neutral-200 dark:border-slate-700 my-2 pt-3 space-y-3">
                <span className="text-[10px] font-bold text-neutral-500 dark:text-slate-400 block uppercase tracking-wider">Manual Adjustment Tools:</span>
                
                {/* Tool Selector Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTool("wand")}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition cursor-pointer ${
                      tool === "wand"
                        ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                        : "bg-white dark:bg-slate-900 border-neutral-200 dark:border-slate-700 text-neutral-600 dark:text-slate-400 hover:bg-neutral-50 dark:bg-slate-950"
                    }`}
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    Color Wand
                  </button>
                  <button
                    type="button"
                    onClick={() => setTool("eraser")}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition cursor-pointer ${
                      tool === "eraser"
                        ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                        : "bg-white dark:bg-slate-900 border-neutral-200 dark:border-slate-700 text-neutral-600 dark:text-slate-400 hover:bg-neutral-50 dark:bg-slate-950"
                    }`}
                  >
                    <Eraser className="w-3.5 h-3.5" />
                    Erase Brush
                  </button>
                </div>

                {/* Tolerance slider (for Magic Wand / Auto-Extract) */}
                {tool === "wand" && (
                  <div className="space-y-1 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-neutral-200/80">
                    <div className="flex justify-between items-center text-[10px] font-bold text-neutral-500 dark:text-slate-400">
                      <span className="flex items-center gap-1"><Sliders className="w-3 h-3 text-indigo-500" /> Color Tolerance</span>
                      <span className="text-neutral-700 dark:text-slate-300">{tolerance}</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="150"
                      value={tolerance}
                      onChange={(e) => setTolerance(Number(e.target.value))}
                      className="w-full accent-indigo-600"
                    />
                    <span className="text-[8px] text-neutral-400 block mt-0.5">Higher tolerance removes broader matching colors. Click on remaining background to test.</span>
                  </div>
                )}

                {/* Brush size slider (for Eraser) */}
                {tool === "eraser" && (
                  <div className="space-y-1 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-neutral-200/80">
                    <div className="flex justify-between items-center text-[10px] font-bold text-neutral-500 dark:text-slate-400">
                      <span>Brush Size</span>
                      <span className="text-neutral-700 dark:text-slate-300">{brushSize}px</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="100"
                      value={brushSize}
                      onChange={(e) => setBrushSize(Number(e.target.value))}
                      className="w-full accent-indigo-600"
                    />
                    <span className="text-[8px] text-neutral-400 block mt-0.5">Draw over shadows, straps, or hanger hooks on the canvas.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Editing and Reset Utilities */}
            <div className="space-y-2 border-t border-neutral-200 dark:border-slate-700 pt-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleUndo}
                  disabled={undoStack.length <= 1}
                  className="flex-1 py-2 bg-white dark:bg-slate-900 hover:bg-neutral-50 dark:bg-slate-950 border border-neutral-200 dark:border-slate-700 text-neutral-700 dark:text-slate-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 disabled:opacity-40 cursor-pointer"
                >
                  <Undo className="w-3.5 h-3.5 text-neutral-500 dark:text-slate-400" />
                  Undo
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 py-2 bg-white dark:bg-slate-900 hover:bg-neutral-50 dark:bg-slate-950 border border-neutral-200 dark:border-slate-700 text-neutral-700 dark:text-slate-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-neutral-500 dark:text-slate-400" />
                  Original
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="px-3 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl border border-rose-100 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                  title="Upload different image"
                >
                  <Trash2 className="w-4 h-4 text-rose-500" />
                  Change Gown
                </button>
                <div className="flex-1 bg-green-50 text-green-700 border border-green-200/50 rounded-xl px-3 py-2 flex items-center justify-center gap-1 text-xs font-black uppercase tracking-wider">
                  <Check className="w-4 h-4 text-green-500" />
                  Transparent
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
