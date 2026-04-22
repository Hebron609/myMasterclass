import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface WriteReflectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WriteReflectionModal({ isOpen, onClose }: WriteReflectionModalProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-0">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto">
        
        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-gray-100 flex justify-between items-start">
          <div>
            <h2 className="text-[24px] font-bold text-gray-900 font-heading mb-1.5">
              Write Reflection
            </h2>
            <p className="text-[15px] text-gray-600 font-sans">
              Document your journey, insights, and growth.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-8 space-y-6 overflow-y-auto max-h-[70vh]">
          
          {/* Title */}
          <div>
            <label className="block text-[15px] font-bold text-gray-600 mb-2 font-sans">
              Title
            </label>
            <input 
              type="text" 
              placeholder="Give your reflection a title..." 
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-[15px] text-gray-800 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 placeholder:text-gray-400 font-sans transition-colors" 
            />
          </div>

          {/* Reflection Type */}
          <div>
            <label className="block text-[15px] font-bold text-gray-600 mb-2 font-sans">
              Reflection Type
            </label>
            <div className="flex flex-wrap gap-3">
              {["Monthly", "Session", "Goals", "Free-form"].map((type) => (
                <button 
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-5 py-2 rounded-lg text-[14px] font-medium transition-colors font-sans border ${
                    selectedType === type 
                      ? "border-gray-800 bg-gray-800 text-white" 
                      : "border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-800"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-[15px] font-bold text-gray-600 mb-2 font-sans">
              Content
            </label>
            <textarea 
              placeholder="What did you learn? How did you grow? What challenges did you face?" 
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-[15px] text-gray-800 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 placeholder:text-gray-400 font-sans min-h-[160px] resize-y transition-colors"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-[15px] font-bold text-gray-600 mb-2 font-sans">
              Tags
            </label>
            <input 
              type="text" 
              placeholder="Add tags, comma separated" 
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-[15px] text-gray-800 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 placeholder:text-gray-400 font-sans transition-colors" 
            />
          </div>

        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-lg text-[14px] font-medium font-sans transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-[#333333] text-white hover:bg-[#222222] rounded-lg text-[14px] font-medium font-sans transition-colors"
          >
            Log Reflection
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}
