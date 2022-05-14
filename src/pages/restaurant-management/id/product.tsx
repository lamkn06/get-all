/* eslint-disable no-empty */
/* eslint-disable no-console */
import addonService from 'api/addon.api';
import productService from 'api/product.api';
import productCategoryService from 'api/productCategory.api';
import { EditProduct } from 'containers/product/edit';
import { ListProduct } from 'containers/product/list';
import { serializeQuery } from 'helpers';
import { useAppSelector } from 'hooks/app-hooks';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router';
import { ProductType } from 'types/product';
import {
  setProductAddons,
  setProductCategories,
  setTable,
} from '../redux/product';

const RestaurantProduct = () => {
  const dispatch = useDispatch();
  const { id } = useParams();

  const { table: pagination } = useAppSelector(
    state => state.productManagement,
  );

  const [loading, setLoading] = useState(false);
  const params = serializeQuery({
    ...pagination,
    restaurantId: id,
  });
  const [products, setProducts] = useState<ProductType[]>([]);

  useEffect(() => {
    fetchProductCategories();
    fetchProductAddons();
  }, []);

  useEffect(() => {
    fetchProduct();
  }, [pagination.pageIndex, pagination.filter]);

  const fetchProductCategories = async () => {
    try {
      const { data } = await productCategoryService.get(`pageSize=2000`);
      dispatch(setProductCategories(data.results));
    } catch (error) {
      console.error(error);
    } finally {
    }
  };

  const fetchProductAddons = async () => {
    try {
      const { data } = await addonService.get(
        `pageSize=2000&restaurantId=${id}`,
      );

      dispatch(setProductAddons(data.results));
    } catch (error) {
      console.error(error);
    } finally {
    }
  };

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const { data } = await productService.get(params);
      setProducts(data.results);
      dispatch(setTable({ ...pagination, total: data.totalRecords }));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ListProduct
        restaurantId={id}
        products={products}
        loading={loading}
        onSuccess={fetchProduct}
      />
      <EditProduct onSuccess={fetchProduct} restaurantId={id} />
    </>
  );
};

export default RestaurantProduct;
