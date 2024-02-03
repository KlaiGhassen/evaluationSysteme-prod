export interface Classroom {
    id_class?: string;
    name_class?: string;
    university_year?: Date;
}

export interface Ue {
    id_Ue?: string;
    name_ue?: string;
    Description?: string;
    class?: Classroom;
    is_done?: boolean;
    module_duration?: number;
}
export interface Module {
    id_module?: string;
    name_module?: string;
    duration?: number;
    p1?: number;
    p2?: number;
    ETC?: number;
    semester?: number;
    UE?: Ue;
}
export interface CoursesUeClassroom extends Module, Ue, Classroom {
    module: Module[];
}
export interface UeModules extends Ue {
    modules?: Module[];
}
export interface ClassroomUes extends Classroom {
    uesModules?: UeModules[];
}
