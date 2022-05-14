/* eslint-disable no-console */

import campaignService from 'api/campaign.api';
import { EditCampaign } from 'containers/campaign/editCampaign';
import { ListCampaign } from 'containers/campaign/list';
import { serializeQuery } from 'helpers';
import { useAppSelector } from 'hooks/app-hooks';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { CampaignType } from 'types/campaign';
import { useInjectReducer } from 'utils/redux-injectors';
import reducer, { setTable } from './redux/slice';

const CampaignManagement = () => {
  useInjectReducer({ key: 'campaignManagement', reducer });

  const [loading, setLoading] = useState(false);

  const [campaigns, setCampaigns] = useState<CampaignType[]>([]);

  const { tablePagination } = useAppSelector(state => state.campaignManagement);

  const params = serializeQuery(tablePagination);
  const dispatch = useDispatch();

  useEffect(() => {
    fetchCampaigns();
  }, [tablePagination.pageIndex, tablePagination.filter]);

  useEffect(() => {
    return () => {
      dispatch(setTable({ ...tablePagination, filter: undefined }));
    };
  }, []);

  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      const res = await campaignService.getList(params);
      const { data } = res;
      setCampaigns(data.results.filter(campaign => !campaign.isDefault));
      dispatch(setTable({ ...tablePagination, total: data.totalRecords }));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [params]);

  return (
    <div className="campaign-management">
      <ListCampaign loading={loading} campaigns={campaigns} />
      <EditCampaign onSuccess={fetchCampaigns} loading={loading} />
    </div>
  );
};

export default CampaignManagement;
