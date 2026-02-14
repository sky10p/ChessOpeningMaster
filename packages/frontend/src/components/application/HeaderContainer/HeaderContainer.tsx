import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../design/Header/Header";
import { useHeaderState } from "../../../contexts/HeaderContext";
import { useNavbarDispatch } from "../../../contexts/NavbarContext";
import { clearAuthToken } from "../../../repository/apiClient";
import { logout } from "../../../repository/auth/auth";

interface HeaderContainerProps {
  authEnabled: boolean;
}

const HeaderContainer: React.FC<HeaderContainerProps> = ({ authEnabled }) => {
  const { setOpen } = useNavbarDispatch();
  const { icons, isSaving } = useHeaderState();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (authEnabled) {
      await logout().catch(() => undefined);
    }
    clearAuthToken();
    navigate("/login");
    window.location.reload();
  };

  return (
    <Header setOpenNavbar={setOpen} isSaving={isSaving} icons={icons} showLogout={authEnabled} onLogout={handleLogout} />
  );
};

export default HeaderContainer;
