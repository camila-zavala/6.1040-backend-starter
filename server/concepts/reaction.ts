import { BaseDoc } from "../framework/doc";
import UserConcept from "./user";



export interface ReactionDoc extends BaseDoc {
  to: UserConcept;
  from: UserConcept;
  content: string; 
  
}

export default class ReactionConcept {
    
}