import React, { useEffect } from "react";
import { usePaths } from "../../hooks/usePaths";
import { AcademicCapIcon, BookOpenIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

const PathPage: React.FC = () => {
  const { path, loading, error, loadPath } = usePaths();

  useEffect(() => {
    loadPath();
  }, [loadPath]);

  const goToStudy = () => {
    if (path?.type === "study" && path.id) {
      window.location.href = `/studies?studyId=${path.id}`;
    }
  };

  const goToVariant = () => {
    if (path?.type === "variant" && path.repertoireId) {
      window.location.href = `/repertoire/train/${path.repertoireId}`;
    }
  };

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-gradient-to-b from-gray-900 via-primary to-gray-900 p-4">
      <div className="w-full max-w-2xl mt-10">
        <div className="mb-8 flex flex-col items-center">
          <ArrowPathIcon className="h-10 w-10 text-blue-400 mb-2" />
          <h1 className="text-lg sm:text-2xl font-bold text-gray-100 mb-2">Your Next Lesson</h1>
          <p className="text-base text-gray-300 text-center">
            The system recommends your next step based on spaced repetition. Stay consistent to maximize your learning!
          </p>
        </div>
        <div className="w-full flex justify-center">
          <div className="bg-gray-900 border border-gray-800 rounded-lg shadow p-6 w-full max-w-lg flex flex-col items-center">
            {loading && <div className="text-blue-400 animate-pulse text-center">Loading your next lesson...</div>}
            {error && <div className="text-red-500 text-center">{error}</div>}
            {!loading && !error && path && (
              <>
                {path.type === "variant" && (
                  <>
                    <BookOpenIcon className="h-8 w-8 text-blue-400 mb-2" />
                    <div className="font-semibold text-lg text-blue-300 mb-1">Repertoire Variant to Review</div>
                    <div className="text-base text-gray-100 mb-1"><span className="font-medium">Name:</span> {path.name}</div>
                    <div className="text-gray-300 mb-1"><span className="font-medium">Errors:</span> {path.errors}</div>
                    <div className="text-gray-300 mb-1"><span className="font-medium">Last Reviewed:</span> {path.lastDate?.$date ? new Date(path.lastDate.$date).toLocaleString() : "Never"}</div>
                    <button
                      className="mt-4 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold"
                      onClick={goToVariant}
                    >
                      Start Training
                    </button>
                  </>
                )}
                {path.type === "study" && path.id && (
                  <>
                    <AcademicCapIcon className="h-8 w-8 text-emerald-400 mb-2" />
                    <div className="font-semibold text-lg text-emerald-300 mb-1">Study to Review</div>
                    <div className="text-base text-gray-100 mb-1"><span className="font-medium">Name:</span> {path.name}</div>
                    <div className="text-gray-300 mb-1"><span className="font-medium">Last Session:</span> {path.lastSession ? new Date(path.lastSession).toLocaleString() : "Never"}</div>
                    <button
                      className="mt-4 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-semibold"
                      onClick={goToStudy}
                    >
                      Go to Study
                    </button>
                  </>
                )}
                {path.type === "study" && !path.id && (
                  <>
                    <div className="font-semibold text-lg text-gray-200 mb-2">All Caught Up!</div>
                    <div className="text-gray-300 mb-2">You have no variants or studies to review right now. Great job! 🎉</div>
                    <div className="text-gray-400">Come back tomorrow for new lessons, or explore your studies and repertoires for more practice.</div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PathPage;
