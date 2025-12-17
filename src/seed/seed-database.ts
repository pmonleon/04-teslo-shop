import { create } from 'zustand';
import { initialData } from './seed';
import prisma from '../lib/prisma';
import { Category } from '../generated/prisma/index';



async function main() {

  // 1. Borrar registros previos
  // await Promise.all( [
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  // ]);
  
  const { categories, products } = initialData;


  //  Categorias
  // {
  //   name: 'Shirt'
  // }
  const categoriesData = categories.map( (name) => ({ name }));
  
  await prisma.category.createMany({
    data: categoriesData
  });

  
  const categoriesDB = await prisma.category.findMany() as Category[];
  
  const categoriesMap = categoriesDB.reduce<Record<string, string>>( (map, category) => {
    map[ category.name.toLowerCase()] = category.id;
    return map;
  }, {} ); //<string=shirt, string=categoryID>
  
  

  // Productos

  products.forEach( async(product) => {

    const { type, images, ...rest } = product;

    const dbProduct = await prisma.product.create({
      data: {
        ...rest,
        categoryId: categoriesMap[type]
      }
    })


    // Images
    const imagesData = images.map( image => ({
      url: image,
      productId: dbProduct.id
    }));

    await prisma.productImage.createMany({
      data: imagesData
    });

  });





  console.log( 'Seed ejecutado correctamente' );
}









( () => {

  if ( process.env.NODE_ENV === 'production' ) return;


  main();
} )();
