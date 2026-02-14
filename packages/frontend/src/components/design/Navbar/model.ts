export type NavbarLink = {
    id: string;
    name: string;
    url: string;
    onClick?: () => void;
    onActionClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    icon?: React.ReactNode;
};
