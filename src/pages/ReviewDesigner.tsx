import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Star, Send, Camera, CheckCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import designerAvatar1 from "@/assets/designer-avatar-1.jpg";
import designerAvatar2 from "@/assets/designer-avatar-2.jpg";
import designerAvatar3 from "@/assets/designer-avatar-3.jpg";

const designerInfo: Record<string, { name: string; avatar: string }> = {
  "nana-ama": { name: "Nana Ama Couture", avatar: designerAvatar1 },
  "kwame-styles": { name: "Kwame Styles", avatar: designerAvatar2 },
  "efya-designs": { name: "Efya Designs", avatar: designerAvatar3 },
};

const ratingLabels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

const categories = [
  { label: "Quality", key: "quality" },
  { label: "Communication", key: "communication" },
  { label: "Timeliness", key: "timeliness" },
  { label: "Value", key: "value" },
];

const ReviewDesigner = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const designer = designerInfo[id || "nana-ama"] || designerInfo["nana-ama"];

  const [overallRating, setOverallRating] = useState(0);
  const [categoryRatings, setCategoryRatings] = useState<Record<string, number>>({});
  const [review, setReview] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleCategoryRating = (key: string, value: number) => {
    setCategoryRatings((prev) => ({ ...prev, [key]: value }));
  };

  const canSubmit = overallRating > 0 && review.trim().length > 10;

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => navigate(-1), 2500);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="w-20 h-20 rounded-full bg-status-completed/20 flex items-center justify-center mb-6"
        >
          <CheckCircle className="w-10 h-10 text-status-completed" />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl font-bold text-foreground mb-2"
        >
          Review Submitted!
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-sm text-muted-foreground text-center"
        >
          Thank you for reviewing {designer.name}. Your feedback helps other clients.
        </motion.p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl px-4 py-3 flex items-center gap-3 border-b border-border/50">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </motion.button>
        <h1 className="text-lg font-semibold text-foreground">Write a Review</h1>
      </div>

      <div className="px-5 pt-5 space-y-6">
        {/* Designer Card */}
        <div className="card-surface p-4 flex items-center gap-3">
          <img src={designer.avatar} alt={designer.name} className="w-14 h-14 rounded-2xl object-cover" />
          <div>
            <p className="text-sm font-semibold text-foreground">{designer.name}</p>
            <p className="text-[10px] text-muted-foreground">How was your experience?</p>
          </div>
        </div>

        {/* Overall Rating */}
        <div className="text-center space-y-3">
          <p className="text-sm font-semibold text-foreground">Overall Rating</p>
          <div className="flex justify-center gap-3">
            {[1, 2, 3, 4, 5].map((s) => (
              <motion.button
                key={s}
                whileTap={{ scale: 0.85 }}
                onClick={() => setOverallRating(s)}
              >
                <Star
                  className={`w-9 h-9 transition-colors ${
                    s <= overallRating ? "text-primary fill-primary" : "text-secondary"
                  }`}
                />
              </motion.button>
            ))}
          </div>
          {overallRating > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs font-medium text-primary"
            >
              {ratingLabels[overallRating]}
            </motion.p>
          )}
        </div>

        {/* Category Ratings */}
        <div className="space-y-4">
          <p className="text-sm font-semibold text-foreground">Rate by Category</p>
          {categories.map((cat) => (
            <div key={cat.key} className="card-surface p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-foreground">{cat.label}</span>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <motion.button
                      key={s}
                      whileTap={{ scale: 0.85 }}
                      onClick={() => handleCategoryRating(cat.key, s)}
                    >
                      <Star
                        className={`w-5 h-5 transition-colors ${
                          s <= (categoryRatings[cat.key] || 0) ? "text-primary fill-primary" : "text-secondary"
                        }`}
                      />
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Written Review */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-foreground">Your Review</p>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Share your experience with this designer…"
            rows={4}
            className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none"
          />
          <p className="text-[10px] text-muted-foreground text-right">{review.length} / 500</p>
        </div>

        {/* Add Photos */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          className="w-full card-surface p-4 flex items-center justify-center gap-2 border border-dashed border-border"
        >
          <Camera className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Add Photos (optional)</span>
        </motion.button>
      </div>

      {/* Submit CTA */}
      <div className="fixed bottom-20 left-0 right-0 px-5">
        <div className="max-w-md mx-auto">
          <motion.button
            whileTap={{ scale: 0.97 }}
            disabled={!canSubmit}
            onClick={handleSubmit}
            className={`w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
              canSubmit ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            <Send className="w-4 h-4" /> Submit Review
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default ReviewDesigner;
