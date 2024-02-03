export interface Task
{
    id?: string;
    content?: string;
    completed?: string;
}

export interface Label
{
    up_id?: string;
    name_up?: string;
}

export interface Note
{
    id?: string;
    title?: string;
    content?: string;
    tasks?: Task[];
    image?: string | null;
    labels?: Label[];
    archived?: boolean;
    createdAt?: string;
    updatedAt?: string | null;
}
