import { useState, FormEvent } from "react";
import { X, Star, MessageSquarePlus, PenTool, Sparkles } from "lucide-react";
import { motion } from "motion/react";

interface ReviewModalProps {
  currentUser: string;
  currentUserEmail: string;
  onClose: () => void;
  onSubmitReview: (review: {
    customerName: string;
    customerEmail: string;
    rating: number;
    feedback: string;
    request: string;
  }) => Promise<void>;
}

export default function ReviewModal({ 
  currentUser, 
  currentUserEmail, 
  onClose, 
  onSubmitReview 
}: ReviewModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [name, setName] = useState(currentUser || "");
  const [email, setEmail] = useState(currentUserEmail || "");
  const [feedback, setFeedback] = useState("");
  const [request, setRequest] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      await onSubmitReview({
        customerName: name.trim(),
        customerEmail: email.trim(),
        rating,
        feedback: feedback.trim(),
        request: request.trim()
      });
      onClose();
    } catch (err) {
      console.error("Error submitting review:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300" id="review-modal-overlay">
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full border border-neutral-150 shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Accent Top Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-indigo-500 to-amber-500" />

        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="font-sans text-xl font-extrabold text-black tracking-tight flex items-center gap-2">
              <span>Rate Our Showroom</span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </h3>
            <p className="text-xs text-neutral-500">Rate your experience at Ella's Store and request custom styling lines!</p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-400 hover:text-black transition-colors border border-neutral-200/50 cursor-pointer"
            title="Close"
            id="close-review-modal-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Star Rating Selection */}
          <div className="space-y-2 text-center bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
            <label className="text-xs font-black text-neutral-500 uppercase tracking-widest block">Your Overall Rating</label>
            <div className="flex items-center justify-center gap-2.5 pt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  className="p-1 cursor-pointer transition-transform hover:scale-110 active:scale-90"
                  title={`Rate ${star} Stars`}
                >
                  <Star 
                    className={`w-8 h-8 transition-colors ${
                      star <= (hoverRating ?? rating) 
                        ? "fill-amber-500 text-amber-500" 
                        : "text-neutral-300"
                    }`} 
                  />
                </button>
              ))}
            </div>
            <p className="text-[11px] text-amber-600 font-extrabold tracking-wider uppercase pt-1">
              {rating === 5 ? "Absolutely Outstanding! ✦" :
               rating === 4 ? "Very Pleased! ★" :
               rating === 3 ? "Satisfactory" :
               rating === 2 ? "Needs Improvement" : "Extremely Dissatisfied"}
            </p>
          </div>

          {/* Customer Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-600 block">Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ella's Customer"
                className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-xs font-bold focus:outline-none focus:border-indigo-500 bg-neutral-50/50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-600 block">Email (For correspondence)</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="customer@example.com"
                className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-xs font-bold focus:outline-none focus:border-indigo-500 bg-neutral-50/50"
              />
            </div>
          </div>

          {/* Feedback Rating description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-600 block">Review Feedback (Site / Showroom Experience)</label>
            <textarea
              required
              rows={3}
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              placeholder="What did you love about our showroom experience, tailoring catalog, or checkout flow? Tell us your thoughts..."
              className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 placeholder-neutral-400"
            />
          </div>

          {/* Requests Block */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-600 block flex items-center gap-1.5">
              <PenTool className="w-3.5 h-3.5 text-indigo-500" />
              <span>Special Custom Fabric / Stylist Requests (Optional)</span>
            </label>
            <textarea
              rows={2}
              value={request}
              onChange={e => setRequest(e.target.value)}
              placeholder="e.g. Please source more premium Kente fabrics, custom wedding sizing services, or specific matching Ankara sets..."
              className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 placeholder-neutral-400"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-xs font-bold text-neutral-500 hover:bg-neutral-100 rounded-xl transition-colors text-center cursor-pointer border border-neutral-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl text-xs font-black tracking-wider uppercase transition-all shadow-md hover:shadow-indigo-600/15 cursor-pointer flex items-center justify-center gap-1.5"
            >
              {submitting ? (
                <span>Submitting...</span>
              ) : (
                <>
                  <MessageSquarePlus className="w-4 h-4 text-amber-300" />
                  <span>Submit Review</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
