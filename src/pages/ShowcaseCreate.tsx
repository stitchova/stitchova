import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ImagePlus, Video, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useShowcase, STYLE_TAGS, StyleTag } from "@/contexts/ShowcaseContext";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

const MAX_PHOTOS = 5;
const MAX_CAPTION = 300;

const fileToDataUrl = (f: File) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(f);
  });

const ShowcaseCreate = () => {
  const navigate = useNavigate();
  const { createPost } = useShowcase();
  const { toast } = useToast();
  const [media, setMedia] = useState<string[]>([]);
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [poster, setPoster] = useState<string | undefined>(undefined);
  const [caption, setCaption] = useState("");
  const [tags, setTags] = useState<StyleTag[]>([]);
  const [available, setAvailable] = useState(true);
  const [posting, setPosting] = useState(false);
  const photoRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  const onPhotos = async (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files).slice(0, MAX_PHOTOS - media.length);
    const urls = await Promise.all(arr.map(fileToDataUrl));
    setMedia((m) => [...m, ...urls].slice(0, MAX_PHOTOS));
    setMediaType("image");
  };

  const captureVideoPoster = (src: string) =>
    new Promise<string | undefined>((resolve) => {
      const v = document.createElement("video");
      v.src = src; v.muted = true; v.playsInline = true; v.preload = "metadata";
      v.onloadeddata = () => {
        try {
          v.currentTime = Math.min(0.5, (v.duration || 1) / 2);
        } catch { resolve(undefined); }
      };
      v.onseeked = () => {
        try {
          const c = document.createElement("canvas");
          c.width = v.videoWidth || 720; c.height = v.videoHeight || 1280;
          const ctx = c.getContext("2d");
          if (!ctx) return resolve(undefined);
          ctx.drawImage(v, 0, 0, c.width, c.height);
          resolve(c.toDataURL("image/jpeg", 0.7));
        } catch { resolve(undefined); }
      };
      v.onerror = () => resolve(undefined);
    });

  const onVideo = async (files: FileList | null) => {
    if (!files || !files[0]) return;
    const url = await fileToDataUrl(files[0]);
    setMedia([url]);
    setMediaType("video");
    const p = await captureVideoPoster(url);
    setPoster(p);
  };

  const toggleTag = (t: StyleTag) => {
    setTags((cur) => {
      if (cur.includes(t)) return cur.filter((x) => x !== t);
      if (cur.length >= 3) { toast({ title: "Up to 3 tags", variant: "destructive" }); return cur; }
      return [...cur, t];
    });
  };

  const submit = async () => {
    if (media.length === 0) { toast({ title: "Add at least one photo or video", variant: "destructive" }); return; }
    if (!caption.trim()) { toast({ title: "Add a caption", variant: "destructive" }); return; }
    if (tags.length === 0) { toast({ title: "Pick at least one tag", variant: "destructive" }); return; }
    setPosting(true);
    await new Promise((r) => setTimeout(r, 600));
    const post = createPost({ media, mediaType, poster, caption: caption.trim(), tags, available });
    setPosting(false);
    toast({ title: "Post published" });
    navigate("/showcase", { state: { scrollTo: post.id } });
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="px-5 pt-6 pb-3 flex items-center gap-3">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </motion.button>
        <h1 className="text-lg font-bold text-foreground">New post</h1>
      </div>

      <div className="px-5 space-y-5">
        {/* Media area */}
        <div className="space-y-3">
          {media.length === 0 ? (
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => photoRef.current?.click()} className="card-glass p-6 flex flex-col items-center justify-center aspect-square gap-2">
                <ImagePlus className="w-6 h-6 text-primary" />
                <span className="text-xs font-semibold text-foreground">Photos</span>
                <span className="text-[10px] text-muted-foreground">up to 5</span>
              </button>
              <button onClick={() => videoRef.current?.click()} className="card-glass p-6 flex flex-col items-center justify-center aspect-square gap-2">
                <Video className="w-6 h-6 text-primary" />
                <span className="text-xs font-semibold text-foreground">Video</span>
                <span className="text-[10px] text-muted-foreground">max 60s</span>
              </button>
            </div>
          ) : (
            <div>
              {mediaType === "image" ? (
                <div className="grid grid-cols-3 gap-2">
                  {media.map((m, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden">
                      <img src={m} alt="" className="w-full h-full object-cover" />
                      <button onClick={() => setMedia((arr) => arr.filter((_, idx) => idx !== i))}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-background/80 flex items-center justify-center">
                        <X className="w-3 h-3 text-foreground" />
                      </button>
                    </div>
                  ))}
                  {media.length < MAX_PHOTOS && (
                    <button onClick={() => photoRef.current?.click()}
                      className="aspect-square rounded-xl border-2 border-dashed border-border flex items-center justify-center text-muted-foreground">
                      <ImagePlus className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden bg-black">
                  <video src={media[0]} className="w-full max-h-80 object-contain" controls />
                  <button onClick={() => setMedia([])}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-background/80 flex items-center justify-center">
                    <X className="w-3.5 h-3.5 text-foreground" />
                  </button>
                </div>
              )}
            </div>
          )}
          <input ref={photoRef} type="file" accept="image/*" multiple hidden onChange={(e) => onPhotos(e.target.files)} />
          <input ref={videoRef} type="file" accept="video/*" hidden onChange={(e) => onVideo(e.target.files)} />
        </div>

        {/* Caption */}
        <div className="space-y-2">
          <textarea value={caption} onChange={(e) => setCaption(e.target.value.slice(0, MAX_CAPTION))}
            placeholder="Describe this piece…" rows={4}
            className="w-full glass-input p-4 text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none" />
          <p className="text-[10px] text-muted-foreground text-right">{caption.length}/{MAX_CAPTION}</p>
        </div>

        {/* Tags */}
        <div>
          <p className="text-xs font-semibold text-foreground mb-2">Style tags <span className="text-muted-foreground font-normal">· up to 3</span></p>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-1">
            {STYLE_TAGS.map((t) => {
              const active = tags.includes(t);
              return (
                <button key={t} onClick={() => toggleTag(t)}
                  className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-semibold transition ${
                    active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                  }`}>
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        {/* Available toggle */}
        <div className="card-glass p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-foreground">Available to order</p>
            <p className="text-[10px] text-muted-foreground">Show an "Available" badge on this post.</p>
          </div>
          <Switch checked={available} onCheckedChange={setAvailable} />
        </div>
      </div>

      {/* Submit */}
      <div className="fixed bottom-0 left-0 right-0 z-40 safe-bottom">
        <div className="max-w-md mx-auto px-5 py-3 bg-background/90 backdrop-blur-xl border-t border-border/40">
          <motion.button whileTap={{ scale: 0.97 }} disabled={posting} onClick={submit}
            className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground text-sm font-bold disabled:opacity-60">
            {posting ? "Publishing…" : "Post to Showcase"}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default ShowcaseCreate;