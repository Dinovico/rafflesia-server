export enum Certainty {
    Certain = 1,
    AlmostCertain = 0.9,
    VeryHigh = 0.8,
    High = 0.7,
    Mid = 0.5,
    Low = 0.3,
    VeryLow = 0.2,
};

export type RelationshipEquivalence = { 
    eq?: string; 
    c: Certainty; 
    name?: string 
};

type RelationshipEquivalenceTable = {
    [key: string]: RelationshipEquivalence | RelationshipEquivalence[];
};




//// HANDLED RELATIONSHIPS IN CURRENT VERSION + CORRESPONDING REDUCED CODE
//
//  - parent                        = Ua
//  - child                         = Da
//  - grandparent                   = UaUa
//  - grandchild                    = DaDa
//  - brother/sister                = UoDo
//  - brother/sister in law (1)     = UoDoDoUo
//  - (ex)-partner                  = DoUo
//  - brother/sister in law (2)     = DoUoUoDo
//  - great-grandparent             = UaUaUa
//  - great-grandchild              = DaDaDa
//  - stepparent                    = UoDoUo
//  - stepchild                     = DoUoDo
//  - uncle/aunt                    = UoUoDo
//  - nephew/niece                  = DoDoUo
//  - cousin                        = UaUoDoDa
//  - grandparent in law            = DoUoUaUa
//  - grandchild in law             = DaDaDoUo
//  - parent in law                 = DaUoUa
//  - child in law                  = DaDoUa
//  - great-great-grandparent       = UaUaUaUa
//  - great-great-grandchild        = DaDaDaDa
//  - granduncle/grandaunt          = UaUaUoDo
//  - great-nephew/great-niece      = UoDoDaDa


export const RELATIONSHIP_EQUIVALENCE_TABLE: RelationshipEquivalenceTable = {
    S: { c: Certainty.Certain, name: "soi" },
    X: { c: Certainty.Mid, name: "autre/non précisé" },

    Ua: { c: Certainty.Certain, name: "parent" },
    Uo: { eq: "Ua", c: Certainty.Certain },
    Us: { eq: "Ua", c: Certainty.Certain },

    Da: { c: Certainty.Certain, name: "enfant" },
    Do: { eq: "Da", c: Certainty.Certain },
    Ds: { eq: "Da", c: Certainty.Certain },

    UaUa: { c: Certainty.Certain, name: "grand-parent" },

    UaDa: [{ eq: "UaDo", c: Certainty.AlmostCertain }, { eq: "UaDs", c: Certainty.VeryLow }],
    UaDo: { eq: "UoDo", c: Certainty.Certain },
    UaDs: { eq: "S", c: Certainty.AlmostCertain },
    UoDa: [{ eq: "UoDo", c: Certainty.AlmostCertain }, { eq: "UoDs", c: Certainty.VeryLow }],
    UoDo: { c: Certainty.Certain, name: "frère/soeur" },
    UoDs: { eq: "S", c: Certainty.AlmostCertain },
    UsDa: [{ eq: "UsDo", c: Certainty.AlmostCertain }, { eq: "UsDs", c: Certainty.VeryLow }],
    UsDo: { eq: "UaDo", c: Certainty.Certain },
    UsDs: { eq: "S", c: Certainty.AlmostCertain },

    DaUa: [{ eq: "DaUo", c: Certainty.AlmostCertain }, { eq: "DaUs", c: Certainty.VeryLow }],
    DaUo: { eq: "DoUo", c: Certainty.Certain },
    DaUs: { eq: "S", c: Certainty.AlmostCertain },
    DoUa: [{ eq: "DoUo", c: Certainty.AlmostCertain }, { eq: "DoUs", c: Certainty.VeryLow }],
    DoUo: { c: Certainty.Certain, name: "(ex?)-conjoint(e)" },
    DoUs: { eq: "S", c: Certainty.AlmostCertain },
    DsUa: [{ eq: "DsUo", c: Certainty.AlmostCertain }, { eq: "DsUs", c: Certainty.VeryLow }],
    DsUo: { eq: "DaUo", c: Certainty.Certain },
    DsUs: { eq: "S", c: Certainty.AlmostCertain },
    
    DaDa: { c: Certainty.Certain, name: "petit-enfant" },

    UaUaUa: { c: Certainty.Certain, name: "arrière-grand-parent" },

    UaDaUa: [{ eq: "UaDaUo", c: Certainty.High }, { eq: "UaDaUs", c: Certainty.Low }],
    UaDaUo: [{ eq: "UaDoUo", c: Certainty.VeryHigh }, { eq: "UaDsUo", c: Certainty.Low }],
    UaDaUs: { eq: "Ua", c: Certainty.Certain }, // parent
    UaDoUa: [{ eq: "UaDoUo", c: Certainty.VeryHigh }, { eq: "UaDoUs", c: Certainty.Low }],
    UaDoUo: [{ eq: "UoDoUo", c: Certainty.High }, { eq: "Ua", c: Certainty.Low }],
    UaDoUs: { eq: "Ua", c: Certainty.Certain }, // parent
    UaDsUa: { eq: "Ua", c: Certainty.Certain }, // parent
    UaDsUo: { eq: "Ua", c: Certainty.Certain }, // parent
    UaDsUs: { eq: "Ua", c: Certainty.Certain }, // parent
    UoDaUa: [{ eq: "UoDoUa", c: Certainty.VeryHigh }, { eq: "UoDsUa", c: Certainty.Low }],
    UoDaUo: [{ eq: "UoDoUo", c: Certainty.High}, { eq: "UoDsUo", c: Certainty.Low}],
    UoDaUs: { eq: "Ua", c: Certainty.Certain }, // parent
    UoDoUa: [{ eq: "UoDoUo", c: Certainty.High }, { eq: "UoDoUs", c: Certainty.Low }],
    UoDoUo: { c: Certainty.Certain, name: "beau-parent (conjoint(e) de parent)" },
    UoDoUs: { eq: "Ua", c: Certainty.Certain }, // parent
    UoDsUa: { eq: "Ua", c: Certainty.Certain }, // parent
    UoDsUo: { eq: "Ua", c: Certainty.Certain }, // parent
    UoDsUs: { eq: "Ua", c: Certainty.Certain }, // parent
    UsDaUa: [{eq: "UsDoUa", c: Certainty.High }, { eq: "UsDsUa", c: Certainty.Mid }],
    UsDaUo: [{eq: "UsDoUo", c: Certainty.VeryHigh }, { eq: "UsDsUa", c: Certainty.Mid }],
    UsDaUs: { eq: "Ua", c: Certainty.Certain }, // parent
    UsDoUa: [{eq: "UsDoUo", c: Certainty.High }, { eq: "UsDoUs", c: Certainty.Mid }],
    UsDoUo: [{eq: "UoDoUo", c: Certainty.VeryHigh }, { eq: "Ua", c: Certainty.Mid }],
    UsDoUs: { eq: "Ua", c: Certainty.Certain }, // parent
    UsDsUa: { eq: "Ua", c: Certainty.Certain }, // parent
    UsDsUo: { eq: "Ua", c: Certainty.Certain }, // parent
    UsDsUs: { eq: "Ua", c: Certainty.Certain }, // parent

    DaUaDa: [{ eq: "DaUaDo", c: Certainty.High }, { eq: "DaUaDs", c: Certainty.Low }],
    DaUaDo: [{ eq: "DaUoDo", c: Certainty.VeryHigh }, { eq: "DaUsDo", c: Certainty.Low }],
    DaUaDs: { eq: "Da", c: Certainty.Certain }, // enfant
    DaUoDa: [{ eq: "DaUoDo", c: Certainty.VeryHigh }, { eq: "DaUoDs", c: Certainty.Low }],
    DaUoDo: [{eq: "DoUoDo", c: Certainty.VeryHigh }, { eq: "Da", c: Certainty.Mid }],
    DaUoDs: { eq: "Da", c: Certainty.Certain }, // enfant
    DaUsDa: { eq: "Da", c: Certainty.Certain }, // enfant
    DaUsDo: { eq: "Da", c: Certainty.Certain }, // enfant
    DaUsDs: { eq: "Da", c: Certainty.Certain }, // enfant
    DoUaDa: [{ eq: "DoUoDa", c: Certainty.High }, { eq: "DoUsDa", c: Certainty.Mid }],
    DoUaDo: [{ eq: "DoUoDo", c: Certainty.High}, { eq: "DoUsDo", c: Certainty.Low}],
    DoUaDs: { eq: "Da", c: Certainty.Certain }, // enfant
    DoUoDa: [{ eq: "DoUoDo", c: Certainty.High }, { eq: "DoUoDs", c: Certainty.Low }],
    DoUoDo: { c: Certainty.Certain, name: "beau-fils/belle-fille (enfant de conjoint(e))" },
    DoUoDs: { eq: "Da", c: Certainty.Certain }, // enfant
    DoUsDa: { eq: "Da", c: Certainty.Certain }, // enfant
    DoUsDo: { eq: "Da", c: Certainty.Certain }, // enfant
    DoUsDs: { eq: "Da", c: Certainty.Certain }, // enfant
    DsUaDa: [{eq: "DsUoDa", c: Certainty.High }, { eq: "DsUsDa", c: Certainty.Mid }],
    DsUaDo: [{eq: "DsUoDo", c: Certainty.VeryHigh }, { eq: "DsUsDa", c: Certainty.Mid }],
    DsUaDs: { eq: "Da", c: Certainty.Certain }, // enfant
    DsUoDa: [{eq: "DsUoDo", c: Certainty.High }, { eq: "DsUoDs", c: Certainty.Mid }],
    DsUoDo: [{eq: "DoUoDo", c: Certainty.VeryHigh }, { eq: "Da", c: Certainty.Mid }],
    DsUoDs: { eq: "Da", c: Certainty.Certain }, // enfant
    DsUsDa: { eq: "Da", c: Certainty.Certain }, // enfant
    DsUsDo: { eq: "Da", c: Certainty.Certain }, // enfant
    DsUsDs: { eq: "Da", c: Certainty.Certain }, // enfant

    UaUaDa: [{ eq: "UaUaDo", c: Certainty.High }, { eq: "UaUaDs", c: Certainty.High }],
    UaUaDo: { eq: "UoUoDo", c: Certainty.Certain },
    UaUaDs: { eq: "Ua", c: Certainty.Certain}, // parent
    UaUoDa: [{ eq: "UaUoDo", c: Certainty.High }, { eq: "UaUoDs", c: Certainty.High }],
    UaUoDo: { eq: "UaUaDo", c: Certainty.Certain }, // oncle/tante
    UaUoDs: { eq: "Ua", c: Certainty.Certain}, // parent
    UaUsDa: [{ eq: "UaUsDo", c: Certainty.High }, { eq: "UaUsDs", c: Certainty.High }],
    UaUsDo: { eq: "UaUaDo", c: Certainty.Certain }, // oncle/tante
    UaUsDs: { eq: "Ua", c: Certainty.Certain}, // parent
    UoUoDo: { c: Certainty.Certain, name: "oncle/tante" },


    UaDaDa: [{ eq: "UaDoDa", c: Certainty.Mid }, { eq: "UaDsDa", c: Certainty.Mid }],
    UaDaDo: { eq: "UaDaDa", c: Certainty.Certain },
    UaDaDs: { eq: "UaDaDa", c: Certainty.Certain },
    UaDoDa: { eq: "UoDoDo", c: Certainty.Certain },
    UaDoDo: { eq: "UaDoDa", c: Certainty.Certain },
    UaDoDs: { eq: "UaDoDa", c: Certainty.Certain },
    UaDsDa: { eq: "Da", c: Certainty.Certain}, // enfant
    UaDsDo: { eq: "Da", c: Certainty.Certain}, // enfant
    UaDsDs: { eq: "Da", c: Certainty.Certain}, // enfant
    UoDoDo: { c: Certainty.Certain, name: "neveu/nièce" },

    DaUaUa: [{ eq: "DaUoUa", c: Certainty.Mid }, { eq: "DaUsUa", c: Certainty.Mid }],
    DaUaUo: { eq: "DaUaUa", c: Certainty.Certain },
    DaUaUs: { eq: "DaUaUa", c: Certainty.Certain },
    DaUoUa: { name: "beau-parent (parent de conjoint)", c: Certainty.AlmostCertain },
    DaUoUo: { eq: "DaUoUa", c: Certainty.Certain },
    DaUoUs: { eq: "DaUoUa", c: Certainty.Certain },
    DaUsUa: { eq: "Ua", c: Certainty.AlmostCertain }, // parent
    DaUsUo: { eq: "DaUsUa", c: Certainty.Certain },
    DaUsUs: { eq: "DaUsUa", c: Certainty.Certain },

    DaDaUa: [{ eq: "DaDaUa", c: Certainty.Mid }, { eq: "DaDaUo", c: Certainty.Mid }],
    DaDaUo: { eq: "DaDoUa", c: Certainty.Certain },
    DaDaUs: { eq: "Da", c: Certainty.Certain }, // enfant
    DaDoUa: { c: Certainty.Certain, name: "gendre/bru" },

    DaDaDa: { c: Certainty.Certain, name: "arrière-petit-enfant" },

    UaUaUaUa: { c: Certainty.Certain, name: "arrière-arrière-grand-parent" },

    UaUaUaDa: [{ eq: "UaUaUaDo", c: Certainty.High }, { eq: "UaUaUaDs", c: Certainty.High }],
    UaUaUaDo: { eq: "UaUaUoDo", c: Certainty.Certain },
    UaUaUaDs: { eq: "UaUa", c: Certainty.Certain }, // grand-parent
    UaUaUoDo: { c: Certainty.Certain, name: "grand-oncle/grand-tante" },

    UaUaDaUa: [{ eq: "UaUaDoUa", c: Certainty.VeryHigh }, { eq: "UaUaDsUa", c: Certainty.VeryHigh }],
    UaUaDoUa: [{ eq: "UaUaDoUo", c: Certainty.VeryHigh }, { eq: "UaUaDoUs", c: Certainty.VeryHigh }], 
    UaUaDoUo: [{ eq: "UaUa", c: Certainty.Mid }, { eq: "X", c: Certainty.Mid }],
    UaUaDoUs: { eq: "UaUa", c: Certainty.Certain }, // grand-parent
    UaUaDsUa: { eq: "UaUa", c: Certainty.Certain }, // grand-parent
    UaUaDsUo: { eq: "UaUa", c: Certainty.Certain }, // grand-parent
    UaUaDsUs: { eq: "UaUa", c: Certainty.Certain }, // grand-parent

    UaUaDaDa: [{ eq: "UaUaDoDa", c: Certainty.High }, { eq: "UaUaDsDa", c: Certainty.High }],
    UaUaDaDo: [{ eq: "UaUaDoDo", c: Certainty.High }, { eq: "UaUaDsDo", c: Certainty.High }],
    UaUaDaDs: [{ eq: "UaUaDoDs", c: Certainty.High }, { eq: "UaUaDsDs", c: Certainty.Low }],
    UaUaDoDa: { eq: "UaUoDoDa", c: Certainty.Certain },
    UaUaDoDo: { eq: "UaUaDoDa", c: Certainty.Certain },
    UaUaDoDs: { eq: "UaUaDoDa", c: Certainty.Certain },
    UaUaDsDa: [{ eq: "UaUaDsDo", c: Certainty.VeryHigh }, { eq: "UaUaDsDs", c: Certainty.Low }],
    UaUaDsDo: { eq: "UoDo", c: Certainty.AlmostCertain },
    UaUaDsDs: { eq: "S", c: Certainty.Certain },
    UaUoDoDa: { c: Certainty.Certain, name: "cousin/cousine" },

    DaDaUaUa: [{ eq: "DaDaUoUa", c: Certainty.High }, { eq: "DaDaUsUa", c: Certainty.High }],
    DaDaUaUo: [{ eq: "DaDaUoUo", c: Certainty.High }, { eq: "DaDaUsUo", c: Certainty.High }],
    DaDaUaUs: [{ eq: "DaDaUoUs", c: Certainty.High }, { eq: "DaDaUsUs", c: Certainty.High }],
    DaDaUoUa: { eq: "X", c: Certainty.High },
    DaDaUoUo: { eq: "X", c: Certainty.High },
    DaDaUoUs: { eq: "X", c: Certainty.High },
    DaDaUsUa: { eq: "DoUo", c: Certainty.AlmostCertain },
    DaDaUsUo: { eq: "DoUo", c: Certainty.AlmostCertain },
    DaDaUsUs: { eq: "DoUo", c: Certainty.AlmostCertain },

    UaDaUaUa: [{ eq: "UaDoUaUa", c: Certainty.VeryHigh }, { eq: "UaDsUaUa", c: Certainty.VeryHigh }],
    UaDaUaUo: { eq: "UaDaUaUa", c: Certainty.Certain },
    UaDaUaUs: { eq: "UaDaUaUa", c: Certainty.Certain },
    UaDaUoUa: [{ eq: "UaDoUoUo", c: Certainty.VeryHigh }, { eq: "UaDsUoUa", c: Certainty.VeryHigh }],
    UaDaUoUo: { eq: "UaDaUoUa", c: Certainty.Certain },
    UaDaUoUs: { eq: "UaDaUoUa", c: Certainty.Certain },
    UaDaUsUa: { eq: "UaUa", c: Certainty.AlmostCertain }, // grand-parent
    UaDaUsUo: { eq: "UaUa", c: Certainty.AlmostCertain }, // grand-parent
    UaDaUsUs: { eq: "UaUa", c: Certainty.AlmostCertain }, // grand-parent
    UaDoUaUa: [{ eq: "UaDoUoUa", c: Certainty.VeryHigh }, { eq: "UaDoUsUa", c: Certainty.High }],
    UaDoUaUo: { eq: "UaDoUaUa", c: Certainty.Certain },
    UaDoUaUs: { eq: "UaDoUaUa", c: Certainty.Certain },
    UaDoUoUa: [{ eq: "UaUa", c: Certainty.Mid }, { eq: "X", c: Certainty.High }],
    UaDoUoUo: { eq: "UaDoUoUo", c: Certainty.Certain },
    UaDoUoUs: { eq: "UaDoUoUo", c: Certainty.Certain },
    UaDoUsUa: { eq: "UaUa", c: Certainty.AlmostCertain }, // grand-parent
    UaDoUsUo: { eq: "UaUa", c: Certainty.AlmostCertain }, // grand-parent
    UaDoUsUs: { eq: "UaUa", c: Certainty.AlmostCertain }, // grand-parent
    UaDsUaUa: { eq: "UaUa", c: Certainty.AlmostCertain }, // grand-parent
    UaDsUaUo: { eq: "UaUa", c: Certainty.AlmostCertain }, // grand-parent
    UaDsUaUs: { eq: "UaUa", c: Certainty.AlmostCertain }, // grand-parent
    UaDsUoUa: { eq: "UaUa", c: Certainty.AlmostCertain }, // grand-parent
    UaDsUoUo: { eq: "UaUa", c: Certainty.AlmostCertain }, // grand-parent
    UaDsUoUs: { eq: "UaUa", c: Certainty.AlmostCertain }, // grand-parent
    UaDsUsUa: { eq: "UaUa", c: Certainty.AlmostCertain }, // grand-parent
    UaDsUsUo: { eq: "UaUa", c: Certainty.AlmostCertain }, // grand-parent
    UaDsUsUs: { eq: "UaUa", c: Certainty.AlmostCertain }, // grand-parent

    DaUaDaDa: [{ eq: "DaUoDaDa", c: Certainty.VeryHigh }, { eq: "DaUsDaDa", c: Certainty.VeryHigh }],
    DaUaDaDo: { eq: "DaUaDaDa", c: Certainty.Certain },
    DaUaDaDs: { eq: "DaUaDaDa", c: Certainty.Certain },
    DaUaDoDa: [{ eq: "DaUoDoDo", c: Certainty.VeryHigh }, { eq: "DaUsDoDa", c: Certainty.VeryHigh }],
    DaUaDoDo: { eq: "DaUaDoDa", c: Certainty.Certain },
    DaUaDoDs: { eq: "DaUaDoDa", c: Certainty.Certain },
    DaUaDsDa: { eq: "DaDa", c: Certainty.AlmostCertain }, // petit-enfant
    DaUaDsDo: { eq: "DaDa", c: Certainty.AlmostCertain }, // petit-enfant
    DaUaDsDs: { eq: "DaDa", c: Certainty.AlmostCertain }, // petit-enfant
    DaUoDaDa: [{ eq: "DaUoDoDa", c: Certainty.VeryHigh }, { eq: "DaUoDsDa", c: Certainty.High }],
    DaUoDaDo: { eq: "DaUoDaDa", c: Certainty.Certain },
    DaUoDaDs: { eq: "DaUoDaDa", c: Certainty.Certain },
    DaUoDoDa: [{ eq: "DaDa", c: Certainty.Mid }, { eq: "X", c: Certainty.High }],
    DaUoDoDo: { eq: "DaUoDoDo", c: Certainty.Certain },
    DaUoDoDs: { eq: "DaUoDoDo", c: Certainty.Certain },
    DaUoDsDa: { eq: "DaDa", c: Certainty.AlmostCertain }, // petit-enfant
    DaUoDsDo: { eq: "DaDa", c: Certainty.AlmostCertain }, // petit-enfant
    DaUoDsDs: { eq: "DaDa", c: Certainty.AlmostCertain }, // petit-enfant
    DaUsDaDa: { eq: "DaDa", c: Certainty.AlmostCertain }, // petit-enfant
    DaUsDaDo: { eq: "DaDa", c: Certainty.AlmostCertain }, // petit-enfant
    DaUsDaDs: { eq: "DaDa", c: Certainty.AlmostCertain }, // petit-enfant
    DaUsDoDa: { eq: "DaDa", c: Certainty.AlmostCertain }, // petit-enfant
    DaUsDoDo: { eq: "DaDa", c: Certainty.AlmostCertain }, // petit-enfant
    DaUsDoDs: { eq: "DaDa", c: Certainty.AlmostCertain }, // petit-enfant
    DaUsDsDa: { eq: "DaDa", c: Certainty.AlmostCertain }, // petit-enfant
    DaUsDsDo: { eq: "DaDa", c: Certainty.AlmostCertain }, // petit-enfant
    DaUsDsDs: { eq: "DaDa", c: Certainty.AlmostCertain }, // petit-enfant

    UaDaUaDa: [{ eq: "UaDoUaDa", c: Certainty.High }, { eq: "UaDsUaDa", c: Certainty.Mid }],
    UaDaUaDo: [{ eq: "UaDoUaDo", c: Certainty.High }, { eq: "UaDsUaDo", c: Certainty.Mid }],
    UaDaUaDs: [{ eq: "UaDoUaDs", c: Certainty.High }, { eq: "UaDsUaDs", c: Certainty.Mid }],
    UaDaUoDa: [{ eq: "UaDoUoDa", c: Certainty.High }, { eq: "UaDsUoDa", c: Certainty.Mid }],
    UaDaUoDo: [{ eq: "UaDoUoDo", c: Certainty.High }, { eq: "UaDsUoDo", c: Certainty.Mid }],
    UaDaUoDs: [{ eq: "UaDoUoDs", c: Certainty.High }, { eq: "UaDsUoDs", c: Certainty.Mid }],
    UaDaUsDa: [{ eq: "UaDoUsDa", c: Certainty.High }, { eq: "UaDsUsDa", c: Certainty.Mid }],
    UaDaUsDo: [{ eq: "UaDoUsDo", c: Certainty.High }, { eq: "UaDsUsDo", c: Certainty.Mid }],
    UaDaUsDs: [{ eq: "UaDoUsDs", c: Certainty.High }, { eq: "UaDsUsDs", c: Certainty.Mid }],
    UaDoUaDa: [{ eq: "UaDoUoDa", c: Certainty.High }, { eq: "UaDoUsDa", c: Certainty.Mid }],
    UaDoUaDo: [{ eq: "UaDoUoDo", c: Certainty.High }, { eq: "UaDoUsDo", c: Certainty.Mid }],
    UaDoUaDs: [{ eq: "UaDoUoDs", c: Certainty.High }, { eq: "UaDoUsDs", c: Certainty.Mid }],
    UaDoUoDa: [{ eq: "UaDoUoDo", c: Certainty.High }, { eq: "UaDoUsDs", c: Certainty.Mid }],
    UaDoUoDo: [{ eq: "UoDo", c: Certainty.High }, { eq: "X", c: Certainty.VeryHigh }],
    UaDoUoDs: { eq: "UoDo", c: Certainty.AlmostCertain },
    UaDoUsDa: { eq: "UoDo", c: Certainty.AlmostCertain },
    UaDoUsDo: { eq: "UoDo", c: Certainty.AlmostCertain },
    UaDoUsDs: { eq: "UoDo", c: Certainty.AlmostCertain },
    UaDsUaDa: [{ eq: "UaDsUoDa", c: Certainty.High }, { eq: "UaDsUsDa", c: Certainty.Mid }],
    UaDsUaDo: { eq: "UoDo", c: Certainty.AlmostCertain },
    UaDsUaDs: { eq: "S", c: Certainty.AlmostCertain },
    UaDsUoDa: { eq: "UoDo", c: Certainty.AlmostCertain },
    UaDsUoDo: { eq: "UoDo", c: Certainty.AlmostCertain },
    UaDsUoDs: { eq: "S", c: Certainty.AlmostCertain },
    UaDsUsDa: [{ eq: "UaDsUsDo", c: Certainty.High }, { eq: "UaDsUsDs", c: Certainty.Mid }],
    UaDsUsDo: { eq: "UoDo", c: Certainty.AlmostCertain },
    UaDsUsDs: { eq: "S", c: Certainty.AlmostCertain },

    DaUaDaUa: [{ eq: "DaUoDaUa", c: Certainty.High }, { eq: "DaUsDaUa", c: Certainty.Mid }],
    DaUaDaUo: [{ eq: "DaUoDaUo", c: Certainty.High }, { eq: "DaUsDaUo", c: Certainty.Mid }],
    DaUaDaUs: [{ eq: "DaUoDaUs", c: Certainty.High }, { eq: "DaUsDaUs", c: Certainty.Mid }],
    DaUaDoUa: [{ eq: "DaUoDoUa", c: Certainty.High }, { eq: "DaUsDoUa", c: Certainty.Mid }],
    DaUaDoUo: [{ eq: "DaUoDoUo", c: Certainty.High }, { eq: "DaUsDoUo", c: Certainty.Mid }],
    DaUaDoUs: [{ eq: "DaUoDoUs", c: Certainty.High }, { eq: "DaUsDoUs", c: Certainty.Mid }],
    DaUaDsUa: [{ eq: "DaUoDsUa", c: Certainty.High }, { eq: "DaUsDsUa", c: Certainty.Mid }],
    DaUaDsUo: [{ eq: "DaUoDsUo", c: Certainty.High }, { eq: "DaUsDsUo", c: Certainty.Mid }],
    DaUaDsUs: [{ eq: "DaUoDsUs", c: Certainty.High }, { eq: "DaUsDsUs", c: Certainty.Mid }],
    DaUoDaUa: [{ eq: "DaUoDoUa", c: Certainty.High }, { eq: "DaUoDsUa", c: Certainty.Mid }],
    DaUoDaUo: [{ eq: "DaUoDoUo", c: Certainty.High }, { eq: "DaUoDsUo", c: Certainty.Mid }],
    DaUoDaUs: [{ eq: "DaUoDoUs", c: Certainty.High }, { eq: "DaUoDsUs", c: Certainty.Mid }],
    DaUoDoUa: [{ eq: "DaUoDoUo", c: Certainty.High }, { eq: "DaUoDsUs", c: Certainty.Mid }],
    DaUoDoUo: [{ eq: "DoUo", c: Certainty.High }, { eq: "X", c: Certainty.VeryHigh }],
    DaUoDoUs: { eq: "DoUo", c: Certainty.AlmostCertain },
    DaUoDsUa: { eq: "DoUo", c: Certainty.AlmostCertain },
    DaUoDsUo: { eq: "DoUo", c: Certainty.AlmostCertain },
    DaUoDsUs: { eq: "DoUo", c: Certainty.AlmostCertain },
    DaUsDaUa: [{ eq: "DaUsDoUa", c: Certainty.High }, { eq: "DaUsDsUa", c: Certainty.Mid }],
    DaUsDaUo: { eq: "DoUo", c: Certainty.AlmostCertain },
    DaUsDaUs: { eq: "S", c: Certainty.AlmostCertain },
    DaUsDoUa: { eq: "DoUo", c: Certainty.AlmostCertain },
    DaUsDoUo: { eq: "DoUo", c: Certainty.AlmostCertain },
    DaUsDoUs: { eq: "S", c: Certainty.AlmostCertain },
    DaUsDsUa: [{ eq: "DaUsDsUo", c: Certainty.High }, { eq: "DaUsDsUs", c: Certainty.Mid }],
    DaUsDsUo: { eq: "DoUo", c: Certainty.AlmostCertain },
    DaUsDsUs: { eq: "S", c: Certainty.AlmostCertain },
    
    UaDaDaUa: [{ eq: "UaDoDaUa", c: Certainty.VeryHigh }, { eq: "UaDsDaUa", c: Certainty.Low }],
    UaDaDaUo: [{ eq: "UaDoDaUo", c: Certainty.VeryHigh }, { eq: "UaDsDaUo", c: Certainty.Low }],
    UaDaDaUs: [{ eq: "UaDoDaUs", c: Certainty.VeryHigh }, { eq: "UaDsDaUs", c: Certainty.VeryLow }],
    UaDaDoUa: { eq: "UaDaDaUa", c: Certainty.Certain },
    UaDaDoUo: { eq: "UaDaDaUo", c: Certainty.Certain },
    UaDaDoUs: { eq: "UaDaDaUs", c: Certainty.Certain },
    UaDaDsUa: { eq: "UaDaDaUa", c: Certainty.Certain },
    UaDaDsUo: { eq: "UaDaDaUo", c: Certainty.Certain },
    UaDaDsUs: { eq: "UaDaDaUs", c: Certainty.Certain },
    UaDoDaUa: [{ eq: "UaDoDaUo", c: Certainty.High }, { eq: "UaDoDaUs", c: Certainty.High }],
    UaDoDaUo: { eq: "UoDoDoUo", c: Certainty.Certain }, // beau-frère/belle-soeur (conjoint(e) de frère/soeur)
    UaDoDaUs: { eq: "UaDo", c: Certainty.AlmostCertain }, // frère/soeur
    UaDoDoUa: { eq: "UaDoDaUa", c: Certainty.Certain },
    UaDoDoUo: { eq: "UaDoDaUo", c: Certainty.Certain },
    UaDoDoUs: { eq: "UaDoDaUa", c: Certainty.Certain },
    UaDoDsUa: { eq: "UaDoDaUa", c: Certainty.Certain },
    UaDoDsUo: { eq: "UaDoDaUo", c: Certainty.Certain },
    UaDoDsUs: { eq: "UaDoDaUs", c: Certainty.Certain },
    UaDsDaUa: [{ eq: "UaDsDaUo", c: Certainty.VeryHigh }, { eq: "UaDsDaUs", c: Certainty.VeryLow }],
    UaDsDaUo: { eq: "DaUo", c: Certainty.Certain }, // conjoint(e)
    UaDsDaUs: { eq: "S", c: Certainty.Certain }, // soi
    UaDsDoUa: { eq: "UaDsDaUa", c: Certainty.Certain },
    UaDsDoUo: { eq: "UaDsDaUo", c: Certainty.Certain },
    UaDsDoUs: { eq: "UaDsDaUs", c: Certainty.Certain },
    UaDsDsUa: { eq: "UaDsDaUa", c: Certainty.Certain },
    UaDsDsUo: { eq: "UaDsDaUo", c: Certainty.Certain },
    UaDsDsUs: { eq: "UaDsDaUs", c: Certainty.Certain },
    UoDoDoUo: { c: Certainty.High, name: "beau-frère/belle-soeur (conjoint(e) de frère/soeur)" },

    DaUaUaDa: [{ eq: "DaUoUaDa", c: Certainty.VeryHigh }, { eq: "DaUsUaDa", c: Certainty.Low }],
    DaUaUaDo: [{ eq: "DaUoUaDo", c: Certainty.VeryHigh }, { eq: "DaUsUaDo", c: Certainty.Low }],
    DaUaUaDs: [{ eq: "DaUoUaDs", c: Certainty.VeryHigh }, { eq: "DaUsUaDs", c: Certainty.VeryLow }],
    DaUaUoDa: { eq: "DaUaUaDa", c: Certainty.Certain },
    DaUaUoDo: { eq: "DaUaUaDo", c: Certainty.Certain },
    DaUaUoDs: { eq: "DaUaUaDs", c: Certainty.Certain },
    DaUaUsDa: { eq: "DaUaUaDa", c: Certainty.Certain },
    DaUaUsDo: { eq: "DaUaUaDo", c: Certainty.Certain },
    DaUaUsDs: { eq: "DaUaUaDs", c: Certainty.Certain },
    DaUoUaDa: [{ eq: "DaUoUaDo", c: Certainty.High }, { eq: "DaUoUaDs", c: Certainty.High }],
    DaUoUaDo: { eq: "DoUoUoDo", c: Certainty.Certain }, // beau-frère/belle-soeur (frère/soeur de conjoint(e))
    DaUoUaDs: { eq: "DaUo", c: Certainty.AlmostCertain }, // conjoint(e)
    DaUoUoDa: { eq: "DaUoUaDa", c: Certainty.Certain },
    DaUoUoDo: { eq: "DaUoUaDo", c: Certainty.Certain },
    DaUoUoDs: { eq: "DaUoUaDa", c: Certainty.Certain },
    DaUoUsDa: { eq: "DaUoUaDa", c: Certainty.Certain },
    DaUoUsDo: { eq: "DaUoUaDo", c: Certainty.Certain },
    DaUoUsDs: { eq: "DaUoUaDs", c: Certainty.Certain },
    DaUsUaDa: [{ eq: "DaUsUaDo", c: Certainty.VeryHigh }, { eq: "DaUsUaDs", c: Certainty.VeryLow }],
    DaUsUaDo: { eq: "UaDo", c: Certainty.AlmostCertain }, // frère/soeur
    DaUsUaDs: { eq: "S", c: Certainty.Certain }, // soi
    DaUsUoDa: { eq: "DaUsUaDa", c: Certainty.Certain },
    DaUsUoDo: { eq: "DaUsUaDo", c: Certainty.Certain },
    DaUsUoDs: { eq: "DaUsUaDs", c: Certainty.Certain },
    DaUsUsDa: { eq: "DaUsUaDa", c: Certainty.Certain },
    DaUsUsDo: { eq: "DaUsUaDo", c: Certainty.Certain },
    DaUsUsDs: { eq: "DaUsUaDs", c: Certainty.Certain },
    DoUoUoDo: { c: Certainty.High, name: "beau-frère/belle-soeur (frère/soeur de conjoint(e))" },

    UaDaDaDa: [{ eq: "UaDoDaDa", c: Certainty.High }, { eq: "UaDsDaDa", c: Certainty.High }],
    UaDoDaDa: { eq: "UoDoDaDa", c: Certainty.Certain },
    UaDsDaDa: { eq: "DaDa", c: Certainty.Certain }, // petit-enfant
    UoDoDaDa: { c: Certainty.Certain, name: "petit-neveu/petite-nièce" },

    DaUaUaUa: [{ eq: "DaUoUaUa", c: Certainty.High }, { eq: "DaUsUaUa", c: Certainty.High }],
    DaUoUaUa: { eq: "DoUoUaUa", c: Certainty.Certain },
    DaUsUaUa: { eq: "UaUa", c: Certainty.Certain }, // grand-parent
    DoUoUaUa: { c: Certainty.Certain, name: "beau-grand-parent" },

    DaDaUaDa: [{ eq: "DaDaUoDa", c: Certainty.VeryHigh }, { eq: "DaDaUsDa", c: Certainty.VeryHigh }],
    DaDaUoDa: [{ eq: "DaDaUoDo", c: Certainty.VeryHigh }, { eq: "DaDaUoDs", c: Certainty.VeryHigh }],
    DaDaUoDo: [{ eq: "DaDa", c: Certainty.Mid }, { eq: "X", c: Certainty.Mid }],
    DaDaUoDs: { eq: "DaDa", c: Certainty.AlmostCertain }, // petit-enfant
    DaDaUsDa: { eq: "DaDa", c: Certainty.AlmostCertain }, // petit-enfant
    DaDaUsDo: { eq: "DaDa", c: Certainty.AlmostCertain }, // petit-enfant
    DaDaUsDs: { eq: "DaDa", c: Certainty.AlmostCertain }, // petit-enfant

    DaDaDaUa: [{ eq: "DaDaDaUo", c: Certainty.High }, { eq: "DaDaDaUs", c: Certainty.High }],
    DaDaDaUo: { eq: "DaDaDoUo", c: Certainty.Certain }, // beau-petit-enfant,
    DaDaDaUs: { eq: "DaDa", c: Certainty.Certain }, // petit-enfant
    DaDaDoUo: { c: Certainty.Certain, name: "beau-petit-enfant"},

    DaDaDaDa: { c: Certainty.High, name: "arrière-arrière-petit-enfant" },

}
