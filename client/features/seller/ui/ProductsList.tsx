'use client'

import { useProductsQuery } from '../hooks/useProductsQuery'
import ProductItem from './ProductItem';

const ProductsList = () => {
    const {data: products, isPending} = useProductsQuery();
    console.log(products);
    
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {isPending && <div>Загрузка...</div>}
        {products?.map((product) => (
            <ProductItem key={product.id} product={product} />
        ))}
    </div>
  )
}

export default ProductsList