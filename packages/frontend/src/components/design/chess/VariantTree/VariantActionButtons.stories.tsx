import React from "react";
import { Story } from "@ladle/react";
import VariantActionButtons from "./VariantActionButtons";
import { PlusIcon, ArrowDownTrayIcon, AcademicCapIcon,AdjustmentsHorizontalIcon,AdjustmentsVerticalIcon,ArchiveBoxArrowDownIcon } from "@heroicons/react/24/outline";

const actionsExample = [
  {
    onClick: () => console.log("Download clicked"),
    icon: <ArrowDownTrayIcon className="h-5 w-5 text-accent" />,
    label: "Download",
  },
  {
    onClick: () => console.log("Copy clicked"),
    icon: <AcademicCapIcon className="h-5 w-5 text-accent" />,
    label: "Copy",
  },
  {
    onClick: () => console.log("Extra Action 1 clicked"),
    icon: <AdjustmentsHorizontalIcon className="h-5 w-5 text-accent" />,
    label: "Extra Action 1",
  },
  {
    onClick: () => console.log("Extra Action 2 clicked"),
    icon: <AdjustmentsVerticalIcon className="h-5 w-5 text-accent" />,
    label: "Extra Action 2",
  },
  {
    onClick: () => console.log("Extra Action 3 clicked"),
    icon: <ArchiveBoxArrowDownIcon className="h-5 w-5 text-accent" />,
    label: "Extra Action 3",
  },
  {
    onClick: () => console.log("Extra Action 4 clicked"),
    icon: <PlusIcon className="h-5 w-5 text-accent" />,
    label: "Extra Action 4",
  },
];


export const VariantActionButtonsStorySmall: Story = () => (

    <div className="w-1/4 bg-gray-800 text-white">
      <VariantActionButtons actions={actionsExample} />
    </div>

);

export const VariantActionButtonsStoryLarge: Story = () => (
 
    <div className="w-1/2 bg-gray-800 text-white">
      <VariantActionButtons actions={actionsExample} />
    </div>
  
);