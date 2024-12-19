import React from "react";
import { useNavbarContext } from "../../../contexts/NavbarContext";
import { useHeaderContext } from "../../../contexts/HeaderContext";
import Header from "../../design/Header/Header";

const HeaderContainer: React.FC = () => {
  const { setOpen } = useNavbarContext();
  const { icons, isSaving } = useHeaderContext();

  return (
    <Header setOpenNavbar={setOpen} isSaving={isSaving} icons={icons} />
  );
};

export default HeaderContainer;
