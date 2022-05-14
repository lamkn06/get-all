import {
  ExclamationCircleOutlined,
  MoreOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';
import {
  Button,
  Col,
  Modal,
  notification,
  Popover,
  Row,
  Space,
  Table,
  TablePaginationConfig,
  Tag,
  Typography,
} from 'antd';
import Search from 'antd/lib/input/Search';
import addonService from 'api/addon.api';
import { TableNoData } from 'components/table-no-data';
import { cleanObject, formatDateTime } from 'helpers';
import { getColumnCheckboxProps } from 'helpers/component.helper';
import { useAppSelector } from 'hooks/app-hooks';
import { usePermissions } from 'hooks/usePermission';
import {
  setCurrentAddon,
  setEditing,
  setTable,
  setVisible,
} from 'pages/restaurant-management/redux/addon';
import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { AddonType } from 'types/addon';

interface Props {
  loading: boolean;
  addons: AddonType[];
  onSuccess(): void;
}

export const ListAddon: React.FC<Props> = ({ addons, loading, onSuccess }) => {
  const { canDelete, canCreate, canEdit } = usePermissions({
    module: 'manage_restaurants',
  });

  const { table } = useAppSelector(state => state.addonManagement);

  const { total, pageSize, pageIndex } = table;

  const dispatch = useDispatch();
  const onRowClick = (addon: AddonType) => {
    dispatch(setCurrentAddon(addon));
    dispatch(setVisible(true));
    dispatch(setEditing(false));
  };

  const handleAddNew = () => {
    dispatch(setCurrentAddon(undefined));
    dispatch(setVisible(true));
    dispatch(setEditing(true));
  };

  const handleOnEdit = (addon: AddonType) => {
    dispatch(setCurrentAddon(addon));
    dispatch(setVisible(true));
    dispatch(setEditing(true));
  };

  const handleSearch = useCallback(
    (text: string) => {
      dispatch(
        setTable({
          ...table,
          pageIndex: 1,
          filter: {
            name: text,
          },
        }),
      );
    },
    [setTable],
  );

  const handleOnDelete = (addon: AddonType) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this add on?',
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
            await addonService.delete(addon.id);
            notification.success({
              message: `Delete ${addon.name} successful!`,
            });
            onSuccess();
            resolve('');
          } catch (error) {
            reject(error);
          }
        });
      },
    });
  };

  const onTableChange = ({ current, pageSize }: TablePaginationConfig) => {
    dispatch(setTable({ ...table, pageIndex: current, pageSize }));
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => name || <TableNoData />,
    },
    {
      title: 'Description',
      dataIndex: ['description'],
      key: 'description',
      render: (description: string) => description || <TableNoData />,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      ...getColumnCheckboxProps([
        { text: 'Single', value: 'single' },
        { text: 'Multiple', value: 'multiple' },
      ]),
      render: (type: string) =>
        (
          <Tag color={'green'} className="text-capitalize">
            {type}
          </Tag>
        ) || <TableNoData />,
    },
    {
      title: 'Date Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt: string) =>
        createdAt ? formatDateTime(createdAt) : <TableNoData />,
    },
    {
      title: 'Date Updated',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (updatedAt: string) =>
        updatedAt ? formatDateTime(updatedAt) : <TableNoData />,
    },
    {
      key: 'action',
      width: 60,
      fixed: 'right' as any,
      render: (addon: AddonType) => {
        if (!canEdit && !canDelete) {
          return <></>;
        }
        return (
          <Popover
            placement="left"
            trigger="focus"
            content={
              <Space direction="vertical">
                {canEdit && (
                  <Button
                    block
                    size="small"
                    onClick={ev => {
                      ev.stopPropagation();
                      handleOnEdit(addon);
                    }}
                  >
                    Edit
                  </Button>
                )}
                {canDelete && (
                  <Button
                    danger
                    block
                    size="small"
                    onClick={ev => {
                      ev.stopPropagation();
                      handleOnDelete(addon);
                    }}
                  >
                    Delete
                  </Button>
                )}
              </Space>
            }
          >
            <Button
              onClick={ev => ev.stopPropagation()}
              icon={<MoreOutlined />}
              shape="circle"
            />
          </Popover>
        );
      },
    },
  ];

  return (
    <div>
      <Row justify="space-between" className="mb-1" gutter={10}>
        <Col md={{ span: 8 }} sm={{ span: 24 }}>
          <Search
            defaultValue={table.filter?.name}
            placeholder="input search text"
            onSearch={handleSearch}
          />
        </Col>
        {canCreate && (
          <Space>
            <Col md={{ span: 12 }} sm={{ span: 24 }} className="text-right">
              <Button
                type="primary"
                ghost
                icon={<PlusCircleOutlined />}
                onClick={handleAddNew}
              >
                Add new addon
              </Button>
            </Col>
          </Space>
        )}
      </Row>

      <Table
        loading={loading}
        rowKey="id"
        columns={columns}
        dataSource={addons}
        onChange={onTableChange}
        pagination={{ total, pageSize, current: pageIndex }}
        scroll={{
          x: 800,
          y: `calc(100vh - 320px)`,
        }}
        onRow={record => {
          return {
            onClick: () => onRowClick(record),
          };
        }}
      />
    </div>
  );
};
