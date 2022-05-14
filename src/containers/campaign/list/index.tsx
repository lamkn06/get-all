import { MoreOutlined } from '@ant-design/icons';
import {
  Button,
  Col,
  Popover,
  Row,
  Space,
  Table,
  TablePaginationConfig,
  Tag,
} from 'antd';
import Search from 'antd/lib/input/Search';
import { TableNoData } from 'components/table-no-data';
import { MODULES } from 'constants/index';
import { PATHS } from 'constants/paths';
import { useAppSelector } from 'hooks/app-hooks';
import { usePermissions } from 'hooks/usePermission';
import {
  setCurrentCampaign,
  setEditing,
  setTable,
  setVisible,
} from 'pages/campaign-management/list/redux/slice';
import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { CampaignType } from 'types/campaign';
import './index.scss';

interface InfoProp {
  loading: boolean;
  campaigns: CampaignType[];
}

export const ListCampaign: React.FC<InfoProp> = ({ campaigns, loading }) => {
  const { canEdit } = usePermissions({
    module: MODULES.MANAGE_CAMPAIGNS,
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { tablePagination } = useAppSelector(state => state.campaignManagement);
  const { total, pageSize, pageIndex } = tablePagination;

  const handleRowClick = (campaign: CampaignType) => {
    navigate(`${PATHS.CampaignManagement}/${campaign.key}`);
  };

  const handleSearch = useCallback(
    (text: string) => {
      dispatch(
        setTable({
          ...tablePagination,
          pageIndex: 1,
          filter: {
            keyword: text,
          },
        }),
      );
    },
    [tablePagination],
  );

  const onEdit = (campaign: CampaignType) => {
    dispatch(setCurrentCampaign(campaign));
    dispatch(setVisible(true));
    dispatch(setEditing(true));
  };

  const onTableChange = ({ current, pageSize }: TablePaginationConfig) =>
    dispatch(setTable({ ...tablePagination, pageIndex: current, pageSize }));

  const columns = [
    {
      title: 'Campaign Title',
      dataIndex: 'title',
      key: 'title',
      render: (title: string) => title || <TableNoData />,
    },
    {
      title: 'Campaign Status',
      dataIndex: 'isActive',
      render: (isActive: boolean) => {
        const color = isActive ? 'green' : 'red';
        return (
          <Tag color={color} className="text-capitalize">
            {isActive ? 'Active' : 'Inactive'}
          </Tag>
        );
      },
    },
    {
      title: 'Campaign Slider Item Number',
      dataIndex: 'sliderItemNumber',
      width: 250,
      render: (sliderItemNumber: number) => {
        return sliderItemNumber > 0
          ? `Show ${sliderItemNumber} item${sliderItemNumber > 1 ? 's' : ''}`
          : `Show All Items`;
      },
    },
    {
      key: 'action',
      width: 60,
      fixed: 'right' as any,
      render: (campaign: CampaignType) => {
        return (
          canEdit && (
            <Popover
              placement="left"
              trigger="focus"
              content={
                <Space direction="vertical">
                  <Button
                    block
                    size="small"
                    onClick={ev => {
                      ev.stopPropagation();
                      onEdit(campaign);
                    }}
                  >
                    Edit
                  </Button>
                </Space>
              }
            >
              <Button
                onClick={ev => ev.stopPropagation()}
                icon={<MoreOutlined />}
                shape="circle"
              />
            </Popover>
          )
        );
      },
    },
  ];
  return (
    <div className="campaign_list">
      <Row justify="space-between" className="mb-2" gutter={10}>
        <Col md={{ span: 8 }} sm={{ span: 24 }}>
          <Search
            defaultValue={tablePagination.filter?.keyword}
            placeholder="input search text"
            onSearch={handleSearch}
          />
        </Col>
      </Row>
      <Table
        tableLayout="fixed"
        loading={loading}
        rowKey="campaignId"
        columns={columns}
        dataSource={campaigns}
        rowClassName="campaign-list__row"
        pagination={{ total, pageSize, current: pageIndex }}
        onChange={onTableChange}
        scroll={{
          y: `calc(100vh - 322px)`,
          x: 900,
        }}
        onRow={record => {
          return {
            onClick: _ => handleRowClick(record),
          };
        }}
      />
    </div>
  );
};
