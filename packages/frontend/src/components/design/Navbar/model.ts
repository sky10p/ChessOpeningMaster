export type NavbarLink = {
    id: string;
    name: string;
    url: string;
    onActionClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    icon?: React.ReactNode;
};