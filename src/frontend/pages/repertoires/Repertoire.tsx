import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import BoardContainer from '../../components/chess/BoardContainer';
import { IRepertoire } from '../../../common/types/Repertoire';
import { getRepertoire } from '../../repository/repertoires/repertoires';
import { useNavbarContext } from '../../contexts/NavbarContext';

const Repertoire = () => {
  const { id } = useParams();
  const [repertoire, setRepertoire] = React.useState<IRepertoire | undefined>(undefined);

  useEffect(() => {
    if(id){
      getRepertoire(id).then((repertoire) => setRepertoire(repertoire));
    }
    
  }, [id]);

  const { setOpen } = useNavbarContext();
  useEffect(() => {
    setOpen(false);
  }, []);

  return (repertoire?._id ? <div>
      <h2>{repertoire?.name}</h2>
      <BoardContainer repertoireId={repertoire?._id} repertoireName={repertoire.name} initialMoves={repertoire?.moveNodes} />
    </div> : <div>Repertoire not found</div>)
};

export default Repertoire;
