/* eslint-disable no-empty */
/* eslint-disable no-console */
import {
  Button,
  Form,
  Input,
  notification,
  Popconfirm,
  Row,
  Space,
  Spin,
  Switch,
  Tree,
  Typography,
} from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import roleService from 'api/role.api';
import { Drawer } from 'components/drawer';
import { AccessActions, MODULES } from 'constants/index';
import { buildMessage } from 'helpers';
import { useAppSelector } from 'hooks/app-hooks';
import { usePermissions } from 'hooks/usePermission';
import { keys } from 'lodash';
import { setEditing, setVisible } from 'pages/role-management/redux/slice';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { RoleType } from 'types';
import { RoleAccessesRequest } from 'types/role';
import { validateMessages } from 'validators';
import './index.scss';

const { Title, Text } = Typography;

interface Props {
  loading: boolean;

  onSuccess: () => void;
}

export const EditRole: React.FC<Props> = ({ onSuccess, loading }) => {
  const { canEdit } = usePermissions({
    module: MODULES.MANAGE_ROLES,
  });

  const { modules } = useAppSelector(state => state.modules);

  const [form] = Form.useForm();
  const [treeData, setTreeData] = useState(undefined);
  const [checkedKeys, setCheckedKeys] = useState<string[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

  const [roleAccessesRequest, setRoleAccessesRequest] = useState<
    RoleAccessesRequest[]
  >([]);

  const dispatch = useDispatch();

  const { visible, currentRole, isEditing } = useAppSelector(
    state => state.roleManagement,
  );

  useEffect(() => {
    if (!currentRole || !visible) {
      return;
    }

    form.setFieldsValue({
      ...currentRole,
      status: currentRole.status === 'active',
    });
  }, [currentRole, visible]);

  useEffect(() => {
    if (!modules) {
      return;
    }

    setTreeData(
      modules.map(module => {
        return {
          title: module.key.replace(/_/g, ' '),
          key: module.key,
          children: module.rolesList.map(role => {
            return {
              title: role.replace('can', 'Can '),
              key: `${module.key}-${role}`,
              value: role,
              parent: module.key,
            };
          }),
        };
      }),
    );
  }, [modules, visible]);

  useEffect(() => {
    if (!currentRole) {
      setCheckedKeys([]);
      setExpandedKeys([]);
      return;
    }

    const checkedKeys = currentRole.roleAccesses.reduce((acc, val) => {
      Object.keys(val).forEach(key => {
        if (AccessActions.includes(key) && val[key] === true) {
          acc.push(`${val.module.key}-${key}`);
        }
      });
      return acc;
    }, []);

    setCheckedKeys(checkedKeys);
    setExpandedKeys(checkedKeys);
  }, [currentRole, visible]);

  useEffect(() => {
    return () => {
      form.resetFields();
    };
  }, [visible]);

  const handleClose = () => {
    setTreeData(undefined);
    setCheckedKeys([]);
    setExpandedKeys([]);
    dispatch(setVisible(false));
  };

  const handleEdit = () => dispatch(setEditing(true));

  const handleSubmit = async () => {
    try {
      const formValues = await form.validateFields();
      const role = {
        ...formValues,
        status: formValues.status === true ? 'active' : 'inactive',
      } as RoleType;

      if (currentRole) {
        // Update
        Promise.all([
          await roleService.update({
            ...role,
            id: currentRole.id,
          }),
          await roleService.updatePermissions(
            currentRole.id,
            roleAccessesRequest,
          ),
        ]);
      } else {
        // Create new
        await roleService.create({
          ...role,
          roleAccesses: roleAccessesRequest as any,
        });
      }

      notification.success({
        message: buildMessage({
          isCreate: !currentRole,
          name: formValues.name,
        }),
      });

      handleClose();
      onSuccess();
    } catch (error) {
      console.error(error);
    }
  };

  const title =
    isEditing && currentRole
      ? 'Edit Role'
      : currentRole
      ? 'Role Info'
      : 'Create a new role';

  const readOnly = !isEditing;

  const onExpanded = selectedKeys => {
    setExpandedKeys(selectedKeys);
  };

  const onCheck = (checkedKeys, info) => {
    const roleAccesses = info.checkedNodes.reduce((acc, val) => {
      const found = acc.find(a => a.key === val.parent);
      const value = { [val.value]: true };
      if (found) {
        found.info = {
          ...found.info,
          ...value,
        };
      }
      if (!found && !!val.parent) {
        acc.push({ key: val.parent, info: value });
      }

      return acc;
    }, []);

    form.setFieldsValue({
      ...form.getFieldsValue(),
      roleAccesses,
    });
    const canLists = roleAccesses.map(r => `${r.key}-canList`);

    setTreeData(
      treeData.map(tree => {
        return {
          ...tree,
          children: tree.children.map(child => {
            const role = roleAccesses.find(role => role.key === tree.key);
            if (!role) {
              return {
                ...child,
                disabled: false,
              };
            }

            const childKeys = keys(role.info);
            if (childKeys.length === 1 && childKeys[0] === 'canList') {
              return {
                ...child,
                disabled: false,
              };
            }
            return {
              ...child,
              disabled: childKeys.length > 0 && child.value === 'canList',
            };
          }),
        };
      }),
    );

    setRoleAccessesRequest(roleAccesses);
    setCheckedKeys([...canLists, ...checkedKeys]);
  };

  return (
    <div className="role-edit">
      <Drawer
        title={title}
        width={500}
        visible={visible}
        onClose={handleClose}
        footer={
          <Space size={16}>
            {isEditing && (
              <Popconfirm
                title="Discard changes made in the profile information?"
                cancelText="Cancel"
                okText="Discard"
                onConfirm={handleClose}
              >
                <Button className="float-right" type="ghost">
                  Cancel
                </Button>
              </Popconfirm>
            )}

            {isEditing ? (
              <Button onClick={handleSubmit} type="primary" loading={loading}>
                {currentRole?.id ? 'Update role' : 'Add role'}
              </Button>
            ) : (
              canEdit && (
                <Button onClick={handleEdit} loading={loading}>
                  Edit
                </Button>
              )
            )}
          </Space>
        }
      >
        <Spin spinning={loading}>
          <Form
            form={form}
            layout="vertical"
            hideRequiredMark
            scrollToFirstError
            validateMessages={validateMessages}
          >
            <Title level={5}>INFORMATION</Title>
            <Form.Item
              name="name"
              label="Role Name"
              rules={[{ required: true }]}
            >
              <Input disabled={readOnly} placeholder="Role Name" />
            </Form.Item>
            <Form.Item name="description" label="Role Description">
              <TextArea placeholder="Description" disabled={readOnly} />
            </Form.Item>
            <Row align="middle" justify="space-between">
              <Text>Status</Text>
              <Form.Item
                valuePropName={'checked'}
                name="status"
                className="mb-0"
              >
                <Switch
                  disabled={readOnly}
                  checkedChildren="Active"
                  unCheckedChildren="Inactive"
                />
              </Form.Item>
            </Row>
            <Title level={5}>PERMISSIONS</Title>
            <Form.Item
              name="roleAccesses"
              rules={[
                { required: true, message: 'Select at least one role access' },
              ]}
              className={'role-accesses'}
            />
            {!loading && (
              <Tree
                disabled={readOnly}
                checkable
                checkedKeys={checkedKeys}
                expandedKeys={expandedKeys}
                onExpand={onExpanded}
                onCheck={onCheck}
                titleRender={nodeData => (
                  <Text className="text-capitalize">{nodeData.title}</Text>
                )}
                treeData={treeData}
              />
            )}
          </Form>
        </Spin>
      </Drawer>
    </div>
  );
};
