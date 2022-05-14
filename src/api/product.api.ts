import axios from 'axios';
import { PRODUCT_API } from 'api';
import { ResType } from 'types';
import { ProductType } from 'types/product';

class ProductService {
  get(params = '') {
    return axios.get<ResType>(`${PRODUCT_API}?${params}`);
  }
  create(payload: ProductType) {
    return axios.post<ProductType>(`${PRODUCT_API}`, payload);
  }
  update(payload: ProductType) {
    return axios.patch<ProductType>(`${PRODUCT_API}/${payload.id}`, payload);
  }
  delete(id: string) {
    return axios.delete<ProductType>(`${PRODUCT_API}/${id}`);
  }
  upload(id: string, formData: FormData) {
    return axios.post<ProductType>(
      `${PRODUCT_API}/${id}/upload-image`,
      formData,
    );
  }
  uploadFile(id: string, formData: FormData) {
    return axios.post<ProductType>(
      `${PRODUCT_API}/${id}/upload-product-excel`,
      formData,
    );
  }
}

const productService = new ProductService();
export default productService;
