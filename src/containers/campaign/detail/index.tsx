/* eslint-disable no-console */
import {
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  LinkOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Empty,
  Modal,
  notification,
  Row,
  Space,
  Spin,
  Typography,
} from 'antd';
import Meta from 'antd/lib/card/Meta';
import campaignService from 'api/campaign.api';
import { MODULES } from 'constants/index';
import { PATHS } from 'constants/paths';
import { usePermissions } from 'hooks/usePermission';
import {
  setCampaignItem,
  setEditing,
  setVisible,
} from 'pages/campaign-management/id/redux/slice';
import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { CampaignItem, CampaignType } from 'types/campaign';
import './index.scss';

interface InfoProp {
  loading: boolean;
  campaign: CampaignType;
  onSuccess: () => void;
}

export const CampaignDetail: React.FC<InfoProp> = ({
  campaign,
  loading,
  onSuccess,
}) => {
  const { canCreate, canDelete, canEdit } = usePermissions({
    module: MODULES.MANAGE_CAMPAIGNS,
  });

  const { key } = useParams();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleAddNew = () => {
    dispatch(setCampaignItem(undefined));
    dispatch(setVisible(true));
    dispatch(setEditing(true));
  };

  const handleRemoveItem = useCallback(async (item: CampaignItem) => {
    try {
      Modal.confirm({
        title: 'Are you sure you want to delete this Item?',
        icon: <ExclamationCircleOutlined />,
        content: (
          <Typography.Text type="warning">
            Note: You cannot undo this action
          </Typography.Text>
        ),
        okText: 'Yes',
        okType: 'danger',
        cancelText: 'No',
        centered: true,
        onOk() {
          // eslint-disable-next-line no-async-promise-executor
          return new Promise(async (resolve, reject) => {
            try {
              await campaignService.deleteItem(key, item.campaignItemId);
              notification.success({
                message: `Delete ${item.title} successful!`,
              });
              onSuccess();
              resolve('');
            } catch (error) {
              reject(error);
            }
          });
        },
      });
    } catch (error) {
      console.error(error);
    }
  }, []);

  const handleEditItem = (campaignItem: CampaignItem) => {
    dispatch(setCampaignItem(campaignItem));
    dispatch(setVisible(true));
    dispatch(setEditing(true));
  };

  return (
    <Spin className="campaign-detail" spinning={loading}>
      <Row align="middle" justify="space-between">
        <Space size={50}>
          <Typography.Title level={4} type="warning" style={{ margin: 0 }}>
            {campaign?.title}
          </Typography.Title>
        </Space>
        <Col md={{ span: 14 }} sm={{ span: 24 }} className="text-right">
          <Space>
            {canCreate && (
              <Button
                type="primary"
                ghost
                icon={<PlusCircleOutlined />}
                onClick={handleAddNew}
              >
                Add new item
              </Button>
            )}
            <Button
              type="primary"
              onClick={() => navigate(PATHS.CampaignManagement)}
            >
              Back to list
            </Button>
          </Space>
        </Col>
      </Row>
      {campaign?.items?.length > 0 ? (
        <div className="items">
          <Row gutter={[16, 24]}>
            {campaign?.items?.map(item => {
              const actions = [];
              if (canEdit) {
                actions.push(
                  <EditOutlined
                    key="edit"
                    onClick={() => handleEditItem(item)}
                  />,
                );
              }

              if (canDelete) {
                actions.push(
                  <DeleteOutlined
                    key="remove"
                    onClick={() => handleRemoveItem(item)}
                  />,
                );
              }

              if (item.url) {
                actions.push(
                  <LinkOutlined
                    key="more"
                    onClick={() => window.open(item.url, '_blank').focus()}
                    disabled={!item.url}
                  />,
                );
              }
              return (
                <Col key={item.campaignItemId}>
                  <Card
                    className="card-image"
                    style={{ width: 180 }}
                    cover={
                      <img
                        alt={item.title}
                        src={item.imagePath}
                        width={180}
                        height={180}
                      />
                    }
                    actions={actions}
                  >
                    <Meta
                      description={
                        <Space direction="vertical" size={5}>
                          <span>
                            <Typography.Text strong>Title:</Typography.Text>{' '}
                            {item.title}
                          </span>
                          <span>
                            <Typography.Text strong>Sale Off:</Typography.Text>{' '}
                            {item.saleOff * 100}%
                          </span>
                          <span>
                            <Typography.Text strong>
                              Description
                            </Typography.Text>{' '}
                            {item.description}
                          </span>
                        </Space>
                      }
                    />
                  </Card>
                </Col>
              );
            })}
          </Row>
        </div>
      ) : (
        <Empty />
      )}
    </Spin>
  );
};
