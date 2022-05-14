import axios from 'axios';
import { CategoryType, ResType } from 'types';

interface CategoryResType extends Omit<ResType, 'results'> {
  results: CategoryType[];
}

export class categoryService {
  endPoint: string;
  constructor(endPoint: string) {
    this.endPoint = endPoint;
  }
  get(params = '') {
    return axios.get<CategoryResType>(`${this.endPoint}?${params}`);
  }

  create(cate: CategoryType) {
    return axios.post<CategoryType>(this.endPoint, cate);
  }

  update(cate: CategoryType) {
    return axios.patch<CategoryType>(`${this.endPoint}/${cate.id}`, cate);
  }

  delete(id: string) {
    return axios.delete<CategoryType>(`${this.endPoint}/${id}`);
  }

  upload(id: string, formData: FormData) {
    return axios.post<CategoryType>(
      `${this.endPoint}/${id}/upload-image`,
      formData,
    );
  }
}
