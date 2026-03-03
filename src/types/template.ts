export interface RequiredField {
  fieldName: string;
  fieldType: 'text' | 'password' | 'number' | 'email' | 'url' | 'ip' | 'port' | 'domain' | 'select' | 'textarea';
  description?: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
}

export interface CommandVariant {
  name: string;
  commandTemplate: string;
}

export interface RatingEntry {
  _id: string;
  userId: string;
  username: string;
  score: number;
  comment?: string;
  createdAt: string;
}

export interface Template {
  _id: string;
  name: string;
  description: string;
  longDescription?: string;
  category: string;
  subcategory?: string;
  tool: string;
  targetSystem: string;
  attackProtocol?: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  commandTemplate: string;
  requiredFields: RequiredField[];
  variants?: CommandVariant[];
  tags: string[];
  ratings: {
    averageRating: number;
    totalRatings: number;
    userRating?: number;
  };
  recentRatings?: RatingEntry[];
  usageCount: number;
  viewCount: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    _id: string;
    username: string;
  };
  isFeatured: boolean;
  published: boolean;
  isPrivate: boolean;
}

export interface FilterOptions {
  categoriesHierarchy: Record<string, string[]>;
  categories: string[];
  targetSystems: string[];
  difficulties: string[];
  platforms: string[];
  tools: string[];
  protocols: string[];
}

export interface TemplateFilters {
  search?: string;
  category?: string;
  tool?: string;
  targetSystem?: string;
  difficulty?: string;
  protocol?: string;
  minRating?: number;
  sort?: 'newest' | 'mostUsed' | 'topRated';
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

export interface AdminStats {
  totalTemplates: number;
  publishedTemplates: number;
  totalCommandsGenerated: number;
  averageRating: number;
}

export interface PublicStats {
  templates: number;
  mainCategories: number;
  subcategories: number;
  tools: number;
  users: number;
}
