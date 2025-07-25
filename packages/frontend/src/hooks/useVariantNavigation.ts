import { useNavigate, useLocation } from "react-router-dom";
import { useRepertoireContext } from "../contexts/RepertoireContext";
import { Variant } from "../models/chess.models";

export const useVariantNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setSelectedVariant, initBoard } = useRepertoireContext();

  const handleVariantChange = (variant: Variant | null) => {
    setSelectedVariant(variant);
    initBoard();
    
    const currentParams = new URLSearchParams(location.search);
    if (variant?.fullName) {
      currentParams.set("variantName", variant.fullName);
    } else {
      currentParams.delete("variantName");
    }
    
    const newUrl = `${location.pathname}?${currentParams.toString()}`;
    navigate(newUrl, { replace: true });
  };

  return { handleVariantChange };
};
