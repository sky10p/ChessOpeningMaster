import React, { useEffect, useState, useCallback } from "react";
import { IRepertoire } from "../../../../common/types/Repertoire";
import { getRepertoires } from "../../../repository/repertoires/repertoires";
import { useNavbarContext } from "../../../contexts/NavbarContext";
import { Grid, Typography, useMediaQuery, useTheme, Paper } from "@mui/material";
import RepertoireSelector from "./RepertoireSelector";

const ManageRepertoirePage = () => {
  const [repertoires, setRepertoires] = useState<IRepertoire[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchRepertoires = useCallback(async () => {
    try {
      const repertoires = await getRepertoires();
      setRepertoires(repertoires);
    } catch (err) {
      setError("Failed to fetch repertoires");
    }
  }, []);

  useEffect(() => {
    fetchRepertoires();
  }, [fetchRepertoires]);

  const { setOpen } = useNavbarContext();
  useEffect(() => {
    setOpen(false);
  }, [setOpen]);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <Grid container spacing={2} style={{ height: '100%' }}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom style={{ marginBottom: '8px' }}>
          Manage Repertoires
        </Typography>
      </Grid>
      {isMobile ? (
        <>
          <Grid item xs={12} style={{ flexGrow: 1, alignSelf: 'flex-start' }}>
            <Paper style={{ height: 'calc(50vh - 36px)', overflow: 'auto' }}>
              <RepertoireSelector repertoires={repertoires} />
            </Paper>
          </Grid>
          <Grid item xs={12} style={{ flexGrow: 1, alignSelf: 'flex-start' }}>
            <Paper style={{ height: 'calc(50vh - 36px)', overflow: 'auto' }}>
              <RepertoireSelector repertoires={repertoires} />
            </Paper>
          </Grid>
        </>
      ) : (
        <>
          <Grid item xs={6} style={{ flexGrow: 1, alignSelf: 'flex-start' }}>
            <Paper style={{ maxHeight: '100%', overflow: 'auto' }}>
              <RepertoireSelector repertoires={repertoires} />
            </Paper>
          </Grid>
          <Grid item xs={6} style={{ flexGrow: 1, alignSelf: 'flex-start' }}>
            <Paper style={{ maxHeight: '100%', overflow: 'auto' }}>
              <RepertoireSelector repertoires={repertoires} />
            </Paper>
          </Grid>
        </>
      )}
    </Grid>
  );
};

export default ManageRepertoirePage;
