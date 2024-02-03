export interface User {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    address?: string;
    image?: string;
    social_image?: string;
    blobImage?: Blob;
    about?: string;
    role?: string;
    status?: string;
    student_class?: string;
    email_verified?: boolean;
    framing?: string;
    phone?: string;
}

// id: string;
// firstName: string;
// LastName: string;
// email: string;
// phone: string;
// adress: string;
// role: string;
// createdAt: Date;
// updatedAt: Date;
// emailVerified: boolean;
// avatar?: string;
// status?: string;
