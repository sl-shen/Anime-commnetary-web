import React from 'react';
import { Link } from 'react-router-dom';

interface Media {
  id: number;
  title: string;
  image: string;
}

interface MediaListProps {
  media: Media[];
}

const MediaList: React.FC<MediaListProps> = ({ media }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
      {media.map((item) => (
        <Link to={`/media/${item.id}`} key={item.id} className="block group">
          <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 transform group-hover:scale-105">
            <div className="relative">
              <img src={item.image} alt={item.title} className="w-full h-64 object-cover" />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity duration-300 flex items-center justify-center">
                <h3 className="text-white text-center font-medium px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {item.title}
                </h3>
              </div>
            </div>
            <div className="p-2 text-center">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {item.title}
              </h3>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default MediaList;