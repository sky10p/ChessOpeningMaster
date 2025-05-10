import { Path } from "@chess-opening-master/common";
import { StudyPath, StudiedVariantPath, NewVariantPath, EmptyPath } from "@chess-opening-master/common/build/common/types/Path";

export const isStudyPath = (path: Path | null): path is StudyPath => 
  path !== null && 'type' in path && path.type === "study";

export const isStudiedVariantPath = (path: Path | null): path is StudiedVariantPath => 
  path !== null && 'type' in path && path.type === "variant";

export const isNewVariantPath = (path: Path | null): path is NewVariantPath => 
  path !== null && 'type' in path && path.type === "newVariant";

export const isEmptyPath = (path: Path | null): path is EmptyPath => 
  path !== null && 'message' in path;