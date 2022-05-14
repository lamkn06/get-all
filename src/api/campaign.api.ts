import { CAMPAIGN_API } from 'api';
import axios from 'axios';
import { ResType } from 'types';
import { CampaignItem, CampaignType } from 'types/campaign';

interface CampaignItemResponse {
  campaignId: number;
  isActive: boolean;
  items: CampaignItem[];
  key: string;
  sliderItemNumber: number;
  title: string;
}

class CampaignService {
  getList(params: string) {
    return axios.get<ResType>(`${CAMPAIGN_API}?${params}`);
  }

  update(payload: CampaignType) {
    return axios.patch<ResType>(`${CAMPAIGN_API}/${payload.key}`, payload);
  }

  getItems(key: string) {
    return axios.get<CampaignItemResponse>(`${CAMPAIGN_API}/${key}/items`);
  }

  createdItem(key: string, payload: FormData) {
    return axios.post<ResType>(`${CAMPAIGN_API}/${key}/items`, payload);
  }

  updateItem(key: string, id: number, payload: FormData) {
    return axios.patch<ResType>(`${CAMPAIGN_API}/${key}/items/${id}`, payload);
  }

  deleteItem(key: string, id: number) {
    return axios.delete<ResType>(`${CAMPAIGN_API}/${key}/items/${id}`);
  }
}

const campaignService = new CampaignService();

export default campaignService;
