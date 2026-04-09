import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Bookmark,
  GraduationCap,
  Book,
  FileText
} from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { contentModules } from '../data/contentData';

const Modules = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Age-based modules
  const ageGroup = user.ageGroup || 'teen';
  const modules =
    contentModules[ageGroup]?.modules || contentModules.teen.modules;

  const displayCount = Math.min(3, modules.length);

  const nextSlide = () => {
    setCurrentIndex((prev) =>
      prev + 1 >= modules.length ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prev) =>
      prev - 1 < 0 ? modules.length - 1 : prev - 1
    );
  };

  const getVisibleModules = () => {
    const result = [];
    for (let i = 0; i < displayCount; i++) {
      const index = (currentIndex + i) % modules.length;
      result.push(modules[index]);
    }
    return result;
  };

  // Icons
  const moduleIcons = {
    constitution: BookOpen,
    rights: GraduationCap,
    cases: FileText,
    legal: Book,
    default: Bookmark
  };

  const getModuleIcon = (moduleId) => {
    for (const [key, icon] of Object.entries(moduleIcons)) {
      if (moduleId.includes(key)) return icon;
    }
    return moduleIcons.default;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-stone-100 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-4xl font-bold text-amber-800 mb-4">
            Learning Modules
          </h1>
          <p className="text-lg text-stone-700 max-w-2xl mx-auto">
            Explore educational modules about the Constitution, legal rights,
            and important legal concepts.
          </p>
        </motion.div>

        {/* Carousel */}
        <div className="relative px-12 mb-16">

          {modules.length > displayCount && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 bg-amber-600 hover:bg-amber-700 text-white p-2 rounded-full z-10"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 bg-amber-600 hover:bg-amber-700 text-white p-2 rounded-full z-10"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Module Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {getVisibleModules().map((module, index) => {
              const ModuleIcon = getModuleIcon(module.id);

              return (
                <motion.div
                  key={`${module.id}-${index}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg border border-stone-200 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-[1.02]"
                  onClick={() => navigate(`/modules/${module.id}`)}
                >
                  {/* Top Icon */}
                  <div className="h-32 bg-gradient-to-r from-amber-500 to-amber-700 flex items-center justify-center">
                    <ModuleIcon className="w-16 h-16 text-white" />
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-stone-800 mb-2">
                      {module.title}
                    </h3>

                    <p className="text-stone-600 mb-4">
                      {module.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modules;
