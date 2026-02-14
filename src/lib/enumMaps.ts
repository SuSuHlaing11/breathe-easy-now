import { DataDomainEnum, OrgTypeEnum } from "@/types/organization";

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
