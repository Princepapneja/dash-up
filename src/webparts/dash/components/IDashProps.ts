import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IDashProps {
  listId: string;
  selectedFields: string[];
  chartType: string;
  chartTitle: string;
  colors: string[];
  context:WebPartContext
}
