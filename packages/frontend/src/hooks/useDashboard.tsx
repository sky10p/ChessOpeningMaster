import { useEffect, useState } from "react";
import { getFullInfoRepertoires } from "../repository/repertoires/repertoires";
import { IRepertoireDashboard } from "@chess-opening-master/common/src/types/Repertoire";

export const useDashboard = () => {
    const [dashbardoRepertoires, setDashboardRepertoires] = useState<IRepertoireDashboard[]>([]);
     
    useEffect(() => {
        getFullInfoRepertoires().then((data) => {
            setDashboardRepertoires(data);
        });

    }, []);


    return {
        repertoires: dashbardoRepertoires,
        setRepertoires: setDashboardRepertoires
    };
}