import React, { useEffect } from "react";
import { useNavbarContext } from "../contexts/NavbarContext";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { repertoires } = useNavbarContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (repertoires.length === 0) {
      navigate("/create-repertoire");
    } else {
      const firstRepertoire = repertoires[0];
      navigate(`/repertoire/${firstRepertoire._id}`);
    }
  }, [repertoires, navigate]);

  return <></>;
};

export default Home;
