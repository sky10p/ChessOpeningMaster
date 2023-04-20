import React from "react";
import { useNavbarContext } from "../contexts/NavbarContext";
import { useNavigate } from "react-router-dom";


const Home = () => {
  const {repertoires} = useNavbarContext();
  const navigate = useNavigate();

  if(repertoires.length === 0) {
    navigate("/create-repertoire");
    return <></>;
  }

  const firstRepertoire = repertoires[0];
  navigate(`/repertoire/${firstRepertoire._id}`);
  return <></>;
};

export default Home;
