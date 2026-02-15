import { DataDomainEnum, OrgTypeEnum } from "@/types/organization";
import { DataDomain, OrgType } from "@/data/countries";

export const ORG_TYPE_LABELS: Record<OrgTypeEnum, string> = {
  WEATHER_STATION: "Weather Station",
  HOSPITAL: "Hospital",
  RESEARCH_INSTITUTION: "Research",
  GOVERNMENT: "Government",
  OTHER: "Other",
};

export const DATA_DOMAIN_LABELS: Record<DataDomainEnum, string> = {
  HEALTH: "Health Data",
  POLLUTION: "Pollution Data",
};

export const isHealthDomain = (value: DataDomainEnum | string | undefined | null) =>
  value === "HEALTH";

const ORG_TYPE_LABEL_TO_ENUM: Record<OrgType, OrgTypeEnum> = {
  "Weather Station": "WEATHER_STATION",
  "Hospital": "HOSPITAL",
  "Research": "RESEARCH_INSTITUTION",
  "Government": "GOVERNMENT",
  "Other": "OTHER",
};

const DATA_DOMAIN_LABEL_TO_ENUM: Record<DataDomain, DataDomainEnum> = {
  "Health Data": "HEALTH",
  "Pollution Data": "POLLUTION",
};

export const mapOrgTypeLabelToEnum = (
  value: OrgType | OrgTypeEnum | string | undefined | null
): OrgTypeEnum | undefined => {
  if (!value) return undefined;
  if ((value as OrgTypeEnum) in ORG_TYPE_LABELS) return value as OrgTypeEnum;
  return ORG_TYPE_LABEL_TO_ENUM[value as OrgType];
};

export const mapDataDomainLabelToEnum = (
  value: DataDomain | DataDomainEnum | string | undefined | null
): DataDomainEnum | undefined => {
  if (!value) return undefined;
  if ((value as DataDomainEnum) in DATA_DOMAIN_LABELS) return value as DataDomainEnum;
  return DATA_DOMAIN_LABEL_TO_ENUM[value as DataDomain];
};
