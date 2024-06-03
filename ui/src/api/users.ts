import { TreeItem, TreeItems } from '../components/FolderSortableTree/FolderSortableTree';
import { postRequest, deleteRequest, patchRequest, getRequest, Response, Payload } from './helpers';

export const addUser = (payload: TreeItem): Promise<Response<TreeItem>> => postRequest('users', {...payload});

export const deleteUser = (id: string): Promise<Response<void>> => deleteRequest(`users/${id}`);

export const updateUser = (payload: { id: string; parentId: string; position: number }): Promise<Response<TreeItem>> => patchRequest(`users/${payload.id}`, payload);

export const getUsersTree = (): Promise<Response<TreeItems>>  => getRequest('users');
