// Shared garment + measurement-field vocabulary used by the designer
// (Measurements.tsx) and worker (WorkerMeasurements.tsx) flows so every
// role captures the same field set for the same garment.

export const genders = [
  { id: "male", label: "Male", emoji: "👨" },
  { id: "female", label: "Female", emoji: "👩" },
];

export const ageGroups = [
  { id: "child", label: "Child", desc: "0–12 yrs" },
  { id: "teen", label: "Teen", desc: "13–17 yrs" },
  { id: "adult", label: "Adult", desc: "18–59 yrs" },
  { id: "elder", label: "Elder", desc: "60+ yrs" },
];

export const categories = [
  { id: "men", label: "Men", emoji: "👔" },
  { id: "women", label: "Women", emoji: "👗" },
  { id: "children", label: "Children", emoji: "🧒" },
];

export const garmentTypes: Record<string, { label: string; emoji: string }[]> = {
  men: [
    { label: "Agbada", emoji: "🥻" }, { label: "Senator", emoji: "👔" }, { label: "Kaftan", emoji: "🧥" },
    { label: "Suit", emoji: "🤵" }, { label: "Shirt", emoji: "👕" }, { label: "Trouser", emoji: "👖" },
    { label: "Blazer", emoji: "🧥" },
  ],
  women: [
    { label: "Blouse", emoji: "👚" }, { label: "Skirt", emoji: "👗" }, { label: "Gown", emoji: "💃" },
    { label: "Iro & Buba", emoji: "🥻" }, { label: "Jumpsuit", emoji: "🩱" }, { label: "Wrapper", emoji: "👘" },
    { label: "Bridal", emoji: "👰" },
  ],
  children: [
    { label: "Shirt", emoji: "👕" }, { label: "Dress", emoji: "👗" }, { label: "Trouser", emoji: "👖" },
    { label: "Agbada", emoji: "🥻" }, { label: "Uniform", emoji: "🎓" },
  ],
};

export const defaultMeasurementFields: Record<string, string[]> = {
  Agbada: ["Chest", "Shoulder", "Sleeve", "Length", "Round Arm", "Neck"],
  Senator: ["Chest", "Shoulder", "Sleeve", "Length", "Round Arm", "Neck"],
  Kaftan: ["Chest", "Shoulder", "Sleeve", "Length", "Round Arm"],
  Suit: ["Chest", "Shoulder", "Sleeve", "Length", "Waist", "Hip", "Trouser Length", "Thigh"],
  Shirt: ["Chest", "Shoulder", "Sleeve", "Length", "Neck", "Round Arm"],
  Trouser: ["Waist", "Hip", "Thigh", "Knee", "Length", "Bottom"],
  Blazer: ["Chest", "Shoulder", "Sleeve", "Back Length", "Waist"],
  Blouse: ["Bust", "Shoulder", "Sleeve", "Length", "Round Arm", "Under Bust"],
  Skirt: ["Waist", "Hip", "Length", "Knee"],
  Gown: ["Bust", "Waist", "Hip", "Shoulder", "Sleeve", "Length", "Under Bust"],
  "Iro & Buba": ["Bust", "Shoulder", "Sleeve", "Blouse Length", "Wrapper Length", "Hip"],
  Jumpsuit: ["Bust", "Waist", "Hip", "Shoulder", "Sleeve", "Full Length", "Inseam"],
  Wrapper: ["Waist", "Hip", "Length"],
  Bridal: ["Bust", "Waist", "Hip", "Shoulder", "Sleeve", "Full Length", "Under Bust", "Train Length"],
  Dress: ["Chest", "Shoulder", "Length", "Waist"],
  Uniform: ["Chest", "Shoulder", "Sleeve", "Length", "Waist", "Trouser Length"],
};