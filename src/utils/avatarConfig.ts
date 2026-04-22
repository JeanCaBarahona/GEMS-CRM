// Lista de avatares disponibles para el sistema Customer Touch
export interface AvatarOption {
  id: string;
  name: string;
  path: string;
  color: string;
}

export const IDENTITY_AVATARS: AvatarOption[] = [
  {
    id: 'ruby',
    name: 'Rubí',
    path: '/src/assets/avatars/ruby.svg',
    color: '#FF6B6B'
  },
  {
    id: 'emerald',
    name: 'Esmeralda',
    path: '/src/assets/avatars/emerald.svg',
    color: '#50C878'
  },
  {
    id: 'sapphire',
    name: 'Zafiro',
    path: '/src/assets/avatars/sapphire.svg',
    color: '#87CEEB'
  },
  {
    id: 'diamond',
    name: 'Diamante',
    path: '/src/assets/avatars/diamond.svg',
    color: '#E6E6FA'
  },
  {
    id: 'amethyst',
    name: 'Amatista',
    path: '/src/assets/avatars/amethyst.svg',
    color: '#DDA0DD'
  },
  {
    id: 'topaz',
    name: 'Topacio',
    path: '/src/assets/avatars/topaz.svg',
    color: '#FFD700'
  }
];

// Función para obtener avatar por ID
export const getAvatarById = (id: string): AvatarOption | undefined => {
  return IDENTITY_AVATARS.find(avatar => avatar.id === id);
};

// Función para obtener avatar por defecto
export const getDefaultAvatar = (): AvatarOption => {
  return IDENTITY_AVATARS[0]; // Ruby como defecto
};