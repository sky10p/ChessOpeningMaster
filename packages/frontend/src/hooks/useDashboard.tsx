import { useEffect, useState, useCallback } from "react";
import { getFullInfoRepertoires } from "../repository/repertoires/repertoires";
import { IRepertoireDashboard } from "@chess-opening-master/common";

export const useDashboard = () => {
    const [dashbardoRepertoires, setDashboardRepertoires] = useState<IRepertoireDashboard[]>([]);
     
    useEffect(() => {
        getFullInfoRepertoires().then((data) => {
            setDashboardRepertoires(data);
        });
    }, []);

    const updateRepertoires = useCallback(async () => {
        try {
            const updatedRepertoires = await getFullInfoRepertoires();
            setDashboardRepertoires(updatedRepertoires);
        } catch (error) {
            console.error("Failed to update repertoires:", error);
        }
    }, []);

    return {
        repertoires: dashbardoRepertoires,
        setRepertoires: setDashboardRepertoires,
        updateRepertoires
    };
}