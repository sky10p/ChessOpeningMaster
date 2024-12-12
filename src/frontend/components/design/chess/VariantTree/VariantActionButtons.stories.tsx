import React from "react";
import { Story } from "@ladle/react";
import VariantActionButtons from "./VariantActionButtons";
import DownloadIcon from "@mui/icons-material/Download";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import { ContentPaste } from "@mui/icons-material";

const actionsExample = [
  {
    onClick: () => console.log("Download clicked"),
    icon: <DownloadIcon />,
    label: "Download",
  },
  {
    onClick: () => console.log("Copy clicked"),
    icon: <ContentCopyIcon />,
    label: "Copy",
  },
  {
    onClick: () => console.log("Extra Action 1 clicked"),
    icon: <DownloadIcon />,
    label: "Extra Action 1",
  },
  {
    onClick: () => console.log("Extra Action 2 clicked"),
    icon: <ContentCopyIcon />,
    label: "Extra Action 2",
  },
  {
    onClick: () => console.log("Extra Action 3 clicked"),
    icon: <FileCopyIcon />,
    label: "Extra Action 3",
  },
  {
    onClick: () => console.log("Extra Action 4 clicked"),
    icon: <ContentPaste />,
    label: "Extra Action 4",
  },
];

const Container: React.FC<{ width: string, children: React.ReactNode }> = ({ width, children }) => (
  <div style={{ width}}>
    {children}
  </div>
);

export const VariantActionButtonsStorySmall: Story = () => (
  <Container width="200px">
    <VariantActionButtons actions={actionsExample} />
  </Container>
);

export const VariantActionButtonsStoryLarge: Story = () => (
  <Container width="700px">
    <VariantActionButtons actions={actionsExample} />
  </Container>
);