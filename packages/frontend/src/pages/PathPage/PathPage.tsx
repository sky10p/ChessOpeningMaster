import React, { useEffect } from "react";
import { usePaths } from "../../hooks/usePaths";
import { useDialogContext } from "../../contexts/DialogContext";
import { AcademicCapIcon, BookOpenIcon, ArrowPathIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Path, StudyPath, StudiedVariantPath, NewVariantPath, EmptyPath } from "../../models/Path";

// Type guards to help TypeScript understand the different path types
const isStudyPath = (path: Path | null): path is StudyPath => 
  path !== null && 'type' in path && path.type === "study";

const isStudiedVariantPath = (path: Path | null): path is StudiedVariantPath => 
  path !== null && 'type' in path && path.type === "variant";

const isNewVariantPath = (path: Path | null): path is NewVariantPath => 
  path !== null && 'type' in path && path.type === "newVariant";

const isEmptyPath = (path: Path | null): path is EmptyPath => 
  path !== null && 'message' in path;

const formatDate = (date: string | Date): string => {
  const newDate =  new Date(date);
  return newDate.toISOString();
}


const PathPage: React.FC = () => {
  const { path, loading, error, loadPath, removeVariantFromPath } = usePaths();
  const { showConfirmDialog } = useDialogContext();

  useEffect(() => {
    loadPath();
  }, [loadPath]);

  const goToStudy = () => {
    if (isStudyPath(path)) {
      window.location.href = `/studies?studyId=${path.studyId}`;
    }
  };

  const goToTrainVariant = () => {
    if (isStudiedVariantPath(path) || isNewVariantPath(path)) {
      window.location.href = `/repertoire/train/${path.repertoireId}?variantName=${path.name}`;
    }
  };

  const goToReviewVariant = () => {
    if (isStudiedVariantPath(path) || isNewVariantPath(path)) {
      window.location.href = `/repertoire/${path.repertoireId}?variantName=${path.name}`;
    }
  };

  const handleRemoveVariant = async () => {
    if (isStudiedVariantPath(path)) {
      showConfirmDialog({
        title: "Remove Variant from Path",
        contentText: `Are you sure you want to remove "${path.name}" from your learning path? This will reset all training progress for this variant and it will no longer appear in your spaced repetition schedule.`,
        onConfirm: async () => {
          await removeVariantFromPath(path.id);
        }
      });
    }
  };

  return (
    <div className="container p-0 sm:p-4 w-full h-full bg-gradient-to-b from-gray-900 via-primary to-gray-900 rounded-lg shadow-2xl flex flex-col">
      <div className="flex-1 flex flex-col relative p-2 sm:p-6">
        <div className="flex flex-col items-center w-full">
          <div className="w-full flex flex-col items-center max-w-2xl mt-4 sm:mt-10">
            <div className="flex justify-center items-center mb-4">
              <ArrowPathIcon className="h-8 w-8 sm:h-10 sm:w-10 text-blue-400" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-100 mb-2">Your Next Lesson</h1>
            <p className="text-sm sm:text-base text-gray-300 text-center px-2 mb-8">
              The system recommends your next step based on spaced repetition. Stay consistent to maximize your learning!
            </p>
            
            <div className="bg-gray-900 border border-gray-800 rounded-lg shadow p-4 sm:p-6 w-full max-w-lg flex flex-col items-center">
              {loading && <div className="text-blue-400 animate-pulse text-center">Loading your next lesson...</div>}
              {error && <div className="text-red-500 text-center">{error}</div>}
              {!loading && !error && path && (
                <>
                  {isStudiedVariantPath(path) && (
                    <>
                      <BookOpenIcon className="h-7 w-7 sm:h-8 sm:w-8 text-blue-400 mb-2" />
                      <div className="font-semibold text-base sm:text-lg text-blue-300 mb-1">Repertoire to review: {path.repertoireName}</div>
                      <div className="text-sm sm:text-base text-gray-100 mb-1"><span className="font-medium">Name:</span> {path.name}</div>
                      <div className="text-gray-300 mb-1"><span className="font-medium">Errors:</span> {path.errors}</div>
                      <div className="text-gray-300 mb-1"><span className="font-medium">Last Reviewed:</span> {formatDate(path.lastDate)}</div>
                      <div className="flex flex-col sm:flex-row gap-3 mt-4 w-full">
                        <button
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-semibold w-full"
                          onClick={goToReviewVariant}
                        >
                          Start Review
                        </button>
                        <button
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold w-full"
                          onClick={goToTrainVariant}
                        >
                          Start Training
                        </button>
                      </div>
                      <button
                        className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-semibold flex items-center justify-center gap-2 w-full"
                        onClick={handleRemoveVariant}
                      >
                        <XMarkIcon className="h-5 w-5" />
                        Remove this variant from path
                      </button>
                    </>
                  )}
                  {isNewVariantPath(path) && (
                    <>
                      <BookOpenIcon className="h-7 w-7 sm:h-8 sm:w-8 text-blue-400 mb-2" />
                      <div className="font-semibold text-base sm:text-lg text-blue-300 mb-1">New Repertoire to learn: {path.repertoireName}</div>
                      <div className="text-sm sm:text-base text-gray-100 mb-1"><span className="font-medium">Name:</span> {path.name}</div>
                      <div className="text-gray-300 mb-1"><span className="font-medium">Status:</span> Not yet started</div>
                      <div className="flex flex-col sm:flex-row gap-3 mt-4 w-full">
                        <button
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-semibold w-full"
                          onClick={goToReviewVariant}
                        >
                          Start Review
                        </button>
                        <button
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold w-full"
                          onClick={goToTrainVariant}
                        >
                          Start Training
                        </button>
                      </div>
                    </>
                  )}
                  {isStudyPath(path) && (
                    <>
                      <AcademicCapIcon className="h-7 w-7 sm:h-8 sm:w-8 text-emerald-400 mb-2" />
                      <div className="font-semibold text-base sm:text-lg text-emerald-300 mb-1">Study to Review</div>
                      <div className="text-sm sm:text-base text-gray-100 mb-1"><span className="font-medium">Name:</span> {path.name}</div>
                      <div className="text-gray-300 mb-1"><span className="font-medium">Last Session:</span> {path.lastSession}</div>
                      <button
                        className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-semibold w-full sm:w-auto"
                        onClick={goToStudy}
                      >
                        Go to Study
                      </button>
                    </>
                  )}
                  {isEmptyPath(path) && (
                    <>
                      <div className="font-semibold text-base sm:text-lg text-gray-200 mb-2">All Caught Up!</div>
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
    </div>
  );
};

export default PathPage;
