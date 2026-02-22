import { useEffect, useState, useCallback } from "react";
import { getFullInfoRepertoires } from "../repository/repertoires/repertoires";
import { IRepertoireDashboard } from "@chess-opening-master/common";

export const useDashboard = () => {
    const [dashbardRepertoires, setDashboardRepertoires] = useState<IRepertoireDashboard[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        getFullInfoRepertoires()
            .then((data) => {
                setDashboardRepertoires(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Failed to load dashboard repertoires:", error);
                setLoading(false);
            });
    }, []);

    const updateRepertoires = useCallback(async () => {
        setLoading(true);
        try {
            const updatedRepertoires = await getFullInfoRepertoires();
            setDashboardRepertoires(updatedRepertoires);
        } catch (error) {
            console.error("Failed to update repertoires:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        repertoires: dashbardRepertoires,
        loading,
        setRepertoires: setDashboardRepertoires,
        updateRepertoires
    };
}