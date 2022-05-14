import { PRODUCT_CATEGORY_API } from 'api';
import { categoryService } from 'api/categoryService.api';

const productCategoryService = new categoryService(PRODUCT_CATEGORY_API);

export default productCategoryService;
