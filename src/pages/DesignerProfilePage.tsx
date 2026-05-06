import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Star, MapPin, CalendarDays, MessageCircle, Heart, Shield, Clock, ChevronRight } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useShowcase } from "@/contexts/ShowcaseContext";
import designerAvatar1 from "@/assets/designer-avatar-1.jpg";
import designerAvatar2 from "@/assets/designer-avatar-2.jpg";
import designerAvatar3 from "@/assets/designer-avatar-3.jpg";
import portfolio1 from "@/assets/designer-portfolio-1.jpg";
import portfolio2 from "@/assets/designer-portfolio-2.jpg";
import portfolio3 from "@/assets/designer-portfolio-3.jpg";
import portfolio4 from "@/assets/designer-portfolio-4.jpg";
import portfolio5 from "@/assets/designer-portfolio-5.jpg";
import portfolio6 from "@/assets/designer-portfolio-6.jpg";

const designerData: Record<string, any> = {
  "nana-ama": {
    name: "Nana Ama Couture",
    avatar: designerAvatar1,
    coverImage: portfolio4,
    experience: "8 years",
    verified: true,
    rating: 4.9,
    reviews: 127,
    location: "East Legon, Accra",
    specialties: ["Bridal", "Evening Wear", "Kente Fusion"],
    bio: "Award-winning designer specializing in bespoke bridal and evening wear. Every piece tells a story woven with African heritage and modern elegance.",
    pricing: "GHS 2,500",
    availability: "Next available: Apr 2",
    portfolio: [portfolio1, portfolio4, portfolio3, portfolio5, portfolio6, portfolio2],
    reviews_list: [
      { name: "Abena M.", rating: 5, text: "Absolutely stunning wedding dress. Nana Ama understood my vision perfectly and delivered beyond expectations.", date: "2 weeks ago" },
      { name: "Gifty O.", rating: 5, text: "Professional, creative, and delivers on time. My evening gown was the highlight of the event.", date: "1 month ago" },
      { name: "Akosua D.", rating: 4, text: "Beautiful work. The kente fusion dress was a masterpiece. Only needed minor adjustments.", date: "2 months ago" },
    ],
  },
  "kwame-styles": {
    name: "Kwame Styles",
    avatar: designerAvatar2,
    coverImage: portfolio2,
    experience: "12 years",
    verified: true,
    rating: 4.7,
    reviews: 89,
    location: "Adum, Kumasi",
    specialties: ["Agbada", "Traditional", "Men's Formal"],
    bio: "Master tailor bringing timeless African menswear into the modern era. Specializing in agbada, senator, and bespoke suits with an African twist.",
    pricing: "GHS 1,800",
    availability: "Next available: Mar 30",
    portfolio: [portfolio2, portfolio3, portfolio6, portfolio1, portfolio5, portfolio4],
    reviews_list: [
      { name: "Kofi B.", rating: 5, text: "The agbada was perfection. Every stitch was flawless. Will definitely come back.", date: "1 week ago" },
      { name: "Yaw K.", rating: 4, text: "Great craftsmanship on my 3-piece suit. Kwame really knows his craft.", date: "3 weeks ago" },
    ],
  },
  "efya-designs": {
    name: "Efya Designs",
    avatar: designerAvatar3,
    coverImage: portfolio6,
    experience: "5 years",
    verified: false,
    rating: 4.8,
    reviews: 64,
    location: "Tema, Accra",
    specialties: ["Contemporary", "Casual", "Ankara"],
    bio: "Bringing a fresh perspective to African fashion. Bold patterns, modern silhouettes, and everyday elegance that celebrates our heritage.",
    pricing: "GHS 1,200",
    availability: "Next available: Apr 8",
    portfolio: [portfolio6, portfolio5, portfolio3, portfolio4, portfolio1, portfolio2],
    reviews_list: [
      { name: "Esi T.", rating: 5, text: "Efya's designs are unique and wearable. I get compliments every time I wear her pieces.", date: "5 days ago" },
      { name: "Maame A.", rating: 5, text: "Love the modern take on ankara. Fresh and creative!", date: "2 weeks ago" },
    ],
  },
};

const tabs = ["Portfolio", "Reviews", "About"] as const;
type Tab = typeof tabs[number];

const DesignerProfilePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<Tab>("Portfolio");
  const [saved, setSaved] = useState(false);
  const { postsByDesigner } = useShowcase();
  const showcasePosts = postsByDesigner(id || "nana-ama");

  const designer = designerData[id || "nana-ama"] || designerData["nana-ama"];

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Cover & Header */}
      <div className="relative h-56">
        <img src={designer.coverImage} alt={designer.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute top-0 left-0 right-0 px-5 pt-6 flex items-center justify-between">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setSaved(!saved)}
            className="w-9 h-9 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center"
          >
            <Heart className={`w-4 h-4 ${saved ? "text-destructive fill-destructive" : "text-foreground"}`} />
          </motion.button>
        </div>
      </div>

      {/* Profile Info */}
      <div className="px-5 -mt-12 relative z-10">
        <div className="flex items-end gap-4">
          <img src={designer.avatar} alt={designer.name} className="w-20 h-20 rounded-2xl object-cover ring-4 ring-background" />
          <div className="pb-1">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-foreground">{designer.name}</h1>
              {designer.verified && (
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Shield className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                <span className="text-xs font-semibold text-foreground">{designer.rating}</span>
                <span className="text-[10px] text-muted-foreground">({designer.reviews})</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">{designer.location}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mt-5">
          {[
            { label: "Experience", value: designer.experience },
            { label: "Starts from", value: designer.pricing },
            { label: "Available", value: designer.availability.replace("Next available: ", "") },
          ].map((s) => (
            <div key={s.label} className="card-surface p-3 text-center">
              <p className="text-xs font-bold text-foreground">{s.value}</p>
              <p className="text-[9px] text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Specialties */}
        <div className="flex gap-2 mt-4 flex-wrap">
          {designer.specialties.map((s: string) => (
            <span key={s} className="text-[10px] font-medium px-3 py-1.5 rounded-full bg-secondary text-muted-foreground">
              {s}
            </span>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-5 bg-secondary rounded-xl p-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors ${
                activeTab === tab ? "bg-card text-foreground" : "text-muted-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="mt-4"
          >
            {activeTab === "Portfolio" && (
              <div className="grid grid-cols-2 gap-2">
                {(showcasePosts.length > 0
                  ? showcasePosts.map((p) => p.media[0])
                  : designer.portfolio
                ).map((img: string, idx: number) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.06 }}
                    className="aspect-square rounded-xl overflow-hidden cursor-pointer"
                    onClick={() => navigate("/showcase")}
                  >
                    <img src={img} alt={`Portfolio ${idx + 1}`} className="w-full h-full object-cover" />
                  </motion.div>
                ))}
              </div>
            )}

            {activeTab === "Reviews" && (
              <div className="space-y-3">
                <div className="card-surface p-4 flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">{designer.rating}</p>
                    <div className="flex gap-0.5 mt-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`w-3 h-3 ${s <= Math.floor(designer.rating) ? "text-primary fill-primary" : "text-secondary"}`} />
                      ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">{designer.reviews} reviews</p>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = designer.reviews_list.filter((r: any) => r.rating === star).length;
                      const pct = (count / designer.reviews_list.length) * 100;
                      return (
                        <div key={star} className="flex items-center gap-2">
                          <span className="text-[9px] text-muted-foreground w-2">{star}</span>
                          <div className="flex-1 bg-secondary rounded-full h-1.5">
                            <div className="bg-primary h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {designer.reviews_list.map((r: any, idx: number) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    className="card-surface p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                          <span className="text-[10px] font-semibold text-foreground">{r.name.split(" ").map((n: string) => n[0]).join("")}</span>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-foreground">{r.name}</p>
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className={`w-2.5 h-2.5 ${s <= r.rating ? "text-primary fill-primary" : "text-secondary"}`} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-[9px] text-muted-foreground">{r.date}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{r.text}</p>
                  </motion.div>
                ))}
              </div>
            )}

            {activeTab === "About" && (
              <div className="space-y-4">
                <div className="card-surface p-4">
                  <h3 className="text-xs font-semibold text-foreground mb-2">About</h3>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{designer.bio}</p>
                </div>
                <div className="card-surface p-4">
                  <h3 className="text-xs font-semibold text-foreground mb-3">Details</h3>
                  <div className="space-y-3">
                    {[
                      { icon: MapPin, label: "Location", value: designer.location },
                      { icon: Clock, label: "Availability", value: designer.availability },
                      { icon: Star, label: "Rating", value: `${designer.rating} (${designer.reviews} reviews)` },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                          <item.icon className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground">{item.label}</p>
                          <p className="text-xs font-medium text-foreground">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Fixed CTA Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 safe-bottom">
        <div className="bg-card/95 backdrop-blur-xl border-t border-border px-5 py-3 max-w-md mx-auto">
          <div className="flex gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(`/messages?designer=${id || "nana-ama"}&name=${encodeURIComponent(designer.name)}`)}
              className="flex-1 py-3 rounded-xl bg-secondary text-foreground text-sm font-semibold flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" /> Message
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(`/appointments?designer=${id || "nana-ama"}&name=${encodeURIComponent(designer.name)}&avatar=${encodeURIComponent(designer.avatar)}`)}
              className="flex-[2] py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2"
            >
              <CalendarDays className="w-4 h-4" /> Book Appointment
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignerProfilePage;
