export const ProductCategories = {
  electronics: {
    title: 'Электроника',
    children: {
      smartphones: 'Смартфоны и аксессуары',
      computers: 'Компьютеры и ноутбуки',
      components: 'Комплектующие',
      peripherals: 'Периферия',
      tv_audio: 'ТВ, аудио, видео',
      smart_home: 'Умный дом',
      photo_video: 'Фото и видеотехника'
    }
  },

  fashion: {
    title: 'Одежда, обувь и аксессуары',
    children: {
      clothing: 'Одежда',
      shoes: 'Обувь',
      accessories: 'Аксессуары',
      underwear: 'Нижнее бельё',
      workwear: 'Спецодежда'
    }
  },

  home: {
    title: 'Дом и интерьер',
    children: {
      furniture: 'Мебель',
      lighting: 'Освещение',
      decor: 'Декор',
      textiles: 'Текстиль',
      storage: 'Хранение вещей'
    }
  },

  appliances: {
    title: 'Бытовая техника',
    children: {
      large: 'Крупная техника',
      small: 'Мелкая техника',
      kitchen: 'Кухонная техника',
      climate: 'Климатическая техника'
    }
  },

  beauty_health: {
    title: 'Красота и здоровье',
    children: {
      cosmetics: 'Косметика',
      personal_care: 'Уход за телом и лицом',
      perfume: 'Парфюмерия',
      health: 'Товары для здоровья',
      medical: 'Медицинские изделия'
    }
  },

  kids: {
    title: 'Детские товары',
    children: {
      toys: 'Игрушки',
      clothing: 'Детская одежда',
      baby: 'Товары для младенцев',
      school: 'Школа и творчество'
    }
  },

  sport: {
    title: 'Спорт и отдых',
    children: {
      fitness: 'Спортивные товары',
      outdoor: 'Туризм и кемпинг',
      cycling: 'Велотовары',
      trainers: 'Тренажёры',
      leisure: 'Активный отдых'
    }
  },

  auto: {
    title: 'Авто и мото',
    children: {
      parts: 'Запчасти',
      accessories: 'Аксессуары',
      tools: 'Инструменты',
      electronics: 'Автоэлектроника'
    }
  },

  construction: {
    title: 'Строительство и ремонт',
    children: {
      tools: 'Инструменты',
      materials: 'Стройматериалы',
      plumbing: 'Сантехника',
      electrical: 'Электрика',
      finishing: 'Отделочные материалы'
    }
  },

  garden: {
    title: 'Сад и дача',
    children: {
      plants: 'Растения',
      equipment: 'Инвентарь',
      machinery: 'Садовая техника',
      outdoor_furniture: 'Мебель для улицы'
    }
  },

  hobby: {
    title: 'Хобби и развлечения',
    children: {
      board_games: 'Настольные игры',
      collectibles: 'Коллекционирование',
      music: 'Музыкальные инструменты',
      handmade: 'Творчество и рукоделие'
    }
  },

  books_office: {
    title: 'Книги и канцелярия',
    children: {
      books: 'Книги',
      education: 'Учебные материалы',
      stationery: 'Канцелярские товары',
      office: 'Офисные принадлежности'
    }
  },

  food: {
    title: 'Продукты и напитки',
    children: {
      groceries: 'Продукты питания',
      drinks: 'Напитки',
      sport_nutrition: 'Спортивное питание',
      diet: 'Диетические продукты'
    }
  },

  digital: {
    title: 'Цифровые товары',
    children: {
      subscriptions: 'Подписки',
      activation_keys: 'Коды активации',
      software: 'Программное обеспечение',
      courses: 'Онлайн-курсы'
    }
  },

  other: {
    title: 'Прочее',
    children: {
      antiques: 'Антиквариат',
      handmade: 'Ручная работа',
      unique: 'Уникальные товары'
    }
  }
};

export interface AddProductRequest {
  title: string;
  description?: string;
  category: string;
  subcategory: string;
  quantity: number;
  price: number;
  discountedPrice?: number;
  images: string[];
  visibility?: boolean;
}
