import React, { useContext } from 'react'
import { categories } from '../assets/assets';
import { AppContext } from '../context/AppContext';

const Category = () => {
    const {navigate}=useContext(AppContext);
  return (
    <div className='mt-16'>
      <p className='text-2xl font-medium md:text-3xl'>Categories</p>

      <div className="my-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-4">
        {categories.map((category, index) => (
          <div
          onClick={()=>{navigate(`/products/${category.path.toLowerCase()}`);
          scrollTo(0,0);
        }}
            key={index}
            style={{ backgroundColor: category.bgColor }}
            className="group cursor-pointer py-5 px-3 rounded-lg flex flex-col items-center justify-center shadow hover:shadow-lg transition"
          >
            <img
              src={category.image}
              alt={category.text}
              className="max-w-28 transition-transform group-hover:scale-110"
            />
            <p className="text-sm font-medium mt-2">{category.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Category;
