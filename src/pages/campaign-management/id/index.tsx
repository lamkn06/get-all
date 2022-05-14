/* eslint-disable no-async-promise-executor */
/* eslint-disable no-empty */
import campaignService from 'api/campaign.api';
import { CampaignDetail } from 'containers/campaign/detail';
import { EditCampaignItem } from 'containers/campaign/editItem';
import { setCurrentCampaign } from 'pages/campaign-management/list/redux/slice';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useInjectReducer } from 'redux-injectors';
import { CampaignItem, CampaignType } from 'types/campaign';
import reducer from './redux/slice';

const CampaignDetailManagement: React.FC = () => {
  const { key } = useParams();
  useInjectReducer({ key: 'campaignDetailManagement', reducer });

  const [loading, setLoading] = useState(true);

  const [campaign, setCampaign] = useState<CampaignType>(undefined);

  useEffect(() => {
    fetchDetail();
  }, [key]);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const { data } = await campaignService.getItems(key);
      setCampaign(data);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <CampaignDetail
        loading={loading}
        campaign={campaign}
        onSuccess={fetchDetail}
      />
      <EditCampaignItem onSuccess={fetchDetail} />
    </div>
  );
};

export default CampaignDetailManagement;
