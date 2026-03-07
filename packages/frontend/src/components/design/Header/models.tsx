export interface HeaderIcon {
  key: string;
  icon: React.ReactNode;
  label?: string;
  onClick: (event: React.MouseEvent<HTMLElement>) => void;
}
