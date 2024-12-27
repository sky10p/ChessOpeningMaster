import React from "react";
import Header from "../../design/Header/Header";
import { useHeaderState } from "../../../contexts/HeaderContext";
import { useNavbarDispatch } from "../../../contexts/NavbarContext";

const HeaderContainer: React.FC = () => {
  const { setOpen } = useNavbarDispatch();
  const { icons, isSaving } = useHeaderState();

  return (
    <Header setOpenNavbar={setOpen} isSaving={isSaving} icons={icons} />
  );
};

export default HeaderContainer;
