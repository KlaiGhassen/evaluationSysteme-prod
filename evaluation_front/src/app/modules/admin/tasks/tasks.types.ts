import { User } from 'app/core/user/user.types';

export interface ClassRoom {
    classroom_id?: string;
    name_class?: string;
    id_teacher?: User;}
export interface Sections {
    section_id?: string ;
    title?: string;
    notes?: string;
    dueDate: string | null;
    classRooms: string[];
    questions?: Question[];
}
export interface Question {
id_question?: string;
question?: string;
questions_order?: number;
}



