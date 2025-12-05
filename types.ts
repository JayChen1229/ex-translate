
export interface TranslationResponse {
  true_meaning: string;
  toxicity_level: number;
}

export enum RelationshipContext {
  FRESH_BREAKUP = "剛分手",
  GHOSTING = "已讀不回/消失",
  ZOMBIEING = "詐屍 (突然出現)",
  FRIENDZONE = "朋友卡",
  AMBIGUOUS = "曖昧不清",
  LATE_NIGHT = "深夜訊息",
  DEMANDING = "借錢/求復合"
}

export enum SenderType {
  MALE = "前男友",
  FEMALE = "前女友",
  NON_BINARY = "前任 (不分性別)",
  TOXIC_EX = "極品渣男/渣女"
}
