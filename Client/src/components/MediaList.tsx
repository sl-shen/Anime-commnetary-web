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
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {media.map((item) => (
        <Link to={`/media/${item.id}`} key={item.id} className="block">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <img src={item.image} alt={item.title} className="w-full h-48 object-cover" />
            <div className="p-2">
              <h3 className="text-sm font-medium truncate">{item.title}</h3>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default MediaList;
