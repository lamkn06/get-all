export interface CampaignType {
  campaignId: number;
  title: string;
  key: string;
  isActive: boolean;
  sliderItemNumber: number;
  items: CampaignItem[];
}

export interface CampaignItem {
  campaignItemId: number;
  campaignId: number;
  imagePath: string;
  title: string;
  url?: string;
  description?: string;
  saleOff?: number;
}

export interface CampaignItemRequest {
  image: File;
  title: string;
  url: string;
  description: string;
}
