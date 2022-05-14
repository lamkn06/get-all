import { RESTAURANT_CATEGORY_API } from 'api';
import { categoryService } from 'api/categoryService.api';

const restaurantCategoryService = new categoryService(RESTAURANT_CATEGORY_API);

export default restaurantCategoryService;
