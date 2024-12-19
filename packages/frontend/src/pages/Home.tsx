import React, { useEffect } from "react";
import { useNavbarContext } from "../contexts/NavbarContext";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { repertoires, updatedRepertoires } = useNavbarContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (updatedRepertoires && repertoires && repertoires.length === 0) {
      navigate("/create-repertoire");
    } else if (updatedRepertoires && repertoires && repertoires.length > 0) {
      const firstRepertoire = repertoires[0];
      navigate(`/repertoire/${firstRepertoire._id}`);
    }
  }, [updatedRepertoires]);

  return <>Loading...</>;
};

export default Home;
