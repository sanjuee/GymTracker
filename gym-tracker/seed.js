import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const supabase = createClient('https://qgrbindcrcgwzanbzykf.supabase.co', 
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFncmJpbmRjcmNnd3phbmJ6eWtmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjYyMTEzMiwiZXhwIjoyMDg4MTk3MTMyfQ.m5MEi9x9C2a4oe-7sH52szLlb4EN5kttw-WoNQceN_k");


const REPO_DATA_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json';
const IMAGE_BASE_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';

const categoryMap = {
  "Lower back": "Back", "Middle back": "Back", "Lats": "Back", "Traps": "Shoulders",
  "Quadriceps": "Legs", "Hamstrings": "Legs", "Glutes": "Legs", "Calves": "Legs",
};

async function seedDatabase() {
  try {
    console.log("📥 Fetching data...");
    const { data: rawExercises } = await axios.get(REPO_DATA_URL);

    const formatted = rawExercises.map(ex => {
    const specificMuscle = ex.primaryMuscles?.[0] 
        ? ex.primaryMuscles[0].charAt(0).toUpperCase() + ex.primaryMuscles[0].slice(1)
        : 'Full Body';

    const generalCategory = categoryMap[specificMuscle] || specificMuscle;

    // Map both images if they exist
    const imageUrls = ex.images?.map(img => `${IMAGE_BASE_URL}${img.replace(/^\//, '')}`) || [];

    return {
        name: ex.name,
        category: generalCategory,
        main_muscle: specificMuscle,
        // Ensure these column names match your Supabase Table!
        secondary_muscles: ex.secondaryMuscles || [], 
        instructions: ex.instructions || [],
        image_urls: imageUrls, // Storing as an array of strings
        force: ex.force || null,
        equipment: ex.equipment || null,
        mechanic: ex.mechanic || null
    };
});

   
    console.log(`🚀 Uploading ${formatted.length} exercises...`);
    const batchSize = 100;
    for (let i = 0; i < formatted.length; i += batchSize) {
      const batch = formatted.slice(i, i + batchSize);
      const { error } = await supabase.from('exercises').insert(batch);
      
      if (error) {
        // This will tell you if a specific column is missing or wrong
        console.error(`❌ Batch failed at index ${i}:`, error.message, error.details);
        return; 
      }
      console.log(`✅ Uploaded ${i + batch.length} items...`);
    }

    console.log("✨ Done!");
  } catch (err) {
    console.error("💥 Critical Failure:", err.message);
  }
}

seedDatabase();