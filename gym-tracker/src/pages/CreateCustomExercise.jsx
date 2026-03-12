import React, { useState } from 'react';
import { ChevronDown, Image as ImageIcon, X, Plus, Dumbbell, Info } from 'lucide-react';

const CreateCustomExercise = () => {
  const [formData, setFormData] = useState({
    name: '',
    mainMuscle: '',
    secondaryMuscles: '',
    equipment: '',
    instructions: '',
  });

  const muscleGroups = ["Chest", "Back", "Legs", "Shoulders", "Arms", "Core", "Full Body"];

  return (
    <div className="min-h-screen bg-black text-zinc-100 p-6 font-outfit">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-inter tracking-tight">Create <span className="text-accent">Custom</span></h1>
          <p className="text-zinc-500 mt-2">Add a unique movement to your personal database.</p>
        </div>

        <div className="space-y-6 bg-zinc-900/50 p-8 rounded-3xl border border-zinc-800 shadow-xl">
          
          {/* Exercise Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400 ml-1">Exercise Name</label>
            <input 
              type="text"
              placeholder="e.g. Weighted Pullups"
              className="w-full bg-zinc-800/50 border border-zinc-700 rounded-2xl py-3 px-4 outline-none focus:border-accent/50 
                        focus:ring-1 focus:ring-accent/20 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Main Muscle Dropdown */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400 ml-1">Main Muscle</label>
              <div className="relative">
                <select className="w-full bg-zinc-800/50 border border-zinc-700 rounded-2xl py-3 px-4 appearance-none outline-none 
                                focus:border-accent/50 transition-all cursor-pointer">
                  <option value="" disabled selected>Select Muscle</option>
                  {muscleGroups.map(muscle => (
                    <option key={muscle} value={muscle.toLowerCase()}>{muscle}</option>
                  ))}
                </select>
                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
              </div>
            </div>

            {/* Equipment */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400 ml-1">Equipment</label>
              <div className="relative">
                <Dumbbell size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input 
                  type="text"
                  placeholder="e.g. Barbell"
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-2xl py-3 pl-12 pr-4 outline-none 
                            focus:border-accent/50 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Secondary Muscles */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400 ml-1">Secondary Muscles (Optional)</label>
            <input 
              type="text"
              placeholder="e.g. Forearms, Biceps"
              className="w-full bg-zinc-800/50 border border-zinc-700 rounded-2xl py-3 px-4 outline-none 
                            focus:border-accent/50 transition-all"
            />
          </div>

          {/* Instructions */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400 ml-1">Instructions</label>
            <textarea 
              rows="4"
              placeholder="How do you perform this exercise?"
              className="w-full bg-zinc-800/50 border border-zinc-700 rounded-2xl py-3 px-4 outline-none 
                            focus:border-accent/50 transition-all resize-none"
            ></textarea>
          </div>

          {/* Image Upload Area */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400 ml-1">Exercise Images</label>
            <div className="border-2 border-dashed border-zinc-700 rounded-2xl p-8 flex flex-col items-center 
                            justify-center hover:border-accent/30 hover:bg-accent/5 transition-all cursor-pointer group">
              <div className="bg-zinc-800 p-3 rounded-full group-hover:scale-110 transition-transform">
                <ImageIcon className="text-zinc-400 group-hover:text-accent" />
              </div>
              <p className="mt-3 text-sm text-zinc-400">Click to upload or drag and drop</p>
              <p className="text-xs text-zinc-600 mt-1">PNG, JPG or GIF (max. 2MB)</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex gap-4">
            <button className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-4 rounded-2xl transition-all active:scale-[0.98]">
              Cancel
            </button>
            <button className="flex-2 bg-accent/60 text-zinc-200  font-bold py-4 rounded-2xl shadow-lg shadow-accent/20 
                                hover:opacity-90 transition-all active:scale-[0.98]">
              Create Exercise
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCustomExercise;