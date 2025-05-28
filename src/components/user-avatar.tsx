"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserAvatarProps {
    src?: string | null;
    name: string;
    className?: string;
    fallbackClassName?: string;
}

export function UserAvatar({ src, name, className, fallbackClassName }: UserAvatarProps) {
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <Avatar className={className}>
            <AvatarImage src={src || ""} alt={name} />
            <AvatarFallback className={fallbackClassName}>
                {getInitials(name)}
            </AvatarFallback>
        </Avatar>
    );
}
