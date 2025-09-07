import React, { useState, useRef } from "react";

export default function JaldrishtiReport() {
  const [location, setLocation] = useState("");
  const [hazardType, setHazardType] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const inputFileRef = useRef(null);

  function handleFileChange(e) {
    const file = e?.target?.files && e.target.files[0];
    if (!file) {
      setImageFile(null);
      return;
    }
    setImageFile(file);
  }

  function handleSubmit() {
    console.log({ location, hazardType, description, imageFile });
    alert("Report submitted successfully!");
    
    // Reset form
    setLocation("");
    setHazardType("");
    setDescription("");
    setImageFile(null);
    if (inputFileRef.current) {
      inputFileRef.current.value = "";
    }
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="px-6 py-4">
        <div className="flex justify-center">
          <nav className="flex items-center gap-8 text-slate-300 bg-slate-800 px-8 py-3 rounded-full">
            <span className="text-white text-xl font-semibold flex items-center gap-2">
              <span>🌊</span>
              <span>Jaldrishti</span>
            </span>
            <button className="hover:text-white transition-colors">Home</button>
            <button className="hover:text-white transition-colors">Dashboard</button>
            <button className="text-cyan-400 font-medium">Report</button>
            <button className="hover:text-white transition-colors">Map</button>
            <button className="bg-cyan-400 text-slate-900 px-6 py-2 rounded-full font-semibold hover:bg-cyan-300 transition-colors">
              Login
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex justify-center px-6 py-12">
        <div className="w-full max-w-lg">
          <div className="bg-slate-800 rounded-2xl p-8 shadow-2xl">
            <h1 className="text-white text-2xl font-bold text-center mb-8">
              Report Water Hazard
            </h1>

            {/* Location Field */}
            <div className="mb-6">
              <label className="block text-white text-sm font-medium mb-3">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter location"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
              />
            </div>

            {/* Hazard Type Field */}
            <div className="mb-6">
              <label className="block text-white text-sm font-medium mb-3">
                Type of Hazard
              </label>
              <div className="relative">
                <select
                  value={hazardType}
                  onChange={(e) => setHazardType(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent cursor-pointer"
                >
                  <option value="" className="text-slate-400">Select the type of hazard</option>
                  <option value="high-tide">High Tide/Coastal Flooding</option>
                  <option value="storm">Storm/Rough Seas</option>
                  <option value="tsunami">Tsunami Warning</option>
                  <option value="rip-current">Dangerous Rip Current</option>
                  <option value="marine-debris">Marine Debris</option>
                  <option value="oil-spill">Oil Spill</option>
                  <option value="algae-bloom">Algae Bloom</option>
                  <option value="shark-sighting">Shark Sighting</option>
                  <option value="jellyfish-swarm">Jellyfish Swarm</option>
                  <option value="other-hazard">Other Hazard</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Description Field */}
            <div className="mb-6">
              <label className="block text-white text-sm font-medium mb-3">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the hazard in detail"
                rows={4}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent resize-none"
              />
            </div>

            {/* Upload Image Field */}
            <div className="mb-8">
              <label className="block text-white text-sm font-medium mb-3">
                Upload Image
              </label>
              <div className="flex items-center gap-4">
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg cursor-pointer hover:bg-slate-600 transition-colors">
                  <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="text-white text-sm font-medium">Choose File</span>
                  <input
                    ref={inputFileRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <span className="text-slate-400 text-sm">
                  {imageFile ? imageFile.name : "No file chosen"}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              className="w-full bg-cyan-400 text-slate-900 py-3 rounded-lg font-semibold text-lg hover:bg-cyan-300 transition-colors"
            >
              Submit Report
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}